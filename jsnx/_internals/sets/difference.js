"use strict";

var Set = require('../Set');
var toIterator = require('../itertools/toIterator');

/**
 * Returns a new set with the values of the first set, not found in the other
 * sets.
 *
 * @param {Set} source
 * @param {...(Set|Array)} var_args
 * @export
 */
function difference(source, ...varArgs) {
  var result = new Set(source.values());
  for (var i = 0, l = varArgs.length; i < l; i++) {
    for (var v of varArgs[i].values()) {
      result.delete(v);
    }
  }
  return result;
}

module.exports = difference;
