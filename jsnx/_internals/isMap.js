"use strict";

var Map = require('./Map');

/**
 * Tests whether the value is a Map.
 *
 * @param {*} v The value to test
 * @return {bool}
 */
function isMap(v) {
  return v instanceof Map;
}

module.exports = isMap;
