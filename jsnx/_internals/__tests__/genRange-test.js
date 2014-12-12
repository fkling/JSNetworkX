/*global assert*/
"use strict";

var {
  genRange,
  isIterator,
  iteratorToArray
} = require('../');

exports.genRange = {
  'end': function() {
    var range = genRange(5);
    assert(isIterator(range));
    assert.deepEqual(iteratorToArray(range), [0,1,2,3,4]);
  },

  'start - end': function() {
    var range = genRange(5,10);
    assert(isIterator(range));
    assert.deepEqual(iteratorToArray(range), [5,6,7,8,9]);
  },

  'start - end - step': function() {
    var range = genRange(0,10,2);
    assert(isIterator(range));
    assert.deepEqual(iteratorToArray(range), [0,2,4,6,8]);
  },

  'no arguments': function() {
    var range = genRange();
    assert(isIterator(range));
    assert.deepEqual(iteratorToArray(range), []);
  },

  'negative step': function() {
    var range = genRange(10,5, -1);
    assert(isIterator(range));
    assert.deepEqual(iteratorToArray(range), [10,9,8,7,6]);
  }
};
