"use strict";

var Set = require('./Set');

/**
 * Tests whether the value is a Map.
 *
 * @param {*} v The value to test
 * @return {bool}
 */
function isSet(v) {
  return v instanceof Set;
}

module.exports = isSet;
