'use strict';

/**
 * Returns true if value is a Graph
 *
 * @param {*} value
 * @return {bool}
 */
export default function isGraph(value) {
  // We are not using instanceof to avoid circular dependencies
  return value && typeof value.addNode === 'function';
}
