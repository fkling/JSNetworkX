"use strict";

var assign = require('../_internals/assign');
var dag = require('./dag');
var graphical = require('./graphical');

module.exports = exports = {
  dag,
  graphical,
};

assign(
  exports,
  dag,
  graphical
);
