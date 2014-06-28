"use strict";

/**
 * Returns true if object is an iterator 
 *
 * @param {*} obj
 *
 * @return {boolean}
 */
function isIterator(obj) {
  return typeof obj.next === 'function';
}

module.exports = isIterator;
