"use strict";
/*jshint node:true*/
var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');
var get_hash = jsnx.contrib.misc.get_hash;

exports.TestContribMisc = {
  test_get_hash:  function() {
    assert.notEqual(get_hash(1), get_hash(2), 'Different values, numbers');
    assert.notEqual(get_hash('1'), get_hash('2'), 'Different values, strings');
    assert.notEqual(get_hash('1'), get_hash(1), 'Different primitives');
    assert.notEqual(get_hash({}), get_hash({}), 'Different objects');

    var obj = {};
    assert.equal(get_hash(obj), get_hash(obj), 'Same object');
    assert.equal(
      get_hash({__hash__: 'foo'}),
      get_hash({__hash__: 'foo'}),
      'Different objects, same __hash__'
    );
    assert.equal(
      get_hash({toString:function(){return 'foo';}}),
      get_hash({toString:function(){return 'foo';}}),
      'Different objects, same toString()'
    );
  }
};
