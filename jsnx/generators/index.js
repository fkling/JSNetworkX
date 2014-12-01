"use strict";

var assign = require('../_internals/assign');
var classic = require('./classic');
var randomGraphs = require('./randomGraphs');

module.exports = exports = {
  classic,
  randomGraphs,
};

assign(
  exports,
  classic,
  randomGraphs
);
