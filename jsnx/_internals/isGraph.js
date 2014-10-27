"use strict";

var hasOwn = Object.prototype.hasOwnProperty;

/**
 * Returns true if value is a Graph
 *
 * @param {*} value
 * @return {bool}
 */
function isGraph(value) {
  // We are not using instanceof to avoid circular dependencies
  return typeof value.add_node === 'function';
}

module.exports = isGraph;
