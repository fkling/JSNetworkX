/*jshint strict:false, node:true*/
/*global assert */

var isIterator = require('../isIterator');

function* generator() { yield 0; }

exports.isIterator = {
  'Generators produce an iterator': function() {
    assert(isIterator(generator()));
  },
};
