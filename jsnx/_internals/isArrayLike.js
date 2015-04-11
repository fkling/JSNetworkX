'use strict';

/**
 * Returns true of the array is an object and has a numerical length property.
 *
 * @param {?} v
 * @return {bool}
 */
export default function isArrayLike(v) {
  return v &&
    typeof v === 'object' &&
    typeof v.length === 'number' &&
    typeof v !== 'function';
}
