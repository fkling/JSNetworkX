'use strict';

import Set from './Set';

/**
 * Tests whether the value is a Map.
 *
 * @param {*} v The value to test
 * @return {bool}
 */
export default function isSet(v) {
  return v instanceof Set;
}
