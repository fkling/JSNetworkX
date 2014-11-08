"use strict";

var Map = require('./Map');

var forEach = require('./forEach');

/**
 * Same as 'toObjectFromKeys' but returns a Map instead of an object.
 *
 * @param {Iterable} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!Map}
 */
function toMapFromKeys(keys, opt_value) {
   if (opt_value == null) { // && opt_value == undefined
     opt_value = null;
   }
   var result = new Map();
   forEach(keys, function(key) {
     result.set(key, opt_value);
   });
   return result;
}

module.exports = toMapFromKeys;
