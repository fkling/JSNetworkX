"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString()
 * and does not accept arrays as keys (just like Python does not accept lists).
 */

var clear = require('./clear');
var collections_forEach = require('lodash-node/modern/collections/forEach');
var isIterator = require('./isIterator');
var isFunction = require('lodash-node/modern/objects/isFunction');
var isObject = require('lodash-node/modern/objects/isObject');
var isArrayLike = require('./isArrayLike');
var size = require('lodash-node/modern/collections/size');

// We have to load the regenerator runtime, even if we don't access it
var regnerator = require('regenerator');

/**
 * @param {Iterable=} opt_data An object, array or iterator to 
 *  populate the map with. If 'data' is an array or iterable, each element is
 *  expected to be a 2-tuple. The first element will be the key and second the
 *  value.
 *  If it is an object, the property names will be the keys and the value the
 *  values.
 * @constructor
 */
function Map(opt_data) {
  // Can't use class syntax because of generator functions
  this.string_values_ = Object.create(null); // strings
  this.number_values_ = Object.create(null); // numbers
  this.values_ = Object.create(null); // every other value
  this.keys_ = Object.create(null);

  if (opt_data != null) {
    if (isIterator(opt_data)) {
      for (var datum of opt_data) {
        this.set.apply(this, datum);
      }
    }
    else if(isArrayLike(opt_data)) {
      collections_forEach(opt_data, function(datum) {
        this.set.apply(this, datum);
      }, this);
    }
    else if (isObject(opt_data)) {
      for (var k in opt_data) {
        this.set(isNaN(+k) ? k : +k, opt_data[k]);
      }
    }
  }
}

/**
 * Returns the appropriate storage object for a given key.
 *
 * @param {*} key
 * @return {Object}
 * @private
 */
Map.prototype._getStorage = function(key) {
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
 *
 * @return {*}
 * @export
 */
Map.prototype.get = function(key) {
  return this._getStorage(key)[key];
};

/**
 * Returns true if the key is in the map.
 *
 * @param {*} key
 *
 * @return {boolean}
 * @export
 */
Map.prototype.has = function(key) {
  return typeof this.get(key) !== 'undefined';
};

/**
 * Adds the value and key to the map.
 *
 * @param {*} key
 * @param {*} value
 *
 * @return {Map} the map object itself
 * @export
 */
Map.prototype.set = function(key, value) {
  var values = this._getStorage(key);
  values[key] = value;

  // save actual key value
  if (values === this.values_) {
    this.keys_[key] = key;
  }

  return this;
};

/**
 * Remove value with given key.
 *
 * @param {*} key
 *
 * @return {boolean}
 * @export
 */
Map.prototype.delete = function(key) {
  var values = this._getStorage(key);
  if (typeof values[key] !== 'undefined') {
    delete values[key];
    if (values === this.values_) {
      delete this.keys_[key];
    }
    return true;
  }
  return false;
};

/**
 * Returns an array of (key, value) tuples.
 *
 * @return {!Iterator}
 * @export
*/
Map.prototype.entries = function*() {
  var key;
  for (key in this.number_values_) {
    yield [+key, this.number_values_[key]];
  }
  for (key in this.string_values_) {
    yield [key, this.string_values_[key]];
  }
  for (key in this.values_) {
    yield [this.keys_[key], this.values_[key]];
  }
};

/**
 * Returns an iterator over keys.
 *
 * @return {!Iterator}
 * @export
*/
Map.prototype.keys = function*() {
  var key;
  for (key in this.number_values_) {
    yield +key;
  }
  for (key in this.string_values_) {
    yield key;
  }
  for (key in this.values_) {
    yield this.keys_[key];
  }
};

/**
 * Returns an array of values.
 *
 * @return {!Array}
 * @export
*/
Map.prototype.values = function*() {
  var key;
  for (key in this.number_values_) {
    yield this.number_values_[key];
  }
  for (key in this.string_values_) {
    yield this.string_values_[key];
  }
  for (key in this.values_) {
    yield this.values_[key];
  }
};

/**
 * Returns the number of element in the map.
 *
 * @return {number}
 * @export
*/
Object.defineProperty(Map.prototype, 'size', {
  get:  function() {
    return size(this.values_) +
      size(this.number_values_) +
      size(this.string_values_);
  }
});

/**
 * Empties the map.
 *
 * @export
*/
Map.prototype.clear = function() {
  clear(this.string_values_);
  clear(this.number_values_);
  clear(this.values_);
  clear(this.keys_);
};

/**
 * Executes the provided callback for each item in the map.
 *
 * @param {function(*,*)} callback A function which gets the key as first 
 *  argument and value as second argument.
 * @param {*=} opt_this Object/value to set this to inside the callback
 * @export
*/
Map.prototype.forEach = function(callback, opt_this) {
  if (!isFunction(callback)) {
    throw new TypeError('callback must be a function');
  }
  for (var v of this.entries()) {
    callback.call(opt_this, v[1], v[0], this);
  }
};

/**
* Returns an iterator for the map object.
*
* @return {Iterator}
*/
Map.prototype['@@iterator'] = Map.prototype.entries;

module.exports = Map;
