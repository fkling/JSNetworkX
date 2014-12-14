"use strict";

/**
 * Returns true if object implement the @@iterator method.
 *
 * @param {*} obj

 * @return {boolean}
 */
function isIterable(obj) {
  return typeof obj[Symbol.iterator] === 'function';
}

module.exports = isIterable;
