"use strict";

var clique = require('./clique');
var dag = require('./dag');
var graphical = require('./graphical');

module.exports = exports = {
  clique,
  dag,
  graphical,
};

Object.assign(
  exports,
  clique,
  dag,
  graphical
);
