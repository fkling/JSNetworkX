/*global utils, assert*/
'use strict';

import genCombinations from '../genCombinations';

export var testGenCombinations = {
  combinations: function() {
    var combinations = genCombinations([0,1,2,3], 3);
    assert(utils.isIterator(combinations));
    assert.deepEqual(
      Array.from(combinations),
      [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]
    );
  },

  'combinations size > elements': function() {
    var combinations = genCombinations([0,1,2,3], 10);
    assert(utils.isIterator(combinations));
    assert.deepEqual(Array.from(combinations), []);
  },

  'empty sequence': function() {
    var combinations = genCombinations([], 2);
    assert(utils.isIterator(combinations));
    assert.deepEqual(Array.from(combinations), []);
  }
};
