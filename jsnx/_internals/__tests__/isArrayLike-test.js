/*jshint strict:false, node:true*/
/*global assert */

import isArrayLike from '../isArrayLike';

export var testIsArrayLike = {
  'arrays': function() {
    var data = [1,2,3];
    assert(isArrayLike(data));
  },

  'objects with a numeric length property': function() {
    var obj = {length: 3};
    assert(isArrayLike(obj));
  },

  'not objects with a non-numeric length property': function() {
    var obj = {length: 'foo'};
    assert(!isArrayLike(obj));
  },

  'not strings': function() {
    assert(!isArrayLike('foo'));
  },

  'not functions': function() {
    assert(!isArrayLike(function() {}));
  },
};
