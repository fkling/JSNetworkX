"use strict";

/**
 * Iterates over an iterator and returns an array with its values.
 *
 * @param {Iterator} iterator
 * @return {!Array}
 */
function toArray(iterator) {
  var result = [];
  var i = 0;
  for (var value of iterator) {
    result[i++] = value; // .push is relatively slow
  }
  return result;
}

module.exports = toArray;
