'use strict';

var Graph = require('./graph');
var DiGraph = require('./digraph');

var assign = require('../_internals/assign');
var functions = require('./functions');

module.exports = exports = {
  Graph,
  DiGraph,
  functions,
};

assign(
  exports,
  functions
);
