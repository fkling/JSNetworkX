/*jshint strict:false, node:true*/
/*global assert */

var isSet = require('../isSet');
var Set = require('../Set');

exports.isSet = {
  'returns true for sets': function() {
    assert(isSet(new Set()));
  },

  'doesn\'t consider normal objects as Set': function() {
    assert(!isSet({}));
  }
};
