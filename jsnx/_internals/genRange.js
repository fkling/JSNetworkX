'use strict';

/**
 * Implements Python's range function, returns an iterator.
 *
 * If one argument n is passed, iterates over 0...n.
 * If two arguments i,j are passed, iterates over i...j.
 * If three arguments i,j,k are passed, iterates over i, i+k, i+2k, ...j
 *
 * @param {?number=} opt_start Number to start from
 * @param {?number=} opt_end Number to count to
 * @param {?number=} opt_step Step size
 * @return {!Iterator}
 */
export default function* genRange(optStart, optEnd, optStep) {

  if (optStart == null) {
    return;
  }
  else if (optEnd == null) {
    optEnd = optStart;
    optStart = 0;
    optStep = 1;
  }
  else if (optStep == null) {
    optStep = 1;
  }
  else if (optStep === 0) {
    throw new RangeError("opt_step can't be 0");
  }

  var negative = optStep < 0;
  for (
    var i = optStart;
    negative && i > optEnd || !negative && i < optEnd;
    i += optStep) {
    yield i;
  }
}
