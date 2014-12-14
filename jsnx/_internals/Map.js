"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString()
 * and does not accept arrays as keys (just like Python does not accept lists).
 */

var clear = require('./clear');
var collectionsForEach = require('lodash-node/modern/collections/forEach');
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
  constructor(optData) {
    // Can't use class syntax because of generator functions
    this._stringValues = Object.create(null); // strings
    this._numberValues = Object.create(null); // numbers
    this._values = Object.create(null); // every other value
    this._keys = Object.create(null);

    if (optData != null) {
      if (isIterator(optData)) {
        for (var datum of optData) {
          this.set.apply(this, datum);
        }
      }
      else if(isArrayLike(optData)) {
        collectionsForEach(optData, function(datum) {
          this.set.apply(this, datum);
        }, this);
      }
      else if (isObject(optData)) {
        for (var k in optData) {
          this.set(isNaN(+k) ? k : +k, optData[k]);
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
        return this._numberValues;
      case 'string':
        return this._stringValues;
      default:
        return this._values;
      }
  }

  /**
   * Returns the value for the given key.
   *
   * Unlike native ES6 maps, this also accepts a default value which is returned
   * if the map does not contain the value.
   *
   * @param {*} key
   * @param {*=} optDefaultValue
   *
   * @return {*}
   * @export
   */
  get(key, optDefaultValue) {
    var storage = this._getStorage(key);
    return key in storage ? storage[key] : optDefaultValue;
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
    return key in this._getStorage(key);
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
    if (key in values) {
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
    for (key in this._numberValues) {
      yield [+key, this._numberValues[key]];
    }
    for (key in this._stringValues) {
      yield [key, this._stringValues[key]];
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
    for (key in this._numberValues) {
      yield +key;
    }
    for (key in this._stringValues) {
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
    for (key in this._numberValues) {
      yield this._numberValues[key];
    }
    for (key in this._stringValues) {
      yield this._stringValues[key];
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
      size(this._numberValues) +
      size(this._stringValues);
  }

  /**
   * Empties the map.
   *
   * @export
  */
  clear() {
    clear(this._stringValues);
    clear(this._numberValues);
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
  forEach(callback, optThis) {
    if (!isFunction(callback)) {
      throw new TypeError('callback must be a function');
    }
    for (var v of this.entries()) {
      callback.call(optThis, v[1], v[0], this);
    }
  }

  /**
  * Returns an iterator for the map object.
  *
  * @return {Iterator}
  */
  [Symbol.iterator]() {
    return this.entries();
  }
}

module.exports = Map;
