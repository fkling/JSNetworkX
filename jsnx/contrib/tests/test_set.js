/*jshint strict:false, node:true*/

var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');

exports.TestSet = {
  test_create: function() {
    var set = new jsnx.Set();
    assert(set);
  },

  test_add_elements: function() {
    var set = new jsnx.Set([1,2,3]);
    assert.deepEqual(set.values().sort(), [1,2,3]);

    set = new jsnx.Set();
    set.add(1);
    set.add("4");
    assert(set.has(1));
    assert(set.has("4"));
  },

  test_remove_elements: function() {
    var set = new jsnx.Set([1,2,3]);
    set.remove(2);
    assert(!set.has(2));
    assert(set.has(1));
    assert(set.has(3));
  },

  test_count: function() {
    var set = new jsnx.Set([1,2,3]);
    assert.equal(set.count(), 3);
  },

  test_difference: function() {
    var set = new jsnx.Set([1,2,3,4]);
    assert.deepEqual(set.difference(new jsnx.Set([1,4])), new jsnx.Set([2,3]));
  },

  test_intersection: function() {
    var set = new jsnx.Set([1,2,3,4]);
    assert.deepEqual(set.intersection(new jsnx.Set([1,4,5])), new jsnx.Set([1,4]));
  }
};
