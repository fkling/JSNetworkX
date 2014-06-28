"use strict";

/**
 * @fileoverview
 *
 * Custom helpers for JSNetworkX.
 *
 * These are not imported into the base networkx namespace but 
 * can be accessed through jsnx.utils.
 */

goog.provide('jsnx.contrib.misc');

goog.require('jsnx');

/**
 * Obtains a unique key for the passed object.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * Arrays will yield the same hash if the contain the same elements.
 *
 * @param {*} val Object or primitive value to get a key for.
 * @param {function(*):string=} opt_keyfunc
 * @return {string} A unique key for this value/object.
 *
 * @export
 */
jsnx.contrib.misc.get_hash = function(val, opt_keyfunc) {
  var type = typeof val;
  if (type === 'object' || type === 'function') {
    if (val.hasOwnProperty('__hash__')) {
      return val['__hash__'];
    }
    else if (val.toString !== Object.prototype.toString && 
        val.toString !== Array.prototype.toString) {
      return val.toString();
    }
    else if(opt_keyfunc) {
      return opt_keyfunc(val);
    }
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  }
  else {
    return type.substr(0, 1) + val;
  }
};
if (jsnx.TESTING) {
  goog.exportSymbol('jsnx.contrib.misc.get_hash', jsnx.contrib.misc.get_hash);
}
