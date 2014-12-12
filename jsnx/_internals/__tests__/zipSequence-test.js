/*global assert, utils*/
"use strict";

var zip = require('../zipSequence');

function* gen(data) {
  for (var i = 0; i < data.length; i++) {
    yield data[i];
  }
}

exports.zipSequence = {
  'zip arrays': function() {
    assert.deepEqual(
      zip([1,2,3], [4,5,6], [7,8,9]),
      [[1,4,7],[2,5,8],[3,6,9]]
    );
  },

  'zip arrays-like objects': function() {
    assert.deepEqual(
      zip({length: 2, 0: 1, 1: 2}, {length: 3, 0: 3, 1: 4, 2: 5}),
      [[1,3],[2,4]]
    );
  },

  'zip iterators': function() {
    assert.deepEqual(
      utils.iteratorToArray(zip(gen([1,2,3]), gen([4, 5]))),
      [[1,4],[2,5]]
    );
  },

  'zip objects (keys)': function() {
    var obj1 = {foo: 42, bar: 42};
    var obj2 = {x: 0, y: 0, z: 0};

    assert.deepEqual(
      zip(obj1, obj2),
      [['foo','x'],['bar','y']]
    );
  }
};
