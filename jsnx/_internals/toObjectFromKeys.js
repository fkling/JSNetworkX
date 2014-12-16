"use strict";

import forEach from './forEach';

/**
 * Returns an object, given an array of keys and an default value.
 * Like dict.fromkeys in Python.
 *
 * @param {jsnx.helper.Iterable} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!Object}
 */
export default function toObjectFromKeys(keys, optValue) {
  if(optValue == null) { // && opt_value == undefined
    optValue = null;
  }
  var result = {};
  forEach(keys, function(key) {
    result[key] = optValue;
  });
  return result;
}
