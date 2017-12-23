import 'babel-polyfill';

const debug = require('debug')('webpackDevserverHelper');

const joinUrl = require('url-join');

function removeTrailingSlash(path) {
  if (path.endsWith('/')) {
    return path.substr(0, path.length - 1);
  }
  return path;
}

function parseArray(proxies, publicPath) {
  proxies.forEach((proxy) => {
    if (proxy.context && Array.isArray(proxy.context)) {
      /* eslint-disable no-param-reassign */
      let rewrite;
      if (!proxy.pathRewrite) {
        proxy.pathRewrite = {};
        rewrite = proxy.pathRewrite;
      }
      proxy.logLevel = 'debug';
      proxy.context = proxy.context.map((name) => {
        const fullName = joinUrl(publicPath, removeTrailingSlash(name));
        if (rewrite) {
          rewrite[`^${fullName}`] = '';
        }
        return fullName;
      });
    } else {
      debug(`context is required for ${proxy.target}`);
    }
  });
}

function parseJson(proxies, publicPath) {
  const entries = Object.entries(proxies);
  const newProxies = {};
  entries.forEach((arr) => {
    const name = joinUrl(publicPath, removeTrailingSlash(arr[0]));
    debug('map', publicPath, arr[0], name);
    if (typeof (arr[1]) === 'string') {
      arr[1] = {
        logLevel: 'debug',
        target: arr[1],
      };
    } else {
      arr[1].logLevel = 'debug';
    }
    if (!arr[1].pathRewrite) { arr[1].pathRewrite = { [`^${name}`]: '' }; }
    [, newProxies[name]] = arr;
  });
  return newProxies;
}


/**
 * Refine setting for `devServer.proxy`.
 *  1) prepend publicPath to key.
 *  2) rewrites them to empty string, if no 'pathRewrite' is specified.
 *  3) set logLevel to 'debug'.
 *
 * @param {string|object|array} proxies - input config, ref @see to see allowed format.
 * @param {string} publicPath - the option set in webpack.
 * @param {string} apiPrefix - default url to match when url is missing in config.
 * @returns {Object} the config object with correct format.
 *
 * @see allowed format for input config:
 *  - {string} assume apiPrefix is source to match
 *    `'http://api.com'`
 *  - {object}
 *    `{'api':'http://afsfa.com'}`
 *
 *    or (will be wrapped into array automatically)
 *    ```js
 *    {
 *      context: ['/auth', '/api'],
 *      target: 'http://localhost:3000',
 *    }
 *    ```
 *  - {array}
 *    ```
 *    [{
 *     context: ["/auth", "/api"],
 *     target: "http://localhost:3000",
 *    }].
 *    ```
 */
function parseProxies(proxies, publicPath = '', apiPrefix = '') {
  let newProxies;
  if (typeof (proxies) === 'string') {
    newProxies = {
      [removeTrailingSlash(apiPrefix)]: {
        target: proxies,
      },
    };
  } else if (!Array.isArray(proxies) && proxies.context && Array.isArray(proxies.context)) {
    // wrap into array;
    newProxies = [proxies];
  } else {
    newProxies = proxies;
  }

  if (Array.isArray(newProxies)) {
    parseArray(newProxies, publicPath);
  } else {
    newProxies = parseJson(newProxies, publicPath);
  }
  return newProxies;
}
export default parseProxies;
