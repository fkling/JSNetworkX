'use strict';

import Map from './Map';

/**
 * Tests whether the value is a Map.
 *
 * @param {*} v The value to test
 * @return {bool}
 */
export default function isMap(v) {
  return v instanceof Map;
}
