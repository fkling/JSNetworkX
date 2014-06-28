/*jshint strict:false, node:true*/
/*global assert */

var clear = require('../clear');

exports.clear = {
  'emptys object': function() {
    var obj = {foo: 1, bar: 2};
    clear(obj);
    assert.deepEqual(obj, {});
  },

  'only removes own properties': function() {
    var proto = {foo: 'bar'};
    var obj = Object.create(proto);
    clear(obj);
    assert.property(obj, 'foo');
  }
};
