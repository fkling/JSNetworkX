/*jshint strict:false, node:true*/
/*global assert, utils */

var difference = require('../difference');
var Set = utils.Set;

exports.difference = {
  'single argument - different set, same elements': function() {
    var set = new Set([1,2,3]);
    var diff = difference(set);

    assert.notEqual(diff, set);
    assert.deepEqual(diff, set);
  },

  'two arguments': function() {
    var diff = difference(new Set([1,2,3,4]), new Set([2,4]));

    assert.deepEqual(diff, new Set([1,3]));
  },

  'multiple arguments': function() {
    var diff = difference(new Set([1,2,3,4]), new Set([2, 6]), new Set([4]));

    assert.deepEqual(diff, new Set([1,3]));
  }

};
