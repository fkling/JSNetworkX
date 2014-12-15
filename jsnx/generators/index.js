"use strict";

var classic = require('./classic');
var degreeSequence = require('./degreeSequence');
var randomGraphs = require('./randomGraphs');
var social = require('./social');

module.exports = exports = {
  classic,
  degreeSequence,
  randomGraphs,
  social,
};

Object.assign(
  exports,
  classic,
  degreeSequence,
  randomGraphs,
  social
);
