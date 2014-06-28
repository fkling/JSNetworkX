"use strict";
/**
 * @fileoverview
 * A shim for ES6 maps and support for custom hash functions via toString()
 * and does not accept arrays as keys (just like Python does not accept lists).
 */

var Map = require('./Map');
var toIterator = require('./itertools/toIterator');

/**
 * @param {Iterable} opt_data An object, array or iterator to  populate the map
 * with.
 * @constructor
 */
function Set(opt_data) {
  this.map_ = new Map();

  if (opt_data != null) {
    for (var v of toIterator(opt_data)) {
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
 * @export
 */
Set.prototype.has = function(value) {
  return this.map_.has(value);
};

/**
 * Adds the value and key to the map.
 *
 * @param {*} value
 *
 * @export
 */
Set.prototype.add = function(value) {
  this.map_.set(value, true);
};


/**
 * Remove value with given key.
 *
 * @param {*} value
 *
 * @export
 */
Set.prototype.delete = function(value) {
  return this.map_.delete(value);
};


/**
 * Returns an array of values.
 *
 * @return {!Iterator}
 * @export
*/
Set.prototype.values = function() {
  return this.map_.keys();
};

/**
 * Returns an array of values.
 *
 * @return {!Iterator}
 * @export
*/
Set.prototype.keys = Set.prototype.values;

/**
 * Returns an array of values.
 *
 * @return {!Iterator}
 * @export
*/
Set.prototype.entries = function*() {
  for (var v of this.values()) {
    yield [v, v];
  }
};

/**
 * @return {Iterator}
*/
Set.prototype['@@iterator'] = Set.prototype.values;

/**
 * Returns the number of element in the set.
 *
 * @return {number}
 * @export
*/
Object.defineProperty(Set.prototype, 'size', {
  get: function() {
    return this.map_.size;
  }
});

/**
 * Empties the set.
 *
 * @export
*/
Set.prototype.clear = function() {
  this.map_.clear();
};

/**
 * Executes the provided callback for each item in the set.
 *
 * @param {function(*)} callback A function which gets the key as first 
 *  argument and value as second argument.
 * @param {*=} opt_this Object/value to set this to inside the callback
 * @export
*/
Set.prototype.forEach = function(callback, opt_this) {
  for (var v of this.values()) {
    callback.call(opt_this, v, v, this);
  }
};

/**
 * Returns an iterator for the set object.
 *
 * @return {Iterator}
 */
Set.prototype['@@iterator'] = Set.prototype.entries;

module.exports = Map;

module.exports = Set;
