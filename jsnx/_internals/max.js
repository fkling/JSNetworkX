'use strict';

import forEach from './forEach';

/**
 * Returns the maximum value from an iterable. It uses the optional callback
 * function to determine the value to compare.
 *
 * @param {Iterable} iterable
 * @param {function(?): ?} map
 * @return {?}
 */
export default function max(iterable, map) {
  var maxComparisonValue = -Infinity;
  var maxValue;

  forEach(iterable, function(value) {
    var comparisonValue = map ? map(value) : value;
    if (comparisonValue > maxComparisonValue) {
      maxComparisonValue = comparisonValue;
      maxValue = value;
    }
  });

  return maxValue;
}
