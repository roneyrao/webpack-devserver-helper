'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('babel-polyfill');

var debug = require('debug')('webpackDevserverHelper');

var joinUrl = require('url-join');

function removeTrailingSlash(path) {
  if (path.endsWith('/')) {
    return path.substr(0, path.length - 1);
  }
  return path;
}

function parseArray(proxies, publicPath) {
  proxies.forEach(function (proxy) {
    if (proxy.context && Array.isArray(proxy.context)) {
      /* eslint-disable no-param-reassign */
      var rewrite = void 0;
      if (!proxy.pathRewrite) {
        proxy.pathRewrite = {};
        rewrite = proxy.pathRewrite;
      }
      proxy.logLevel = 'debug';
      proxy.context = proxy.context.map(function (name) {
        var fullName = joinUrl(publicPath, removeTrailingSlash(name));
        if (rewrite) {
          rewrite['^' + fullName] = '';
        }
        return fullName;
      });
    } else {
      debug('context is required for ' + proxy.target);
    }
  });
}

function parseJson(proxies, publicPath) {
  var entries = Object.entries(proxies);
  var newProxies = {};
  entries.forEach(function (arr) {
    var name = joinUrl(publicPath, removeTrailingSlash(arr[0]));
    debug('map', publicPath, arr[0], name);
    if (typeof arr[1] === 'string') {
      arr[1] = {
        logLevel: 'debug',
        target: arr[1]
      };
    } else {
      arr[1].logLevel = 'debug';
    }
    if (!arr[1].pathRewrite) {
      arr[1].pathRewrite = _defineProperty({}, '^' + name, '');
    }

    var _arr = _slicedToArray(arr, 2);

    newProxies[name] = _arr[1];
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
function parseProxies(proxies) {
  var publicPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var apiPrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var newProxies = void 0;
  if (typeof proxies === 'string') {
    newProxies = _defineProperty({}, removeTrailingSlash(apiPrefix), {
      target: proxies
    });
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
exports.default = parseProxies;
//# sourceMappingURL=proxy.js.map