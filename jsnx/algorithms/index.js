"use strict";

var assign = require('../_internals/assign');
var dag = require('./dag');

module.exports = exports = {
  dag: dag,
};

assign(
  exports,
  dag
);
