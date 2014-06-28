"use strict";

var isArrayLike = require('./isArrayLike');
var isIterator = require('./isIterator');
var isPlainObject = require('lodash-node/modern/objects/isPlainObject');
var mapValues = require('lodash-node/modern/objects/mapValues');
var zipIterator = require('./itertools/zipIterator.js');

function zipArray(...var_args) {
  // Pre-allocation arrays speeds up assignment drastically, so we want to 
  // optimize for that case
  var length = var_args.length;
  var min = Infinity;
  var i;
  var result;
  var next_zip = new Array(length);

  // first pass
  for (i = 0; i < length; i++) {
    var array = var_args[i];
    var array_length = array.length;
    if (array_length < min) {
      min = array_length;
      if (min === 0) {
        return []; // backout early
      }
    }
    next_zip[i] = array[0];
  }
  result = new Array(min);
  result[0] = next_zip;

  for (i = 1; i < min; i++) {
    next_zip = new Array(length);
    for (var j = 0; j < length; j++) {
      next_zip[j] = var_args[j][i];
    }
    result[i] = next_zip;
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
 * Object -> Array (of keys)
 * Iterator -> Iterator
 *
 * @param {...(Iterable)} var_args
 *
 * @return {!(Array|Iterator)}
 */
function zipSequence(...var_args) {
  var first = var_args[0];

  if (isArrayLike(first)) {
    return zipArray.apply(null, var_args);
  }
  else if(isIterator(first)) {
    return zipIterator.apply(null, var_args);
  }
  else if(isPlainObject(first)) {
    return zipArray.apply(
      null,
      var_args.map(Object.keys)
    );
  }
  else {
    throw new TypeError(
      'Expected an iterator, array-like object or object, but got %s instead',
      first
    );
  }
}

module.exports = zipSequence;
