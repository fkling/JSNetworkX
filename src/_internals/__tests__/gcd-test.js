/*globals assert*/
'use strict';

import gcd from '../gcd';

export var testGcd = function() {
  assert.strictEqual(gcd(48, 18), 6);
  assert.strictEqual(gcd(54, 24), 6);
  assert.strictEqual(gcd(48, 180), 12);
};
