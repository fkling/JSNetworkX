"use strict";

var isArrayLike = require('./isArrayLike');
var isIterator = require('./isIterator');
var isIterable = require('./isIterable');
var iteratorSymbol = require('./iteratorSymbol');
var iteratorToArray = require('./itertools/toArray');
var isPlainObject = require('./isPlainObject');
var _toArray = require('lodash-node/modern/collections/toArray');

/**
 * Converts sequence like data structures to an array. In particular
 *
 * Array -> Array (returns the array itself)
 * Array-like -> Array
 * Iterator -> Array
 * Iterable -> Array
 * Object -> Array of property names
 *
 * @param {?} sequence
 * @return {Array}
 */
function toArray(sequence) {
  if (Array.isArray(sequence)) {
    return sequence;
  }
  else if (isArrayLike(sequence)) {
    return _toArray(sequence);
  }
  else if (isIterator(sequence)) {
    return iteratorToArray(sequence);
  }
  else if (isIterable(sequence)) {
    return iteratorToArray(sequence[iteratorSymbol]());
  }
  else if (isPlainObject(sequence)) {
    return Object.keys(sequence);
  }
  else {
    throw new TypeError(
      'Cannot convert value of type "%s" (constructor "%s") to array',
      typeof sequence,
      sequence.constructor.nam
    );
  }
}

module.exports = toArray;
