/*jshint strict:false, node:true*/

var assert = require('../../mocha/assert');
var jsnx = require('../../jsnetworkx-test');
  var helper = jsnx.helper;

exports.TestHelper = {

  test_objectFromKV: function() {
    var obj = helper.objectFromKV([['foo', 5], [10, [1,2]]]);
    assert.deepEqual(obj, {foo: 5, 10: [1,2]});
  },

  test_items: function() {
    var obj = {foo: 5, bar: [1,2]};
    var kv = helper.items(obj);

    assert(kv.length === 2);
    assert.deepEqual(kv.sort(), [['bar', [1,2]], ['foo', 5]]);
  },

  test_range: function() {
    var range = jsnx.helper.range(5);
    assert(jsnx.helper.isIterator(range));
    assert.deepEqual(jsnx.toArray(range), [0,1,2,3,4]);

    range = jsnx.helper.range(5,10);
    assert.deepEqual(jsnx.toArray(range), [5,6,7,8,9]);

    range = jsnx.helper.range(0,10,2);
    assert.deepEqual(jsnx.toArray(range), [0,2,4,6,8]);

    range = jsnx.helper.range();
    assert.deepEqual(jsnx.toArray(range), []);

    // negative step size
    range = jsnx.helper.range(10,5, -1);
    assert.deepEqual(jsnx.toArray(range), [10,9,8,7,6]);
  },

  test_combinations: function() {
    var comb = jsnx.helper.combinations([0,1,2,3], 3);
    assert(jsnx.helper.isIterator(comb));
    assert.deepEqual(jsnx.toArray(comb), [[0,1,2], [0,1,3], [0,2,3], [1,2,3]]);
  },

  test_permuatations: function() {
    var perm = jsnx.helper.permutations([0,1,2]);
    assert(jsnx.helper.isIterator(perm));
    assert.deepEqual(
      jsnx.toArray(perm),
      [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]]
    );
  },

  test_iteritems: function() {
    var obj = {foo: 5, bar: [1,2], 5: 42};
    var iter = helper.iteritems(obj);

    assert(helper.isIterator(iter));

    var kv = helper.toArray(iter);
    assert.deepEqual(kv.sort(), [['5', 42], ['bar', [1,2]], ['foo', 5]]);
  },

  test_nested_chain: function() {

    var iters = [
      [[1,2,3], [4,5,6] ],
      [helper.iter(['a', 'b'])]
    ];
    var iter = helper.nested_chain(iters, function(val) {
      return helper.iter(val);
    }, function(val) {
      return helper.iter(val);
    }, function(val) {
      return val;
    });

    var kv = helper.toArray(iter);
    assert.deepEqual(kv, [1,2,3,4,5,6, 'a', 'b']);
  },

  test_nested_chain_skip_empty: function() {
    var iters = [
      [[1,2,3], [4,5,6]],
      [helper.iter(['a', 'b'])]
    ];
    var iter = helper.nested_chain(iters, function(val) {
      return helper.iter(val);
    },function(val) {
      return helper.iter(val);
    }, function(val) {
      if(val % 2 === 0) {
        return val;
      }
    });

    var kv = helper.toArray(iter);
    assert.deepEqual(kv, [2,4,6]);
  },

  test_sentinelIterator: function() {
    var iter = helper.sentinelIterator(new helper.iter([]), null);
    assert.equal(iter.next(), null);
  },

  test_deepcopy: function() {
    var Constr = function() {};
    var foo = [1,2];
    var obj = {
      foo: foo,
      bar: ['bar', foo],
      inst: new Constr()
    };

    var copy = helper.deepcopy(obj);
    assert.deepEqual(copy, obj);
    assert.notEqual(copy, obj);
    assert.notEqual(copy.foo, obj.foo);
    assert.equal(copy.foo, copy.bar[1]);
    assert.equal(copy.inst, obj.inst);

    // does not get stuck for self references
    foo.push(foo);
    copy = helper.deepcopy(foo);
    assert.notEqual(copy, foo);
    assert.equal(copy[2], copy);
  },

  test_deepcopy_constructor: function() {
    var Constr = function() {
      this.foo = [1,2];
      this.bar = ['bar', this.foo];
    };
    Constr.prototype.baz = [1,2];

    var inst = new Constr();
    var copy = helper.deepcopy_instance(inst);

    assert.deepEqual(copy, inst);
    assert.notEqual(copy, inst);
    assert.notEqual(copy.foo, inst.foo);
    assert.equal(copy.foo, copy.bar[1]);
    assert.equal(copy.baz, inst.baz);
    assert.equal(copy.constructor, inst.constructor);
  },

  test_extend: function() {
    var obj1 = {
      foo: {
        bar: 5
      }
    };
    var obj2 = {
      baz: 42,
      foo: {
        baz: 6
      }
    };

    helper.extend(obj1, obj2);

    assert.notEqual(obj1.foo, obj2.foo);
    assert.deepEqual(obj1.baz, obj2.baz);
    assert.deepEqual(obj1.foo.baz, 6);
    assert.deepEqual(obj1.foo.bar, 5);
  },

  //TODO: write tests for isIterable and len
    

  test_forEach: function() {
    var value = [1,2,[3,4]];
    var result = [];
    helper.forEach(value, function(val) {
      result.push(val);
    });

    assert.deepEqual(result, value, 'array');

    value = {0: 1, 1: 10, length: 2};
    result = [];

    helper.forEach(value, function(val, i) {
      result.push(val);
    });

    assert.deepEqual(result, [1, 10], 'array-like object');

    value = [10, 15, 20];
    result = [];

    helper.forEach(helper.iter(value), function(val) {
      result.push(val);
    });

    assert.deepEqual(result, value, 'iterators');

    value = {foo: 5, bar: 10};
    result = [];

    helper.forEach(value, function(val) {
      result.push(val);
    });

    assert.deepEqual(result, Object.keys(value), 'object keys');

    value = [[1,2], [3,4]];
    result = [];

    helper.forEach(value, function(a, b) {
      result.push(a, b);
    }, true);

    assert.deepEqual(result, [1,2,3,4], 'expand array');
  },

  test_map: function() {
    var value = [1,2,3];
    var result = helper.map(value, function(val) {
      return val * 2;
    });

    assert.deepEqual(result, [2, 4, 6], 'array');

    value = {0: 1, 1: 10, length: 2};
    result = helper.map(value, function(val, i) {
      return val * 2;
    });

    assert.deepEqual(result, [2,20], 'array-like object');

    value = {foo: 5, bar: 10};
    result = helper.map(value, function(val) {
      return val * 2;
    });

    assert.deepEqual(result, {foo: 10, bar: 20}, 'object');

    value = [1, 2, 3];
    result = helper.map(helper.iter(value), function(val) {
      return val * 2;
    });

    assert(helper.isIterator(result));
    assert.deepEqual(helper.toArray(result), [2, 4, 6]);
  },

  test_zip: function() {
    var result = helper.zip([1,2,3], [4,5,6]);
    assert.deepEqual(result, [[1,4], [2,5], [3,6]], 'arrays');

    result = helper.zip ({0: 1, 1: 10, length: 2}, {0: 2, 1: 20, length: 2});
    assert.deepEqual(result, [[1,2], [10,20]], 'array-like objects');

    result = helper.zip({foo: 5, bar: 10}, {baz: 10, faz: 20});
    assert.deepEqual(result, [['foo', 'baz'], ['bar', 'faz']], 'objects');

    var arr = [1, 2, 3];
    result = helper.zip(helper.iter(arr), helper.iter(arr));

    assert(helper.isIterator(result));
    assert.deepEqual(helper.toArray(result), [[1,1], [2,2], [3,3]], 'iterators');

    result = helper.zip([1,2,3], [4,5]);
    assert.deepEqual(result, [[1,4], [2,5]]);

  },

  test_max: function() {
    var seq = [1,2,3];
    assert.equal(jsnx.helper.max(seq), 3);
    assert.equal(jsnx.helper.max(seq, function(v) { return 2*v; }), 6);
  },

  test_toArray: function() {
    var value = [1,2,3];
    assert.deepEqual(helper.toArray(value), [1,2,3], 'array');
    assert.notEqual(helper.toArray(value), value);

     value = {0: 1, 1: 10, length: 2};
     assert.deepEqual(helper.toArray(value), [1,10], 'array-like object');

     value = {foo: 5, bar: 10};
     assert.deepEqual(helper.toArray(value), ['foo', 'bar'], 'object (keys)');

     value = helper.iter([1,2,3]);
     assert.deepEqual(helper.toArray(value), [1, 2, 3], 'iterators');
  },

  test_iter: function() {

    var value = [1,2,3];
    assert(helper.isIterator(helper.iter(value)));
    assert.deepEqual(helper.toArray(helper.iter(value)), [1,2,3]);

    value = {0: 1, 1: 2, length: 2};
    assert(helper.isIterator(helper.iter(value)));
    assert.deepEqual(helper.toArray(helper.iter(value)), [1,2]);

    value = {foo: 5, 0: 'bar'};
    assert(helper.isIterator(helper.iter(value)));
    assert.deepEqual(helper.toArray(helper.iter(value)).sort(), ['0','foo']);
  }
};
