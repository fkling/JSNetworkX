"use strict";

var assign = require('../_internals/assign');
var classic = require('./classic');

module.exports = exports = {
  classic,
};

assign(
  exports,
  classic
);
