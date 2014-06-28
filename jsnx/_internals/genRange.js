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
 * @param {?number=} opt_step Stepsize
 *
 * @return {!Iterator}
 */
function* genRange(opt_start, opt_end, opt_step) {

  if(arguments.length === 0) {
    return;
  }
  else if(arguments.length === 1) {
    opt_end = opt_start;
    opt_start = 0;
    opt_step = 1;
  }
  else if(arguments.length === 2) {
    opt_step = 1;
  }
  else if(arguments.length === 3 && arguments[2] === 0) {
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
