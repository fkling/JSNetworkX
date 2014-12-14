'use strict';

var Graph = require('./graph');
var DiGraph = require('./digraph');

var functions = require('./functions');

module.exports = exports = {
  Graph,
  DiGraph,
  functions,
};

Object.assign(
  exports,
  functions
);
