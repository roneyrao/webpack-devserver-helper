'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseProxies = undefined;

var _mock = require('./mock');

Object.keys(_mock).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mock[key];
    }
  });
});

var _proxy = require('./proxy');

var _proxy2 = _interopRequireDefault(_proxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.parseProxies = _proxy2.default;
//# sourceMappingURL=index.js.map