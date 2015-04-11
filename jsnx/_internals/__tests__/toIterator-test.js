/*global assert, utils*/
'use strict';

import toIterator from '../toIterator';

function* generator() { yield 0; }

export var testToIterator = {
  'from iterator (identity)': function() {
    var iterator = generator();
    assert.strictEqual(
      toIterator(iterator),
      iterator
    );
  },

  'from iterable (e.g. Map)': function() {
    var data = [[1,2], [3,4]];
    var map = new utils.Map(data);

    var iterator = toIterator(map);
    assert(utils.isIterator(iterator));

    assert.deepEqual(Array.from(iterator), data);
  },

  'from graph': false, // TODO

  'from array-like object': function() {
    var data = [1,2,3];
    var iterator = toIterator(data);

    assert(utils.isIterator(iterator));
    assert.deepEqual(Array.from(iterator), data);
  }

};
