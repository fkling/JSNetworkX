"use strict";

require('regenerator/runtime');
var assign = require('./_internals/assign');

var algorithms = require('./algorithms');
var classes = require('./classes');
var convert = require('./convert');
var exceptions = require('./exceptions');
var generators = require('./generators');

module.exports = exports = {
  Map: require('./_internals/Map'),
  Set: require('./_internals/Set'),
  algorithms,
  classes,
  convert,
  exceptions,
  generators,
};

assign(
  exports,
  algorithms,
  classes,
  convert,
  exceptions,
  generators
);

if (process.env.ENV === 'browser') {
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
      global.postMessage(result);
      global.close();
    };
  }
}
