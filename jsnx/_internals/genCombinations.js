"use strict";

var range = require('./range');
var toArray = require('./toArray');

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
function *genCombinations(iterable, r) {
  // genCombinations('ABCD', 2) --> AB AC AD BC BD CD
  // genCombinations(range(4), 3) --> 012 013 023 123
  var pool = toArray(iterable);
  var n = pool.length;
  if (r > n) {
    return;
  }
  var indicies = range(r);
  var reversedIndicies = reversed(indicies);
  yield indicies.map(i => pool[i]);
  while (true) {
    var i;
    for (var k = 0; k < reversedIndicies.length; k++) {
      i = reversedIndicies[k];
      if (indicies[i] !== i + n - r) {
        break;
      }
    }
    if (reversedIndicies.length === k) {
      return;
    }
    indicies[i] += 1;
    for (var j of range(i+1, r)) {
      indicies[j] = indicies[j-1] + 1;
    }
    yield indicies.map(i => pool[i]);
  }
}

module.exports = genCombinations;
