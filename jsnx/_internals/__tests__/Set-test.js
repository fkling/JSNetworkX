/*global assert*/

import Set from '../Set';

export var testSet = {
  testCreate: function() {
    var set = new Set();
    assert(set);
  },

  testAddElements: function() {
    var set = new Set([1,2,3]);
    assert.deepEqual(Array.from(set.values()).sort(), [1,2,3]);

    set = new Set();
    set.add(1);
    set.add('4');
    assert(set.has(1));
    assert(set.has('4'));
  },

  testRemoveElements: function() {
    var set = new Set([1,2,3]);
    set.delete(2);
    assert(!set.has(2));
    assert(set.has(1));
    assert(set.has(3));
  },

  testCount: function() {
    var set = new Set([1,2,3]);
    assert.equal(set.size, 3);
  },

  difference: {
    'single argument - different set, same elements': function() {
      var set = new Set([1,2,3]);
      var diff = set.difference();

      assert.notEqual(diff, set);
      assert.deepEqual(diff, set);
    },

    'two arguments': function() {
      var diff = new Set([1,2,3,4]).difference(new Set([2,4]));

      assert.deepEqual(diff, new Set([1,3]));
    },

    'multiple arguments': function() {
      var diff = new Set([1,2,3,4]).difference(new Set([2, 6]), new Set([4]));

      assert.deepEqual(diff, new Set([1,3]));
    }

  },

  intersection: {
    'two arguments': function() {
      var diff = new Set([1,2,3,4]).intersection(new Set([2,4]));

      assert.deepEqual(diff, new Set([2,4]));
    },

    'multiple arguments': function() {
      var diff = new Set([1,2,3,4])
        .intersection(new Set([2, 6]), new Set([2, 4]));

      assert.deepEqual(diff, new Set([2]));
    }
  }

};
