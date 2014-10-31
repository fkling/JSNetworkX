"use strict";

/**
 * Returns a new iterator which maps every value from the provided iterator via
 * the callback function.
 *
 * @param {Iterator} iterator
 * @param {function} map
 * @param {?=} opt_this_obj
 * @return {Iterator}
 */
function* mapIterator(iterator, map, opt_this_obj) {
  for (var v of iterator) {
    yield map.call(opt_this_obj, v);
  }
}

module.exports = mapIterator;
