'use strict';

/**
 * Removes every property of the object.
 *
 * @param {Object} obj
 */
export default function clear(obj) {
  for (var prop in obj) {
    delete obj[prop];
  }
}
