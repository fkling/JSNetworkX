'use strict';
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString().
 */

import Map from './Map';
import toIterator from './toIterator';

export default class Set {

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


  /** EXTENSIONS **/
  /**
   * The following methods are not part of the ES6 Set class but are provided
   * for convenience. Once Sets become more widely available, we could simply
   * extend the native Set class.
   */

  /**
   * Returns a new set with the values of this set, not found in the other
   * sets.
   *
   * @param {...(Set|Array)} others
   */
  difference(...others) {
    var result = new Set(this);
    for (var i = 0, l = others.length; i < l; i++) {
      for (var v of others[i]) {
        result.delete(v);
      }
    }
    return result;
  }

  /**
   * Returns a new set containing only elements found in this and every
   * other set/array.
   *
   * @param {...(Set|Array)} others
   */
  intersection(...others) {
    var result = new Set();
    for (var v of this) {
      /* eslint-disable no-loop-func */
      if (others.every(other => other.has(v))) {
        result.add(v);
      }
      /* eslint-enable no-loop-func */
    }
    return result;
  }

  /**
   * Removes and returns an element from the set.
   *
   * @return {?}
   */
  pop() {
    try {
      var value = this.values().next().value;
      this.delete(value);
      return value;
    } catch (ex) {} // eslint-disable-line no-empty
  }

  /**
   * Returns an iterator for the set object.
   *
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return this.values();
  }
}

export function symmetricDifference(a, b) {
  let c = new Set(a);
  for (let v of b) {
    if (a.has(v)) {
      c.delete(v);
    } else {
      c.add(v);
    }
  }

  return c;
}

export function union(a, b) {
  let c = new Set(a);
  for (let v of b) {
    c.add(v);
  }
  return c;
}
