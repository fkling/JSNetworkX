"use strict";

var genRange = require('./genRange');
var iteratorToArray = require('./iteratorToArray');

/**
 * Implements Python's range function, returns an array.
 *
 * If one argument n is passed, iterates over 0...n.
 * If two arguments i,j are passed, iterates over i...j.
 * If three arguments i,j,k are passed, iterates over i, i+k, i+2k, ...j
 *
 * @param {?number=} optStart Number to start from
 * @param {?number=} optEnd Number to count to
 * @param {?number=} optStep Step size
 * @return {!Array}
 */
function range(optStart, optEnd, optStep) {
  return iteratorToArray(genRange(optStart, optEnd, optStep));
}

module.exports = range;
