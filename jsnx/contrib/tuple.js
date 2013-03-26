"use strict";

/**
 * @fileoverview
 *
 * Since JavaScript does not support immutable sequences, such as tuples in
 * Python, this file provides a tuple like "class" which creates immutable
 * sequences. 
 * In browsers which support it, 'Object.freeze' will be used to enforce
 * immutability.
 */

goog.provide('jsnx.contrib.Tuple');

goog.require('goog.object');

/**
 * Creates a tuple (array-like object) which is supposed to be immutable.
 *
 * @param {...*} var_args Elements of the tuple. Can be any type.
 *  If only one argument is passed and it is an array, all elements of the array
 *  will be added to the tuple.
 *
 * @constructor
 */
jsnx.contrib.Tuple = function(var_args) {
  var args = arguments;
  if (arguments.length === 1 && goog.isArrayLike(arguments[0])) {
    args = arguments[0];
  }

  this.__hash__ = 't';
  for (var i = 0, l = args.length; i < l; i++) {
    this[i] = args[i];
    this.__hash__ += jsnx.contrib.misc.get_hash(args[i]);
  }
  this['length'] = args.length;

  // try to freeze the object
  return goog.object.createImmutableView(this);
};

/**
 * The hash of the tuple, used in graph node dictionaries.
 *
 * @type {string}
 * @private
 */
jsnx.contrib.Tuple.prototype.__hash__ = '';


/**
 * Number of elements in the tuple.
 *
 * @type {number}
 * @export
 */
jsnx.contrib.Tuple.prototype.length = 0;


/**
 * Computes and returns the hash of the object if it does not exist yet.
 * 
 * @return {string}
 * @override
 * @export
 */
jsnx.contrib.Tuple.prototype.toString = function() {
  return this.__hash__;
};


/**
 * Creates a tuple with the given arguments.
 * 
 * @param {...*} var_args
 * @return {jsnx.contrib.Tuple}
 */
jsnx.contrib.Tuple.createTuple = function(var_args) {
  if (goog.isArrayLike(arguments[0])) {
    return new jsnx.contrib.Tuple(arguments[0]);
  }
  return new jsnx.contrib.Tuple(arguments);
};
goog.exportSymbol('jsnx.Tuple', jsnx.contrib.Tuple.createTuple);
goog.exportSymbol('jsnx.t', jsnx.contrib.Tuple.createTuple);
