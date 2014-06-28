/*jshint strict:false, node:true*/
var jsnx = require('../../../jsnetworkx-test');
var assert = require('assert');

exports.Tuple = {
  test_constructor: function() {
    var elements = [1,2,'3',[]];
    var t = jsnx.t(1,2,3);
    assert.equal(t.length, 3);
    t = jsnx.t(elements);
    assert.equal(t.length, elements.length);

    for (var i = 0; i < elements.length; i++) {
      assert.strictEqual(t[i], elements[i]);
    }
  },

  test_equality: function() {
    var t = jsnx.t(1,'2',3);
    assert.equal(t.toString(), jsnx.t(1,'2',3).toString());
    assert.notEqual(jsnx.t(1,{}).toString(), jsnx.t(1,{}).toString());
  },

  test_immutability: function() {
    "use strict";
    if (Object.freeze) {
      var t = jsnx.t(1,2);
      assert.throws(function() {
        t[0] = 42;
      });
      assert.equal(t[0], 1);
    }
  }
};
