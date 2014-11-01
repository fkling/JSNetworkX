/*jshint strict:false, node:true*/
/*global assert */

var isMap = require('../isMap');
var Map = require('../Map');

exports.isMap = {
  'returns true for maps': function() {
    assert(isMap(new Map()));
  },

  'doesn\'t consider normal objects as Map': function() {
    assert(!isMap({}));
  }
};
