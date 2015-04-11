/*global assert*/
'use strict';

import nodesAreEqual from '../nodesAreEqual';

export var testNodesAreEqual = {

  equal: function() {
    assert.ok(nodesAreEqual(42, 42));
    assert.ok(nodesAreEqual('foo', 'foo'));

    assert.ok(nodesAreEqual([1,2,3], [1,2,3]));
    var foo = {toString: () => '42'};
    var bar = {toString: () => '42'};
    assert.ok(nodesAreEqual(foo, bar));
  },

  'not equal': function() {
    assert.ok(!nodesAreEqual(1, 2));
    assert.ok(!nodesAreEqual(42, '42'));
  }

};
