// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"deparam.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deparam = deparam;
exports.param = param;

function deparam(query) {
  var match;
  var plus = /\+/g;
  var search = /([^&=]+)=?([^&]*)/g;

  var decode = function decode(s) {
    return decodeURIComponent(s.replace(plus, ' '));
  };

  var params = {};

  while (match = search.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }

  return params;
}

function param(obj) {
  var parts = [];

  for (var name in obj) {
    if (obj.hasOwnProperty(name) && obj[name]) {
      parts.push(encodeURIComponent(name) + "=" + encodeURIComponent(obj[name]));
    }
  }

  return parts.join('&');
}
},{}],"preferred-theme.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preferredThemeId = exports.preferredTheme = void 0;
var preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'github-dark' : 'github-light';
exports.preferredTheme = preferredTheme;
var preferredThemeId = 'preferred-color-scheme';
exports.preferredThemeId = preferredThemeId;
},{}],"client.ts":[function(require,module,exports) {
"use strict";

var _deparam = require("./deparam");

var _preferredTheme = require("./preferred-theme");

var params = (0, _deparam.deparam)(location.search.substr(1));
var token = params.utterances;

if (token) {
  delete params.utterances;
  var search = (0, _deparam.param)(params);

  if (search.length) {
    search = '?' + search;
  }

  history.replaceState(undefined, document.title, location.pathname + search + location.hash);
}

var script = document.currentScript;

if (script === undefined) {
  script = document.querySelector('script[src^="https://utteranc.es/client.js"],script[src^="http://localhost:4000/client.js"]');
}

var attrs = {};

for (var i = 0; i < script.attributes.length; i++) {
  var attribute = script.attributes.item(i);
  attrs[attribute.name.replace(/^data-/, '')] = attribute.value;
}

if (attrs.theme === _preferredTheme.preferredThemeId) {
  attrs.theme = _preferredTheme.preferredTheme;
}

var canonicalLink = document.querySelector("link[rel='canonical']");
attrs.url = canonicalLink ? canonicalLink.href : location.origin + location.pathname + location.search;
attrs.origin = location.origin;
attrs.pathname = location.pathname.length < 2 ? 'index' : location.pathname.substr(1).replace(/\.\w+$/, '');
attrs.title = document.title;
var descriptionMeta = document.querySelector("meta[name='description']");
attrs.description = descriptionMeta ? descriptionMeta.content : '';
var len = encodeURIComponent(attrs.description).length;

if (len > 1000) {
  attrs.description = attrs.description.substr(0, Math.floor(attrs.description.length * 1000 / len));
}

var ogtitleMeta = document.querySelector("meta[property='og:title'],meta[name='og:title']");
attrs['og:title'] = ogtitleMeta ? ogtitleMeta.content : '';
attrs.token = token;
document.head.insertAdjacentHTML('afterbegin', "<style>\n    .utterances {\n      position: relative;\n      box-sizing: border-box;\n      width: 100%;\n      max-width: 760px;\n      margin-left: auto;\n      margin-right: auto;\n    }\n    .utterances-frame {\n      position: absolute;\n      left: 0;\n      right: 0;\n      width: 1px;\n      min-width: 100%;\n      max-width: 100%;\n      height: 100%;\n      border: 0;\n    }\n  </style>");
var utterancesOrigin = script.src.match(/^https:\/\/utteranc\.es|http:\/\/localhost:\d+/)[0];
var url = utterancesOrigin + "/utterances.html";
script.insertAdjacentHTML('afterend', "<div class=\"utterances\">\n    <iframe class=\"utterances-frame\" title=\"Comments\" scrolling=\"no\" src=\"" + url + "?" + (0, _deparam.param)(attrs) + "\"></iframe>\n  </div>");
var container = script.nextElementSibling;
script.parentElement.removeChild(script);
addEventListener('message', function (event) {
  if (event.origin !== utterancesOrigin) {
    return;
  }

  var data = event.data;

  if (data && data.type === 'resize' && data.height) {
    container.style.height = data.height + "px";
  }
});
},{"./deparam":"deparam.ts","./preferred-theme":"preferred-theme.ts"}]},{},["client.ts"], null)
//# sourceMappingURL=/client.js.map