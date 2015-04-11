'use strict';

import Map from './Map';

import forEach from './forEach';

/**
 * Same as 'toObjectFromKeys' but returns a Map instead of an object.
 *
 * @param {Iterable} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!Map}
 */
export default function toMapFromKeys(keys, optValue) {
   if (optValue == null) { // && opt_value == undefined
     optValue = null;
   }
   var result = new Map();
   forEach(keys, function(key) {
     result.set(key, optValue);
   });
   return result;
}
