'use strict';

/**
 * Returns true if object implement the @@iterator method.
 *
 * @param {*} obj

 * @return {boolean}
 */
export default function isIterable(obj) {
  return typeof obj[Symbol.iterator] === 'function';
}
