"use strict";

var _forEach = require('lodash-node/modern/collections/forEach');
var isArrayLike = require('./isArrayLike');
var isBoolean = require('lodash-node/modern/objects/isBoolean');
var isFunction = require('lodash-node/modern/objects/isFunction');
var isGraph = require('./isGraph');
var isIterable = require('./isIterable');
var isIterator = require('./isIterator');
var isObject = require('lodash-node/modern/objects/isObject');
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
function forEach(seq, callback, opt_this_obj, opt_expand) {
  // opt_this_obj can be omitted
  if(isBoolean(opt_this_obj)) {
    opt_expand = opt_this_obj;
    opt_this_obj = null;
  }

  if(opt_expand) {
    var orig_callback = callback;
    /** @this {*} */
    callback = function(val) {
      orig_callback.apply(this, val);
    };
  }

  if (Array.isArray(seq)) {
    seq.forEach(callback, opt_this_obj);
    return;
  }
  else if(isGraph(seq)) {
    seq = toIterator(seq);
  }

  if (isIterable(seq)) {
    seq = seq['@@iterator']();
  }
  if(isIterator(seq)) {
    for (var v of seq) {
      callback.call(opt_this_obj, v);
    }
  }
  else if(isArrayLike(seq)) {
    _forEach(
      seq,
      callback,
      opt_this_obj
    );
  }
  else if(isObject(seq)) {
    forEach(Object.keys(seq), callback, opt_this_obj);
  }
}

module.exports = forEach;
