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

chai.use(function(_chai, utils) {
  var Assertion = _chai.Assertion;

  Assertion.addMethod('oneOf', function(list) {
    var passed = true;
    var assertion = new Assertion(this._obj);

    passed = list.some(function(expected) {
      try {
        assertion.to.deep.equal(expected);
        return true;
      }
      catch(e) {
        return false;
      }
    });

    var actual = JSON.stringify(this._obj);
    var expected = JSON.stringify(list);
    this.assert(
      passed,
      'expected ' + actual + ' to be one of ' + expected,
      'expected ' + actual + ' to be none of ' + expected,
      list
    );
  });

  _chai.assert.isOneOf = function(actual, expected, msg) {
    new Assertion(actual, msg).to.be.oneOf(expected);
  };
});

module.exports = chai.assert;
