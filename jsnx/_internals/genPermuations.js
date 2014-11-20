"use strict";

var range = require('./range');
var toArray = require('./toArray');

function reversed(array) {
  return array.slice().reverse();
}

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
function *genPermutations(iterable, r) {
  // genPermutations('ABCD', 2) --> AB AC AD BA BC BD CA CB CD DA DB DC
  // genPermutations(range(3)) --> 012 021 102 120 201 210
  var pool = toArray(iterable);
  var n = pool.length;
  r = r == null ? n : r;
  if (r > n) {
    return;
  }
  var indicies = range(r);
  var cycles = range(n, n - r, -1);
  var reversedIndicies = reversed(indicies);
  yield indicies.slice(0, r).map(i => pool[i]);
  while (true) {
    for (var k = 0; k < reversedIndicies.length; k++) {
      var i = reversedIndicies[k];
      cycles[i] -= 1;
      var index = indicies[i];
      if (cycles[i] === 0) {
        indicies.splice(i, 1).push(index);
        cycles[i] = n - i;
      }
      else {
        var j = cycles[i];
        indicies[i] = indicies[indicies.length - j];
        indicies[indicies.length - j] = index;
        yield indicies.splice(0, r).map(i => pool[i]);
        break;
      }
    }
    if (reversedIndicies.length === k) {
      return;
    }
  }
}

module.exports = genPermutations;
