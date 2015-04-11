'use strict';

var t2 = new Array(2);
var t3 = new Array(3);
var t4 = new Array(4);

/**
 * This function always returns the same instance of an array for a given number
 * of arguments.
 * It should be used instead of creating temporary arrays, if the arrays are
 * consumed immediately anyways.
 *
 * @param {...*} var_args The elemens of the tuple
 * @return {Array}
 */
export function tuple2(x, y) {
  t2[0] = x;
  t2[1] = y;
  return t2;
}

export function tuple3(x, y, z) {
  t3[0] = x;
  t3[1] = y;
  t3[2] = z;
  return t3;
}

export function tuple4(a, b, c, d) {
  t4[0] = a;
  t4[1] = b;
  t4[2] = c;
  t4[3] = d;
  return t4;
}

/**
 * Same as tuple2, but sets the values on container instead of the allocated
 * array here. Useful to reuse an existing array.
 *
 * @param {...*} var_args The elemens of the tuple
 * @param {Array} opt_container If present, set values there instead
 * @return {Array}
 */
export function tuple2c(x, y, container) {
  container.length = 2;
  container[0] = x;
  container[1] = y;
  return container;
}

export function tuple3c(x, y, z, container) {
  container.length = 3;
  container[0] = x;
  container[1] = y;
  container[2] = z;
  return container;
}

export function tuple4c(a, b, c, d, container) {
  container.length = 4;
  container[0] = a;
  container[1] = b;
  container[2] = c;
  container[3] = d;
  return container;
}

export function createTupleFactory(count) {
  var t = new Array(count);
  switch (count) {
    case 2:
      return function(a, b) {
        t[0] = a;
        t[1] = b;
        return t;
      };
    case 3:
      return function(a, b, c) {
        t[0] = a;
        t[1] = b;
        t[2] = c;
        return t;
      };
    default:
      throw new Error('Typle size not supported.');
  }
}
