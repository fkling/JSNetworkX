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

/**
 * @param {Iterable=} opt_data An object, array or iterator to
 *  populate the map with. If 'data' is an array or iterable, each element is
 *  expected to be a 2-tuple. The first element will be the key and second the
 *  value.
 *  If it is an object, the property names will be the keys and the value the
 *  values.
 * @constructor
 */
class Map {
  constructor(opt_data) {
    // Can't use class syntax because of generator functions
    this._string_values = Object.create(null); // strings
    this._number_values = Object.create(null); // numbers
    this._values = Object.create(null); // every other value
    this._keys = Object.create(null);

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
  _getStorage(key) {
    switch (typeof key) {
      case 'number':
        return this._number_values;
      case 'string':
        return this._string_values;
      default:
        return this._values;
      }
  }

  /**
   * Returns the value for the given key.
   *
   * @param {*} key
   *
   * @return {*}
   * @export
   */
  get(key) {
    return this._getStorage(key)[key];
  }

  /**
   * Returns true if the key is in the map.
   *
   * @param {*} key
   *
   * @return {boolean}
   * @export
   */
  has(key) {
    return typeof this.get(key) !== 'undefined';
  }

  /**
   * Adds the value and key to the map.
   *
   * @param {*} key
   * @param {*} value
   *
   * @return {Map} the map object itself
   * @export
   */
  set(key, value) {
    var values = this._getStorage(key);
    values[key] = value;

    // save actual key value
    if (values === this._values) {
      this._keys[key] = key;
    }

    return this;
  }

  /**
   * Remove value with given key.
   *
   * @param {*} key
   *
   * @return {boolean}
   * @export
   */
  delete(key) {
    var values = this._getStorage(key);
    if (typeof values[key] !== 'undefined') {
      delete values[key];
      if (values === this._values) {
        delete this._keys[key];
      }
      return true;
    }
    return false;
  }

  /**
   * Returns an array of (key, value) tuples.
   *
   * @return {!Iterator}
   * @export
  */
  *entries() {
    var key;
    for (key in this._number_values) {
      yield [+key, this._number_values[key]];
    }
    for (key in this._string_values) {
      yield [key, this._string_values[key]];
    }
    for (key in this._values) {
      yield [this._keys[key], this._values[key]];
    }
  }

  /**
   * Returns an iterator over keys.
   *
   * @return {!Iterator}
   * @export
  */
  *keys() {
    var key;
    for (key in this._number_values) {
      yield +key;
    }
    for (key in this._string_values) {
      yield key;
    }
    for (key in this._values) {
      yield this._keys[key];
    }
  }

  /**
   * Returns an array of values.
   *
   * @return {!Array}
   * @export
  */
  *values() {
    var key;
    for (key in this._number_values) {
      yield this._number_values[key];
    }
    for (key in this._string_values) {
      yield this._string_values[key];
    }
    for (key in this._values) {
      yield this._values[key];
    }
  }

  /**
   * Returns the number of element in the map.
   *
   * @return {number}
   * @export
  */
  get size() {
    return size(this._values) +
      size(this._number_values) +
      size(this._string_values);
  }

  /**
   * Empties the map.
   *
   * @export
  */
  clear() {
    clear(this._string_values);
    clear(this._number_values);
    clear(this._values);
    clear(this._keys);
  }

  /**
   * Executes the provided callback for each item in the map.
   *
   * @param {function(*,*)} callback A function which gets the key as first
   *  argument and value as second argument.
   * @param {*=} opt_this Object/value to set this to inside the callback
   * @export
  */
  forEach(callback, opt_this) {
    if (!isFunction(callback)) {
      throw new TypeError('callback must be a function');
    }
    for (var v of this.entries()) {
      callback.call(opt_this, v[1], v[0], this);
    }
  }
}

/**
* Returns an iterator for the map object.
*
* @return {Iterator}
*/
Map.prototype['@@iterator'] = Map.prototype.entries;

module.exports = Map;
