/*jshint strict:false, node:true*/
var jsnx = require('../../../jsnetworkx-test');
var assert = require('assert');

exports.Map = {
  beforeEach: function() {
    this.map = new jsnx.Map();
    this.map.set('0', 0);
    this.map.set('1', 1);
    this.map.set('2', 2);
  },

  test_constructor: function() {
    assert.equal((new jsnx.Map()).count(), 0, 'Empty constructor');

    var data = [[1,2], [3,4], [5,6]];
    var map = new jsnx.Map(data);
    assert.deepEqual(map.items().sort(), data, 'Array');

    data = jsnx.helper.iter(data);
    map = new jsnx.Map(data);
    assert.deepEqual(map.items().sort(), [[1,2], [3,4], [5,6]], 'Iteratorj');

    data = {1: 2, 3: 4};
    map = new jsnx.Map(data);
  },

  test_get_set_item: function() {
    var map = new jsnx.Map();
    var obj = {};

    map.set(0, 1);
    map.set('0', 2);
    map.set(obj, 'foo');

    assert.strictEqual(map.get(0), 1);
    assert.strictEqual(map.get('0'), 2);
    assert.notStrictEqual(map.get('0'), 1);
    assert.strictEqual(map.get(obj), 'foo');

    map = new jsnx.Map();
    map.set(0,'foo');
    map.set(0, 'bar');
    assert.equal(map.get(0), 'bar');
    assert.equal(map.count(), 1);
  },

  test_items: function() {
    assert.deepEqual(this.map.items().sort(), [['0', 0], ['1', 1], ['2', 2]]);
  },

  test_keys: function() {
    assert.deepEqual(this.map.keys().sort(), ['0', '1', '2']);
  },

  test_values: function() {
    assert.deepEqual(this.map.keys().sort(), [0, 1, 2]);
  }
};
