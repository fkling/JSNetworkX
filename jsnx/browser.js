"use strict";
require("6to5/polyfill");

var isIterator = require('./_internals/isIterator');

Object.assign(
  exports,
  require('./')
);

if (!global.document) {
  // inside worker
  global.onmessage = function(event) {
    var args = event.data.args.map(function(arg) {
      if (typeof arg === 'object' && arg.__type__) {
        switch (arg.__type__) {
          case 'Graph':
          case 'DiGraph':
            return new exports[arg.__type__](arg.data);
        }
      }
      return arg;
    });
    var result = exports[event.data.method].apply(null, args);
    // If the function normally returns an iterator, we return an array from
    // the async version
    if (isIterator(result)) {
      result = Array.from(result);
    }
    global.postMessage(result);
    global.close();
  };
}
