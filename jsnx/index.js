"use strict";

require('regenerator/runtime');
var assign = require('./_internals/assign');

var algorithms = require('./algorithms');
var classes = require('./classes');
var convert = require('./convert');
var exceptions = require('./exceptions');
var generators = require('./generators');
var relabel = require('./relabel');

module.exports = exports = {
  Map: require('./_internals/Map'),
  Set: require('./_internals/Set'),
  algorithms,
  classes,
  convert,
  exceptions,
  generators,
  relabel,
};

assign(
  exports,
  algorithms,
  classes,
  convert,
  exceptions,
  generators,
  relabel
);
