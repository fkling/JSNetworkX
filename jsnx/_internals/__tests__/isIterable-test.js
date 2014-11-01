/*jshint strict:false, node:true*/
/*global assert */

var Map = require('../Map');
var Set = require('../Set');
var isIterable = require('../isIterable');

exports.isIterable = {
  'Maps are iterable': function() {
    assert(isIterable(new Map()));
  },

  'Sets are iterable': function() {
    assert(isIterable(new Set()));
  },
};
