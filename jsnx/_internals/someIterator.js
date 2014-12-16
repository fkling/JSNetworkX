"use strict";

/**
 * Returns true if the callback function returns true for any of the elements
 * of the iterator.
 *
 * @param {Iterator} iterator
 * @param {function} callback
 * @return {boolean}
 */
export default function someIterator(iterator, callback) {
  for (var value of iterator) {
    if (callback(value)) {
      return true;
    }
  }
  return false;
}
