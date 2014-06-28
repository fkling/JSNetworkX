/*jshint strict:false, node:true*/
/*global assert, utils */

var intersection = require('../intersection');
var Set = utils.Set;

exports.intersection = {
  'two arguments': function() {
    var diff = intersection(new Set([1,2,3,4]), new Set([2,4]));

    assert.deepEqual(diff, new Set([2,4]));
  },

  'multiple arguments': function() {
    var diff = intersection(new Set([1,2,3,4]), new Set([2, 6]), new Set([4]));

    assert.deepEqual(diff, new Set([2,4]));
  }

};
