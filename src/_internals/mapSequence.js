'use strict';

import isPlainObject from 'lodash/lang/isPlainObject';
import mapValues from 'lodash/object/mapValues';

import isArrayLike from './isArrayLike';
import isIterable from './isIterable';
import isIterator from './isIterator';
import mapIterator from './mapIterator';

var nativeMap = Array.prototype.map;

/**
 * Helper to map sequence types (arrays, array-like objects, objects, etc).
 * Note that if an array-like object is passed, an array is returned:
 *
 * Array -> Array
 * ArrayLike -> Array
 * Iterator -> Iterator
 * Iterable -> Iterator
 * Object -> Object
 *
 * @param {Iterable} sequence
 * @param {function(this:T,...)} callback
 * @param {T=} this_obj
 * @template T
 *
 * @return {(Array|Object|Iterator)}
 */
export default function mapSequence(sequence, callback, thisObj) {
  if (isArrayLike(sequence)) {
    return nativeMap.call(sequence, callback, thisObj);
  }
  else if (isIterable(sequence)) {
    sequence = sequence[Symbol.iterator]();
  }
  if (isIterator(sequence)) {
    return mapIterator(sequence, callback, thisObj);
  }
  else if(isPlainObject(sequence)) {
    return mapValues(sequence, callback, thisObj);
  }
  else {
    throw new TypeError(
      "Can't map value of type %s",
      typeof sequence
    );
  }
}
