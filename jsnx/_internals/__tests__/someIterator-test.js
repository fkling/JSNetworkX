/*globals assert, utils*/
'use strict';

import someIterator from '../someIterator';

export var testSomeIterator = function() {
  assert.ok(someIterator(utils.genRange(10), x => x % 2 === 0));
  assert.ok(!someIterator(utils.genRange(3), x => x === 5));
  assert.ok(!someIterator(utils.genRange(0), () => true));
};
