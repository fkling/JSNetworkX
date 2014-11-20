"use strict";

var isArrayLike = require('./isArrayLike');
var isGraph = require('./isGraph');
var isPlainObject = require('lodash-node/modern/objects/isPlainObject');
var objectSize = require('lodash-node/modern/collections/size');

/**
 * Returns the number of elements in the container. That is
 * the number of elements in the array or object or the length
 * of a string.
 *
 * @param {(string|Object|ArrayLike|Graph)} obj
 *    Object to determine the length of
 *
 * @return {number} The number of elements
 * @throws {TypeError} When length cannot be determined
 */
function size(obj) {
  if (isGraph(obj)) {
    return obj.numberOfNodes();
  }
  else if(typeof obj === 'string' || isArrayLike(obj)) {
    return obj.length;
  }
  else if(isPlainObject(obj)) {
    return objectSize(obj);
  }
  else {
    throw new TypeError(
      'Expected a graph object, array, string or object, but got %s instead',
      typeof obj
    );
  }
}

module.exports = size;
