var fs = require('fs');

module.exports =  {
  write : function(results, options, done) {
    const globals = options.globals;

    let walkSync = function(dir, filelist) {

      if( dir[dir.length-1] != '/') dir=dir.concat('/')
    
      var fs = fs || require('fs'),
          files = fs.readdirSync(dir);
      filelist = filelist || [];
      files.forEach(function(file) {
        if (fs.statSync(dir + file).isDirectory()) {
          filelist = walkSync(dir + file + '/', filelist);
        }
        else {
          filelist.push(dir+file);
        }
      });
      return filelist;
    };

    let sortFiles = function(list) {
      validFiles = [];
      browserFileName = /^([^_]*)/.exec(options.filename_prefix.toLowerCase())[0] + '.png';
      list.forEach((item) => {
        if ( /([^\/]+$)/.exec(item.toLowerCase())[0] === browserFileName) {
          console.log(item);
        }
      })
    }

    const fileNames = walkSync(globals.visual_regression_settings.diff_screenshots_path);
    sortFiles(fileNames);

    done();
  }

}
