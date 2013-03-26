/*jshint strict:false, node:true*/
var jsnx = require('../../../jsnetworkx-test');

exports.map = {
  setUp: function(cb) {
    this.map = new jsnx.Map();
    this.map.set('0', 0);
    this.map.set('1', 1);
    this.map.set('2', 2);
    cb();
  },

  test_constructor: function(test) {
    test.equal((new jsnx.Map()).count(), 0, 'Empty constructor');

    var data = [[1,2], [3,4], [5,6]];
    var map = new jsnx.Map(data);
    test.deepEqual(map.items().sort(), data, 'Array');

    data = jsnx.helper.iter(data);
    map = new jsnx.Map(data);
    test.deepEqual(map.items().sort(), [[1,2], [3,4], [5,6]], 'Iteratorj');

    data = {1: 2, 3: 4};
    map = new jsnx.Map(data);
    test.deepEqual(map.items().sort(), [['1', 2], ['3', 4]], 'Object');

    test.done();
  },

  test_get_set_item: function(test) {
    var map = new jsnx.Map();
    var obj = {};

    map.set(0, 1);
    map.set('0', 2);
    map.set(obj, 'foo');

    test.strictEqual(map.get(0), 1);
    test.strictEqual(map.get('0'), 2);
    test.notStrictEqual(map.get('0'), 1);
    test.strictEqual(map.get(obj), 'foo');
    test.throws(function(){map.get({});});

    map = new jsnx.Map();
    map.set(0,'foo');
    map.set(0, 'bar');
    test.equal(map.get(0), 'bar');
    test.equal(map.count(), 1);

    test.done();
  },

  test_items: function(test) {
    test.deepEqual(this.map.items().sort(), [['0', 0], ['1', 1], ['2', 2]]);
    test.done();
  },

  test_keys: function(test) {
    test.deepEqual(this.map.keys().sort(), ['0', '1', '2']);
    test.done();
  },

  test_values: function(test) {
    test.deepEqual(this.map.keys().sort(), [0, 1, 2]);
    test.done();
  }
};
