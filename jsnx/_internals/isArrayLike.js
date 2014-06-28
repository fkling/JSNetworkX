"use strict";

var isObject = require('lodash-node/modern/objects/isObject');

/**
 * Returns true of the array is an object and has a numerical length property.
 *
 * @param {?} v
 * @return {bool}
 */
function isArrayLike(v) {
  return isObject(v) && typeof v.length === 'number' && typeof v !== 'function';
}

module.exports = isArrayLike;
