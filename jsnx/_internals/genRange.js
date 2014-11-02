"use strict";

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
function* genRange(opt_start, opt_end, opt_step) {

  if (opt_start == null) {
    return;
  }
  else if (opt_end == null) {
    opt_end = opt_start;
    opt_start = 0;
    opt_step = 1;
  }
  else if (opt_step == null) {
    opt_step = 1;
  }
  else if (opt_step === 0) {
    throw new RangeError("opt_step can't be 0");
  }

  var negative = opt_step < 0;
  for (
    var i = opt_start;
    negative && i > opt_end || !negative && i < opt_end;
    i += opt_step) {
    yield i;
  }
}

module.exports = genRange;
