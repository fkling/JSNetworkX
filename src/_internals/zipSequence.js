'use strict';

import isArrayLike from './isArrayLike';
import isIterator from './isIterator';
import zipIterator from './zipIterator';

function zipArray(...varArgs) {
  // Pre-allocation arrays speeds up assignment drastically, so we want to
  // optimize for that case
  var length = varArgs.length;
  var min = Infinity;
  var i;
  var result;
  var nextZip = new Array(length);

  // first pass
  for (i = 0; i < length; i++) {
    var array = varArgs[i];
    var arrayLength = array.length;
    if (arrayLength < min) {
      min = arrayLength;
      if (min === 0) {
        return []; // backout early
      }
    }
    nextZip[i] = array[0];
  }
  result = new Array(min);
  result[0] = nextZip;

  for (i = 1; i < min; i++) {
    nextZip = new Array(length);
    for (var j = 0; j < length; j++) {
      nextZip[j] = varArgs[j][i];
    }
    result[i] = nextZip;
  }
  return result;
}

/**
 * Helper to zip sequence types (arrays, array-like objects, objects, etc).
 * All arguments must be the same type. The first argument is used to determine
 * the type.
 * This behaves the same as Python's zip function, i.e. the result has the
 * length of the shortest input.
 *
 * Array -> Array
 * Array-like -> Array
 * Iterator -> Iterator
 *
 * @param {...(Iterable)} var_args
 *
 * @return {!(Array|Iterator)}
 */
export default function zipSequence(...varArgs) {
  var first = varArgs[0];

  if (isArrayLike(first)) {
    return zipArray.apply(null, varArgs);
  }
  else if(isIterator(first)) {
    return zipIterator.apply(null, varArgs);
  }
  else {
    throw new TypeError(
      'Expected an iterator, array-like object or object, but got %s instead',
      first
    );
  }
}
