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
function intersection(source, ...var_args) {
  var result = new Set();
  for (var i = 0, l = var_args.length; i < l; i++) {
    for (var v of var_args[i].values()) {
      if (source.has(v)) {
        result.add(v);
      }
    }
  }
  return result;
}

module.exports = intersection;
