/*jshint strict:false, node:true*/
/*global assert, utils, wrapGenerator*/

var toIterator = require('../toIterator');
var toArray = require('../toArray');

function* generator() { yield 0; }

exports.toIterator = {
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

    assert.deepEqual(toArray(iterator), data);
  },

  'from graph': false, // TODO

  'from array-like object': function() {
    var data = [1,2,3];
    var iterator = toIterator(data);

    assert(utils.isIterator(iterator));
    assert.deepEqual(toArray(iterator), data);
  },

  'from object (keys)': function() {
    var data = {foo: 42, bar: 42};
    var iterator = toIterator(data);

    assert(utils.isIterator(iterator));
    assert.sameMembers(toArray(iterator), Object.keys(data));
  }

};
