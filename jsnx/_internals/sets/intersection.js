"use strict";

var Set = require('../Set');
var toIterator = require('../itertools/toIterator');

/**
 * Returns a new set containing only elements found in every set.
 *
 * @param {Set} source
 * @param {...(Set|Array)} var_args
 * @export
 */
function intersection(source, ...varArgs) {
  var result = new Set();
  for (var i = 0, l = varArgs.length; i < l; i++) {
    for (var v of varArgs[i].values()) {
      if (source.has(v)) {
        result.add(v);
      }
    }
  }
  return result;
}

module.exports = intersection;
