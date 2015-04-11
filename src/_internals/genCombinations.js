'use strict';

import range from './range';

function reversed(array) {
  return array.slice().reverse();
}

/**
 * Implements Python's itertools.combinations
 *
 * Return r length subsequences of elements from the input iterable.
 *
 * @param {Iterable} iterable
 * @param {number} r
 *
 * @return {Iterator}
 */
export default function *genCombinations(iterable, r) {
  // genCombinations('ABCD', 2) --> AB AC AD BC BD CD
  // genCombinations(range(4), 3) --> 012 013 023 123
  var pool = Array.from(iterable);
  var n = pool.length;
  if (r > n) {
    return;
  }
  var indicies = range(r);
  var reversedIndicies = reversed(indicies);
  yield indicies.map(i => pool[i]);
  while (true) {
    let i;
    let k = 0;
    for (; k < reversedIndicies.length; k++) {
      i = reversedIndicies[k];
      if (indicies[i] !== i + n - r) {
        break;
      }
    }
    if (reversedIndicies.length === k) {
      return;
    }
    indicies[i] += 1;
    for (let j = i + 1; j < r; j++) {
      indicies[j] = indicies[j-1] + 1;
    }
    yield indicies.map(i => pool[i]); // eslint-disable-line no-loop-func
  }
}
