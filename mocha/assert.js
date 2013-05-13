"use strict";
/*jshint node:true*/
var assert = require('assert');

assert.isOneOf = function(actual, expected, message) {
  var matches = 0;
  expected.forEach(function(expected) {
    try {
      assert.deepEqual(actual, expected);
      matches += 1;
    }
    catch(ex) {
      if ((!ex instanceof assert.AssertionError)) {
        throw ex;
      }
    }
  });
  if (matches === 0) {
    assert.fail(actual, expected, message, 'isContainedIn', assert.isOneOf);
  }
};

assert.almostEqual = function(actual, expected, message) {
  var diff = Math.abs(actual - expected);
  // round to 3th place
  diff = Math.round(diff * 1000) / 1000;
  if (diff !== 0) {
    assert.fail(actual, expected, message, 'almostEqual', assert.almostEqual);
  }
};

module.exports = assert;
