'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMockConfig = parseMockConfig;
exports.staticMock = staticMock;
/**
 * Generate config of full format from shorthand, for staticMock using.
 * Acceptible formats refering to @see.
 *
 * @param {Object} cfg - passed in shorthand config.
 *
 * @returns {Object} - refined config
 *
 * @see input and output formats
 * - input
 *    - {true}  => {folder:'mock'}
 *    - {string} 'mockDir' => {folder:'mockDir'},
 *    - {array}
 *      ```
 *      ['article/(\\d+)/comment/(\\d+)', 'article_$1_comment_$2_']
 *      =>
 *      {folder:'mock', rewrites:[]}
 *      ```
 *    - {Object} if 'folder' is missed, set to 'mock', or stay untouched
 *
 * - output
 *    ```
 *    {
 *      folder:'mock',
 *      rewrites:[
 *        ['article/(\\d+)/comment/(\\d+)', 'article_$1_comment_$2_']
 *      ]
 *    }
 *    ```
 */
require('babel-polyfill');

var debug = require('debug')('webpackDevserverHelper');
var joinUrl = require('url-join');

function parseMockConfig(cfg) {
  var newCfg = void 0;
  if (cfg === true) {
    newCfg = {
      folder: 'mock'
    };
  } else if (typeof cfg === 'string') {
    newCfg = {
      folder: cfg
    };
  } else if (Array.isArray(cfg)) {
    newCfg = {
      folder: 'mock',
      rewrites: cfg
    };
  } else if (!cfg.folder) {
    newCfg = cfg;
    newCfg.folder = 'mock';
  } else {
    newCfg = cfg;
  }
  return newCfg;
}

function findPathFromRewrites(path, rewrites) {
  var reg = void 0;
  var arr = rewrites.find(function (el) {
    reg = new RegExp(el[0]);
    return reg.test(path);
  });
  return arr ? path.replace(reg, arr[1]) : null;
}
/**
 * Create a path mapping function used for `devServer` config.
 * Config details referring to [webpack config example](#WebpackConfigExample).
 *
 * @param {Object} mockConfig - returned from parseMockConfig()
 * @param {string} publicPath - what is configured in webpack
 * @param {string} [ext=json] - default file extension mapped when no rewrites matched
 *
 * @returns {Function} - function mapping path to mock data file name.
 */
function staticMock(mockConfig) {
  var publicPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'json';

  return function mock(path) {
    var newPath = void 0;
    var extApplied = '';
    debug('mock from:', path);
    if (mockConfig.rewrites) {
      newPath = findPathFromRewrites(path, mockConfig.rewrites);
    } else {
      extApplied = '.' + ext;
    }
    var paths = [mockConfig.folder, (newPath || path) + extApplied];
    if (publicPath) {
      // joinUrl treats empty string as slash
      paths.unshift(publicPath);
    }
    newPath = joinUrl(paths);
    debug('mock to:', newPath);
    return newPath;
  };
}
//# sourceMappingURL=mock.js.map