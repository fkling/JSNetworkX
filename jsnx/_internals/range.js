"use strict";

var genRange = require('./genRange');
var iteratorToArray = require('./itertools/toArray');

/**
 * Implements Python's range function, returns an array.
 *
 * If one argument n is passed, iterates over 0...n.
 * If two arguments i,j are passed, iterates over i...j.
 * If three arguments i,j,k are passed, iterates over i, i+k, i+2k, ...j
 *
 * @param {?number=} opt_start Number to start from
 * @param {?number=} opt_end Number to count to
 * @param {?number=} opt_step Step size
 * @return {!Array}
 */
function range(optStart, optEnd, optStep) {
  return iteratorToArray(genRange(optStart, optEnd, optStep));
}

module.exports = range;
