/*global assert*/
'use strict';

import toObjectFromKV from '../toObjectFromKV';

export var testToObjectFromKV = {

  'generate object from array of pairs': function() {
    var obj = toObjectFromKV([['foo', 5], [10, [1,2]]]);
    assert.deepEqual(obj, {foo: 5, 10: [1,2]});
  },

  'generate empty object from empty array': function() {
    var obj = toObjectFromKV([]);
    assert.deepEqual(obj, {});
  }
};
