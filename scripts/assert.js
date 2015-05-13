"use strict";
/*jshint node:true*/
var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-members-deep'));

chai.use(function(_chai) {
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

  _chai.assert.almostEqual = function(actual, expected, places, message) {
    if (typeof places === 'string') {
      message = places;
      places = null;
    }
    if (!places) {
      places = 7;
    }
    new Assertion(actual, message).closeTo(
      actual,
      expected,
      Math.pow(10, -places)
    );
  };
});

module.exports = chai.assert;
