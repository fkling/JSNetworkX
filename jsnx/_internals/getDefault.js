"use strict";

/**
 * Returns the second argument if the first argument is null or undefined.
 *
 * @param {*} value
 * @param {*} defaultValue
 * @return {?}
 */
function get(value, defaultValue) {
  return value == null ? defaultValue : value;
}

module.exports = get;
