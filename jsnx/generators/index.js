"use strict";

var assign = require('../_internals/assign');
var classic = require('./classic');
var degreeSequence = require('./degreeSequence');
var randomGraphs = require('./randomGraphs');

module.exports = exports = {
  classic,
  degreeSequence,
  randomGraphs,
};

assign(
  exports,
  classic,
  degreeSequence,
  randomGraphs
);
