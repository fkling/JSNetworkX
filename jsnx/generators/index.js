"use strict";

var classic = require('./classic');
var degreeSequence = require('./degreeSequence');
var randomGraphs = require('./randomGraphs');

module.exports = exports = {
  classic,
  degreeSequence,
  randomGraphs,
};

Object.assign(
  exports,
  classic,
  degreeSequence,
  randomGraphs
);
