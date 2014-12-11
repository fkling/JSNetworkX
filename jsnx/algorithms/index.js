"use strict";

var assign = require('../_internals/assign');
var clique = require('./clique');
var dag = require('./dag');
var graphical = require('./graphical');

module.exports = exports = {
  clique,
  dag,
  graphical,
};

assign(
  exports,
  clique,
  dag,
  graphical
);
