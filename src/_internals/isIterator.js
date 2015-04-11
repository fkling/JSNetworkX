'use strict';

/**
 * Returns true if object is an iterator
 *
 * @param {*} obj
 *
 * @return {boolean}
 */
export default function isIterator(obj) {
  return obj && typeof obj.next === 'function';
}
