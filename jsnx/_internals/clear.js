"use strict";

/**
 * Removes every property of the object.
 *
 * @param {Object} obj
 */
function clear(obj) {
  for (var prop in obj) {
    delete obj[prop];
  }
}

module.exports = clear;
