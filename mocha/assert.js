"use strict";
/*jshint node:true*/
var chai = require('chai');
chai.use(require('chai-members-deep'));

/*
assert.almostEqual = function(actual, expected, message) {
  var diff = Math.abs(actual - expected);
  // round to 3th place
  diff = Math.round(diff * 1000) / 1000;
  if (diff !== 0) {
    assert.fail(actual, expected, message, 'almostEqual', assert.almostEqual);
  }
};
*/

module.exports = chai.assert;
