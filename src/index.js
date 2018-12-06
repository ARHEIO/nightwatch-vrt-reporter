const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

/**
 * ADAM
 * __dirname is the place that the file you are writing in is located (index.js within node_modules)
 * process.cwd() is the place that the code is running from (the package.json directory)
 * If you forget this again I swear to god
 * https://medium.com/@the1mills/how-to-test-your-npm-module-without-publishing-it-every-5-minutes-1c4cb4b369be
 */
export class CreateReport {

  constructor(results, options) {
    this.results = results;
    this.options = options;
    this.globals = options.globals;
    this.browserFileName = '';
    this.validFiles = [];
  }
  
  // Get all filenames present
  walkSync(dir, filelist) {
    if (dir[dir.length - 1] != '/') dir = dir.concat('/');
    let files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = this.walkSync(`${dir + file}/`, filelist);
      } else {
        filelist.push(dir + file);
      }
    });
    return filelist;
  };
  
  // Get files from specified browser.
  getDiffFiles(list) {
    const promise = new Promise((resolve, reject) =>{
      this.browserFileName = `${/^([^_]*)/.exec(this.options.filename_prefix.toLowerCase())[0]}.png`;
      list.forEach((item) => {
        if (/([^\/]+$)/.exec(item.toLowerCase())[0] === this.browserFileName) {
          let imageName = /(?<=\.\/visual-regression\/screens\/diff).*$/.exec(item);
          this.validFiles.push({
              diffFile: item,
              latestFile: this.globals.visual_regression_settings.latest_screenshots_path + imageName,
              baselineFile: this.globals.visual_regression_settings.baseline_screenshots_path + imageName
          });
        }
      });
      resolve();
    });
    return promise;
  };

  loadHTMLTemplate() {
    const promise = new Promise((resolve, reject) =>{
      fs.readFile(path.join(__dirname, 'templates/html.template.html'), 'utf8', (err, contents) => {
        if (!err) {
          resolve(contents);
        } else {
          reject(err);
        }
      });
    });
    return promise;
  }

  // calcuates how many ../ to put before the report directory
  calculateDistance(reportDirectory) {
    let nesting = 0;
    const pattern = '../'
    if (reportDirectory[reportDirectory.length - 1] !== '/') reportDirectory = reportDirectory + '/'
    for (var i = reportDirectory.length; i > 0; i--) {
      if (reportDirectory[i] === '/' && reportDirectory[i - 1] !== '.') nesting++;
    }
    
    return pattern.repeat(nesting);
  }

  createHTML() {
    let bodyChunk = '';
    const nesting = this.calculateDistance(this.options.output_folder);
    this.validFiles.forEach((file) => {
      bodyChunk += 
      `
      <div class="diff-container">
        <img src="${nesting}/${file.diffFile}"/>
        <img src="${nesting}/${file.latestFile}"/>
        <img src="${nesting}/${file.baselineFile}"/>
      </div>
      `
    })
    return bodyChunk;
  }

  writeFileToReportDirectory(htmlFile) {
    const promise = new Promise((resolve, reject) => {
      fs.writeFile(`${this.options.output_folder}/${this.browserFileName}.html`, htmlFile, 'utf8', (err, contents) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
    return promise;
  }

  createReport() {
    const promise = new Promise((resolve, reject) => {
      this.loadHTMLTemplate()
        .then((template) => {
          let updated = template.replace(/\${htmlBody}/g, this.createHTML());
          this.writeFileToReportDirectory(updated).then(() => {
            resolve()
          })
        })
    })
    return promise;
  }

  moveBundle() {
    const promise = new Promise((resolve, reject) => {
      let styles = fse.copy(`${__dirname}/templates/styles.css`, `${this.options.output_folder}/styles.css`);
      let bundle = fse.copy(__dirname + '/templates/bundle.js', this.options.output_folder + '/bundle.js');
      Promise.all([styles, bundle]).then(() => resolve(), (err) => {throw err});
    })
    return promise;
  }

  init() {
    const appPromise = new Promise ((resolve, reject) => {
      const diffFiles = this.walkSync(this.globals.visual_regression_settings.diff_screenshots_path, [])
      this.getDiffFiles(diffFiles)
      .then(() => this.createReport(), (err) => {throw err})
      .then(() => this.moveBundle(), (err) => {throw err})
      .then(() => resolve(), (err) => { throw err });
    })
    return appPromise
  }
}

module.exports = {
  write(results, options, done) {
    let reporter = new CreateReport(results, options);
    reporter .init().then(() => {
      done();
    });
  }
}
