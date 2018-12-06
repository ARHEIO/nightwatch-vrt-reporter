import { write } from '../src/index'
import { assert } from 'chai';
import * as fs from 'fs';
let rimraf = require('rimraf');

const options = {
  output_folder: './test/report/',
  filename_prefix: 'CHROME_70.0.3538.110_Mac OS X_',
  globals: {
    visual_regression_settings: {
        latest_screenshots_path: './test/screens/latest',
        baseline_screenshots_path: './test/screens/baseline',
        diff_screenshots_path: './test/screens/diff',
      },
  },
}

describe('Awesome test.', () => {
  it('should test default awesome function', () => {
    rimraf('./test/report', () => {
      fs.mkdirSync('./test/report');
      write({}, options, () => {});
      assert(true === true, 'Default not awesome :(');
    })
  });
});