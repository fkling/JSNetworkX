'use strict';

import isArrayLike from './isArrayLike';
import isIterator from './isIterator';
import isIterable from './isIterable';

/**
 * Returns an iterator object for the given array, array-like object
 * or object. Should behave like Python's iter:
 * http://docs.python.org/library/functions.html#iter
 *
 *
 * The iterator object implements the goog.iter.Iterator interface.
 *
 * @param {Iterable} seq
 * @return {!Iterator}
 */
export default function toIterator(seq) {
  /*jshint expr:true*/
  if (isIterator(seq)) {
    return seq;
  }
  else if (isIterable(seq)) {
    return seq[Symbol.iterator]();
  }
  else if (Array.isArray(seq) || isArrayLike(seq)) {
    return (function*(seq) { // eslint-disable-line no-shadow
      for (var i = 0, l = seq.length; i < l; i++) {
        yield seq[i];
      }
    }(seq));
  }
  else {
    throw new TypeError('Unable to convert ' + seq + ' to an iterator');
  }
}
