"use strict";

require('regenerator/runtime');
var assign = require('./_internals/assign');

var classes = require('./classes');

module.exports = exports = {
  Map: require('./_internals/Map'),
  Set: require('./_internals/Set'),
  classes: classes
};

assign(
  exports,
  classes
);
