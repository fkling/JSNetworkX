"use strict";

/*jshint ignore:start*/
var undefined;
/*jshint ignore:end*/

var _forEach = require('lodash-node/modern/collections/forEach');
var isArrayLike = require('./isArrayLike');
var isBoolean = require('lodash-node/modern/objects/isBoolean');
var isFunction = require('lodash-node/modern/objects/isFunction');
var isIterable = require('./isIterable');
var isIterator = require('./isIterator');
var isObject = require('lodash-node/modern/objects/isObject');
var iteratorSymbol = require('./iteratorSymbol');
var toIterator = require('./itertools/toIterator');

/**
 * Helper to iterate over sequence types (arrays, array-like objects,
 * objects, etc)
 *
 * @param {Iterable} seq
 * @param {function(this:T, ...)} callback
 * @param {T=} opt_this_obj
 * @param {boolean=} opt_expand If true, elements of the sequence are expected
 *      to be array-like and each item in these elements is passed as 
 *      argument to the callback
 * @template T
 */
function forEach(seq, callback, optThisObj) {
  if (Array.isArray(seq)) {
    seq.forEach(callback, optThisObj);
    return;
  }
  if (isIterable(seq)) {
    seq = seq[iteratorSymbol]();
  }
  if(isIterator(seq)) {
    var v;
    // Avoiding call if it is not necessary is faster in some browsers
    if (optThisObj !== undefined) {
      for (v of seq) {
        callback.call(optThisObj, v);
      }
    } else {
      for (v of seq) {
        callback(v);
      }
    }
  }
  else if(isArrayLike(seq)) {
    _forEach(
      seq,
      callback,
      optThisObj
    );
  }
  else if(isObject(seq)) {
    Object.keys(seq).forEach(callback, optThisObj);
  }
}

module.exports = forEach;
