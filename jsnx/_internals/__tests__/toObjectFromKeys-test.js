/*jshint strict:false, node:true*/
/*global assert */

var toObjectFromKeys = require('../toObjectFromKeys');

exports.toObjectFromKeys = {
  'without default value (null)': function() {
    var keys = ['foo', 'bar', 'baz'];
    assert.deepEqual(
      toObjectFromKeys(keys),
      {foo: null, bar: null, baz: null}
    );
  },

  'with default value': function() {
    var keys = ['foo', 'bar', 'baz'];
    assert.deepEqual(
      toObjectFromKeys(keys, 42),
      {foo: 42, bar: 42, baz: 42}
    );
  },
};
