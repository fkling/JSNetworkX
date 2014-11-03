/*globals assert*/
"use strict";

var gcd = require('../gcd');

exports.gcd = function() {
  assert.strictEqual(gcd(48, 18), 6);
  assert.strictEqual(gcd(54, 24), 6);
  assert.strictEqual(gcd(48, 180), 12);
};
