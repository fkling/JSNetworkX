"use strict";

var clique = require('./clique');
var cluster = require('./cluster');
var dag = require('./dag');
var graphical = require('./graphical');

module.exports = exports = {
  clique,
  cluster,
  dag,
  graphical,
};

Object.assign(
  exports,
  clique,
  cluster,
  dag,
  graphical
);
