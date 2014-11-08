/*globals assert, utils*/
"use strict";

var someIterator = require('../someIterator');

exports.someIterator = function() {
  assert.ok(someIterator(utils.genRange(10), x => x % 2 === 0));
  assert.ok(!someIterator(utils.genRange(3), x => x === 5));
  assert.ok(!someIterator(utils.genRange(0), _ => true));
};
