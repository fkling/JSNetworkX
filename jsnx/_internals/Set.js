"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString().
 */

/*jshint ignore:start */
var Map = require('./Map');
/*jshint ignore:end */
var iteratorSymbol = require('./iteratorSymbol');
var toIterator = require('./itertools/toIterator');

class Set {

  /**
   * @param {Iterable} opt_data An object, array or iterator to populate the set
   * with.
   */
  constructor(optData) {
    this._map = new Map();

    if (optData != null) {
      for (var v of toIterator(optData)) {
        this.add(v);
      }
    }
  }

  /**
   * Returns true if the key is in the map.
   *
   * @param {*} value
   *
   * @return {boolean}
   */
  has(value) {
    return this._map.has(value);
  }

  /**
   * Adds the value and key to the map.
   *
   * @param {*} value
   *
   * @export
   */
  add(value) {
    this._map.set(value, true);
  }

  /**
   * Remove value with given key.
   *
   * @param {*} value
   *
   * @export
   */
  delete(value) {
    return this._map.delete(value);
  }

  /**
   * Returns an array of values.
   *
   * @return {!Iterator}
   * @export
   */
  values() {
    return this._map.keys();
  }

  /**
   * Returns an array of values.
   *
   * @return {!Iterator}
   * @export
   */
  keys() {
    return this.values();
  }

  /**
   * Returns an array of values.
   *
   * @return {!Iterator}
   * @export
   */
  *entries() {
    for (var v of this.values()) {
      yield [v, v];
    }
  }

  /**
   * Returns the number of element in the set.
   *
   * @return {number}
   * @export
   */
  get size() {
    return this._map.size;
  }

  /**
   * Empties the set.
   *
   * @export
   */
  clear() {
    this._map.clear();
  }

  /**
   * Executes the provided callback for each item in the set.
   *
   * @param {function(*)} callback A function which gets the key as first
   *  argument and value as second argument.
   * @param {*=} opt_this Object/value to set this to inside the callback
   * @export
  */
  forEach(callback, optThis) {
    for (var v of this.values()) {
      callback.call(optThis, v, v, this);
    }
  }

}

/**
 * Returns an iterator for the set object.
 *
 * @return {Iterator}
 */
Set.prototype[iteratorSymbol] = Set.prototype.values;

module.exports = Set;
