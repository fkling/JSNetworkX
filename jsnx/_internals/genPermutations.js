'use strict';

import range from './range';

/**
 * Implements Python's itertools.permutations
 *
 * Return successive r length permutations of elements in the iterable.
 * *
 * @param {Iterable} iterable
 * @param {number=} opt_r
 *
 * @return {Iterator}
 */
export default function *genPermutations(iterable, r) {
  // genPermutations('ABCD', 2) --> AB AC AD BA BC BD CA CB CD DA DB DC
  // genPermutations(range(3)) --> 012 021 102 120 201 210
  var pool = Array.from(iterable);
  var n = pool.length;
  r = r == null ? n : r;
  if (r > n) {
    return;
  }
  var indicies = range(n);
  var cycles = range(n, n - r, -1);
  var rangeR = range(r-1, -1 , -1);
  yield indicies.slice(0, r).map(i => pool[i]);
  while (true) {
    let k = 0;
    for (; k < rangeR.length; k++) {
      let i = rangeR[k];
      cycles[i] -= 1;
      let index = indicies[i];
      if (cycles[i] === 0) {
        indicies.splice(i, 1);
        indicies.push(index);
        cycles[i] = n - i;
      }
      else {
        let j = cycles[i];
        indicies[i] = indicies[indicies.length - j];
        indicies[indicies.length - j] = index;
        /* eslint-disable no-loop-func */
        yield indicies.slice(0, r).map(i => pool[i]);
        /* eslint-enable no-loop-func */
        break;
      }
    }
    if (rangeR.length === k) {
      return;
    }
  }
}
