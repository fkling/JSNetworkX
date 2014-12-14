"use strict";

require("6to5/polyfill");

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

Object.assign(
  exports,
  algorithms,
  classes,
  convert,
  exceptions,
  generators,
  relabel
);
