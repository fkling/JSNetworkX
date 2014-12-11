"use strict";

var assign = require('./_internals/assign');
var isIterator = require('./_internals/isIterator');
var iteratorToArray = require('./_internals/itertools/toArray');

assign(
  exports,
  require('./index')
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
      result = iteratorToArray(result);
    }
    global.postMessage(result);
    global.close();
  };
}
