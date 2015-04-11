'use strict';

/**
 * Returns the next value of an iterator or throws an error if the iterator was
 * already consumed.
 *
 * @param {Iterator} iterator
 * @return {?}
 */
export default function next(iterator) {
  var result = iterator.next();
  if (result.done) {
    throw new Error('Iterator is already exhausted');
  }
  return result.value;
}
