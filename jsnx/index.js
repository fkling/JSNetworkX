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
  algorithms: algorithms,
  classes: classes,
  convert: convert,
  exceptions: exceptions,
  generators: generators,
};

assign(
  exports,
  algorithms,
  classes,
  convert,
  exceptions,
  generators
);
