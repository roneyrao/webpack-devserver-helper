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
import 'babel-polyfill';

const debug = require('debug')('webpackDevserverHelper');
const joinUrl = require('url-join');

export function parseMockConfig(cfg) {
  let newCfg;
  if (cfg === true) {
    newCfg = {
      folder: 'mock',
    };
  } else if (typeof (cfg) === 'string') {
    newCfg = {
      folder: cfg,
    };
  } else if (Array.isArray(cfg)) {
    newCfg = {
      folder: 'mock',
      rewrites: cfg,
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
  let reg;
  const arr = rewrites.find((el) => {
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
export function staticMock(mockConfig, publicPath = '', ext = 'json') {
  return function mock(path) {
    let newPath;
    let extApplied = '';
    debug('mock from:', path);
    if (mockConfig.rewrites) {
      newPath = findPathFromRewrites(path, mockConfig.rewrites);
    } else {
      extApplied = `.${ext}`;
    }
    const paths = [mockConfig.folder, (newPath || path) + extApplied];
    if (publicPath) { // joinUrl treats empty string as slash
      paths.unshift(publicPath);
    }
    newPath = joinUrl(paths);
    debug('mock to:', newPath);
    return newPath;
  };
}

