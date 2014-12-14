"use strict";

var _forEach = require('lodash-node/modern/collections/forEach');
var isIterable = require('./isIterable');
var isIterator = require('./isIterator');

/**
 * Helper to iterate over sequence types (arrays, array-like objects,
 * objects, etc)
 *
 * @param {Iterable} seq
 * @param {function(this:T, ...)} callback
 * @param {T=} optThisObj
 * @template T
 */
function forEach(seq, callback, optThisObj) {
  if (Array.isArray(seq)) {
    seq.forEach(callback, optThisObj);
    return;
  }
  if (isIterable(seq)) {
    seq = seq[Symbol.iterator]();
  }
  if(isIterator(seq)) {
    var v;
    var i;
    // Avoiding call if it is not necessary is faster in some browsers
    if (optThisObj !== undefined) {
      for (v of seq) {
        i += 1;
        callback.call(optThisObj, v, i);
      }
    } else {
      for (v of seq) {
        i += 1;
        callback(v, i);
      }
    }
  }
  else if(seq && typeof seq === 'object') {
    _forEach(seq, callback, optThisObj);
  }
}

module.exports = forEach;
