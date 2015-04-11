'use strict';

/**
 * Returns a new iterator which maps every value from the provided iterator via
 * the callback function.
 *
 * @param {Iterator} iterator
 * @param {function} map
 * @param {?=} opt_this_obj
 * @return {Iterator}
 */
export default function* mapIterator(iterator, map, optThisObj) {
  for (var v of iterator) {
    yield map.call(optThisObj, v);
  }
}
