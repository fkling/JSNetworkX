"use strict";

var t2 = new Array(2);
var t3 = new Array(3);

/**
 * This function always returns the same instance of an array for a given number
 * of arguments.
 * It should be used instead of creating temporary arrays, if the arrays are
 * consumed immediately anyways.
 *
 * @param {...*} var_args The elemens of the tuple
 * @return {Array}
 */
function tuple2(x, y) {
  t2[0] = x;
  t2[1] = y;
  return t2;
}

function tuple3(x, y, z) {
  t3[0] = x;
  t3[1] = y;
  t3[2] = z;
  return t3;
}

/**
 * Same as tuple2, but sets the values on container instead of the allocated
 * array here. Useful to reuse an existing array.
 *
 * @param {...*} var_args The elemens of the tuple
 * @param {Array} opt_container If present, set values there instead
 * @return {Array}
 */
function tuple2c(x, y, container) {
  container[0] = x;
  container[1] = y;
  return container;
}

function tuple3c(x, y, z, container) {
  container[0] = x;
  container[1] = y;
  container[2] = z;
  return container;
}

exports.tuple2 = tuple2;
exports.tuple3 = tuple3;
exports.tuple2c = tuple2c;
exports.tuple3c = tuple3c;
