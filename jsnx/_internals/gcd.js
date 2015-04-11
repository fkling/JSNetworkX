'use strict';

/**
 * Computes the greatest common divisor of two numbers using Euclid's algorithm.
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
export default function gcd(a, b) {
  while (b !== 0) {
    var _ = a;
    a = b;
    b = _ % b;
  }
  return a;
}
