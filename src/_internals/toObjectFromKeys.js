'use strict';

import forEach from './forEach';

/**
 * Returns an object, given an array of keys and an default value.
 * Like dict.fromkeys in Python.
 *
 * @param {Iterable} keys Container of keys
 * @param {*} optValue the value, default is null
 * @return {!Object}
 */
export default function toObjectFromKeys(keys, optValue=null) {
  var result = {};
  forEach(keys, function(key) {
    result[key] = optValue;
  });
  return result;
}
