"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString()
 * and does not accept arrays as keys (just like Python does not accept lists).
 */

goog.provide('jsnx.contrib.Map');

goog.require('jsnx.contrib.misc');
goog.require('jsnx.exception');
goog.require('goog.object');
goog.require('goog.iter');


/**
 * @param {jsnx.helper.Iterable=} opt_data An object, array or iterator to 
 *  populate the map with. If 'data' is an array or iterable, each element is 
 *  expected to be a 2-tuple. The first element will be the key and second the 
 *  value. 
 *  If it is an object, the property names will be the keys and the value the 
 *  values.
 * @constructor
 * @export
 */
jsnx.contrib.Map = function(opt_data) {
  this.string_values_ = {}; // strings
  this.number_values_ = {}; // numbers
  this.values_ = {}; // every other value
  this.keys_ = {};

  if (goog.isDefAndNotNull(opt_data)) {
    if (jsnx.helper.isIterator(opt_data) || goog.isArrayLike(opt_data)) {
      jsnx.helper.forEach(opt_data, function(datum) {
        this.set.apply(this, datum);
      }, this);
    }
    else if (goog.isObject(opt_data)) {
      for (var k in opt_data) {
        this.set(isNaN(+k) ? k : +k, opt_data[k]);
      }
    }
  }
};
goog.exportSymbol('jsnx.Map', jsnx.contrib.Map);


/**
 * Returns the appropriate storage object for a given key.
 *
 * @param {*} key
 * @return {Object}
 * @private
 */
jsnx.contrib.Map.prototype.get_storage_ = function(key) {
  switch (typeof key) {
    case 'number':
      return this.number_values_;
    case 'string':
      return this.string_values_;
    default:
      return this.values_;
  }
};


/**
 * Returns the value for the given key.
 * 
 * @param {*} key
 * @param {*=} opt_default_value
 *
 * @return {*}
 * @export
 */
jsnx.contrib.Map.prototype.get = function(key, opt_default_value) {
  var values = this.get_storage_(key);

  if (typeof values[key] !== 'undefined') {
    return values[key];
  }
  else if (goog.isDef(opt_default_value)) {
    return opt_default_value;
  }

  throw new jsnx.exception.KeyError(
    'Map does not contain key ' + goog.json.serialize(key)
  );
};


/**
 * Returns true if the key is in the map.
 *
 * @param {*} key
 *
 * @return {boolean}
 * @export
 */
jsnx.contrib.Map.prototype.has = function(key) {
  return typeof this.get_storage_(key)[key] !== 'undefined';
};


/**
 * Adds the value and key to the map.
 *
 * @param {*} key
 * @param {*} value
 *
 * @export
 */
jsnx.contrib.Map.prototype.set = function(key, value) {
  var values = this.get_storage_(key);
  values[key] = value;

  // save actual key value
  if (values === this.values_) {
    this.keys_[key] = key;
  }

  return value;
};


/**
 * Remove value with given key.
 *
 * @param {*} key
 *
 * @export
 */
jsnx.contrib.Map.prototype.remove = function(key) {
  var values = this.get_storage_(key);
  if (typeof values[key] !== 'undefined') {
    delete values[key];
    if (values === this.values_) {
      delete this.keys_[key];
    }
    return;
  }
  throw new jsnx.exception.KeyError(
    'Map does not contain key ' + goog.json.serialize(key)
  );
};


/**
 * Returns an array of (key, value) tuples.
 *
 * @return {!Array}
 * @export
*/
jsnx.contrib.Map.prototype.items = function() {
  var items = [];
  var key;
  for (key in this.number_values_) {
    items.push([+key, this.number_values_[key]]);
  }
  for (key in this.string_values_) {
    items.push([key, this.string_values_[key]]);
  }
  for (key in this.values_) {
    items.push([this.keys_[key], this.values_[key]]);
  }
  return items;
};


/**
 * Creates a deep copy of the map.
 *
 * @param {Array=} opt_memo Array containing already cloned objects.
 * 
 * @return {jsnx.contrib.Map}
*/
jsnx.contrib.Map.prototype.copy = function(opt_memo) {
  return jsnx.helper.deepcopy_instance(this, opt_memo);
};


/**
 * Returns an array of keys.
 *
 * @return {!Array}
 * @export
*/
jsnx.contrib.Map.prototype.keys = function() {
  return goog.array.map(
    goog.object.getKeys(this.number_values_),
    function(val) { return +val; }
  )
  .concat(goog.object.getKeys(this.string_values_))
  .concat(goog.object.getValues(this.keys_));
};


/**
 * Returns an array of values.
 *
 * @return {!Array}
 * @export
*/
jsnx.contrib.Map.prototype.values = function() {
  return goog.object.getValues(this.number_values_)
  .concat(goog.object.getValues(this.string_values_))
  .concat(goog.object.getValues(this.values_));
};


/**
 * Iterator for 'goog.iter'.
 *
 * @return {goog.iter.Iterator}
*/
jsnx.contrib.Map.prototype.__iterator__ = function() {
  var iter = new goog.iter.Iterator();
  var string_keys = goog.object.getKeys(this.string_values_);
  var number_keys = goog.object.getKeys(this.number_values_);
  var keys = goog.object.getKeys(this.values_);
  var i = 0;
  var j = 0;
  var k = 0;

  iter.next = goog.bind(function() {
    var key;
    if (i < number_keys.length) {
      key = number_keys[i++];
      return [+key, this.number_values_[key]];
    }
    else if (j < string_keys.length) {
      key = string_keys[j++];
      return [key, this.string_values_[key]];
    }
    else if (k < keys.length) {
      key = keys[k++];
      return [this.keys_[key], this.values_[key]];
    }
    throw goog.iter.StopIteration;
  }, this);

  return iter;
};


/**
 * Returns the number of element in the map.
 *
 * THIS IS A NON-STANDARD METHOD!
 *
 * @return {number}
 * @export
*/
jsnx.contrib.Map.prototype.count = function() {
  return goog.object.getCount(this.values_) + 
    goog.object.getCount(this.number_values_) +
    goog.object.getCount(this.string_values_);
};


/**
 * Empties the map.
 *
 * THIS IS A NON-STANDARD METHOD!
 * @export
*/
jsnx.contrib.Map.prototype.clear = function() {
  goog.object.clear(this.string_values_);
  goog.object.clear(this.number_values_);
  goog.object.clear(this.values_);
  goog.object.clear(this.keys_);
};


/**
 * Executes the provided callback for each item in the map.
 *
 * THIS IS A NON-STANDARD METHOD!
 *
 * @param {function(*,*)} callback A function which gets the key as first 
 *  argument and value as second argument.
 * @param {*=} opt_this Object/value to set this to inside the callback
 * @export
*/
jsnx.contrib.Map.prototype.forEach = function(callback, opt_this) {
  goog.iter.forEach(this, function(kv) {
    callback.apply(opt_this, kv);
  });
};
