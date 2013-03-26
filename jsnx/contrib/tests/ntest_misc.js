"use strict";
/*jshint node:true*/
var jsnx = require('../../../jsnetworkx-test');
var get_hash = jsnx.contrib.misc.get_hash;

exports.test_get_hash = function(test) {
  test.notEqual(get_hash(1), get_hash(2), 'Different values, numbers');
  test.notEqual(get_hash('1'), get_hash('2'), 'Different values, strings');
  test.notEqual(get_hash('1'), get_hash(1), 'Different primitives');
  test.notEqual(get_hash({}), get_hash({}), 'Different objects');

  var obj = {};
  test.equal(get_hash(obj), get_hash(obj), 'Same object');
  test.equal(
    get_hash({__hash__: 'foo'}),
    get_hash({__hash__: 'foo'}),
    'Different objects, same __hash__'
  );
  test.equal(
    get_hash({toString:function(){return 'foo';}}),
    get_hash({toString:function(){return 'foo';}}),
    'Different objects, same toString()'
  );

  test.done();
};
