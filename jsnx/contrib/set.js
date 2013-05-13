"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString()
 * and does not accept arrays as keys (just like Python does not accept lists).
 */

goog.provide('jsnx.contrib.Set');

goog.require('goog.iter');
goog.require('goog.object');
goog.require('jsnx.contrib.Map');
goog.require('jsnx.exception');


/**
 * @param {jsnx.helper.Iterable=} opt_data An object, array or iterator to 
 *  populate the map with.
 * @constructor
 * @export
 */
jsnx.contrib.Set = function(opt_data) {
  this.map_ = new jsnx.contrib.Map();

  if (goog.isDefAndNotNull(opt_data)) {
    if (jsnx.helper.isIterator(opt_data) || goog.isArrayLike(opt_data)) {
      jsnx.helper.forEach(opt_data, function(datum) {
        this.add(datum);
      }, this);
    }
  }
};
goog.exportSymbol('jsnx.Set', jsnx.contrib.Set);


/**
 * Returns true if the key is in the map.
 *
 * @param {*} value
 *
 * @return {boolean}
 * @export
 */
jsnx.contrib.Set.prototype.has = function(value) {
  return this.map_.has(value);
};


/**
 * Adds the value and key to the map.
 *
 * @param {*} value
 *
 * @export
 */
jsnx.contrib.Set.prototype.add = function(value) {
  this.map_.set(value, true);
};


/**
 * Remove value with given key.
 *
 * @param {*} value
 *
 * @export
 */
jsnx.contrib.Set.prototype.remove = function(value) {
  try {
    this.map_.remove(value);
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
  }
};


/**
 * Creates a deep copy of the set.
 *
 * @param {Array=} opt_memo Array containing already cloned objects.
 * 
 * @return {jsnx.contrib.Set}
*/
jsnx.contrib.Set.prototype.copy = function(opt_memo) {
  return jsnx.helper.deepcopy_instance(this, opt_memo);
};


/**
 * Returns an array of values.
 *
 * @return {!Array}
 * @export
*/
jsnx.contrib.Set.prototype.values = function() {
  return this.map_.keys();
};


/**
 * Iterator for 'goog.iter'.
 *
 * @return {goog.iter.Iterator}
*/
jsnx.contrib.Set.prototype.__iterator__ = function() {
  return goog.iter.map(this.map_, function(kv) {
    return kv[0];
  });
};


/**
 * Returns a new set without the values found in other sets.
 *
 * @param {...(jsnx.contrib.Set|Array)} var_args
 * @export
 */
jsnx.contrib.Set.prototype.difference = function(var_args) {
  var result = new jsnx.contrib.Set(this.values());
  for (var i = 0, l = arguments.length; i < l; i++) {
    var values = arguments[i];
    if (values instanceof jsnx.contrib.Set) {
      values = values.values();
    }
    for (var j = 0, jl = values.length; j < jl; j++) {
      result.remove(values[j]);
    }
  }
  return result;
};


/**
 * Returns a new set containing only elements found in every set.
 *
 * @param {...(jsnx.contrib.Set|Array)} var_args
 * @export
 */
jsnx.contrib.Set.prototype.intersection = function(var_args) {
  var result = new jsnx.contrib.Set();
  for (var i = 0, l = arguments.length; i < l; i++) {
    var values = arguments[i];
    if (values instanceof jsnx.contrib.Set) {
      values = values.values();
    }
    for (var j = 0, jl = values.length; j < jl; j++) {
      if (this.has(values[j])) {
        result.add(values[j]);
      }
    }
  }
  return result;
};


/**
 * Returns the number of element in the set.
 *
 * THIS IS A NON-STANDARD METHOD!
 *
 * @return {number}
 * @export
*/
jsnx.contrib.Set.prototype.count = function() {
  return this.map_.count();
};


/**
 * Empties the set.
 *
 * THIS IS A NON-STANDARD METHOD!
 * @export
*/
jsnx.contrib.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Executes the provided callback for each item in the set.
 *
 * THIS IS A NON-STANDARD METHOD!
 *
 * @param {function(*)} callback A function which gets the key as first 
 *  argument and value as second argument.
 * @param {*=} opt_this Object/value to set this to inside the callback
 * @export
*/
jsnx.contrib.Set.prototype.forEach = function(callback, opt_this) {
  goog.iter.forEach(this, callback, opt_this);
};
