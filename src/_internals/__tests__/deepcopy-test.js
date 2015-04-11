/*global assert */
'use strict';

import deepcopy from '../deepcopy';
import Map from '../Map';

export var testDeepcopy = {
  'it deep copies normal objects and arrays': function() {
    var foo = [1,2];
    var obj = {
      foo: foo,
      bar: ['bar', foo]
    };

    var copy = deepcopy(obj);
    assert.deepEqualIdent(copy, obj);
  },

  'it deep copies maps': function() {
    var foo = [1,2,3];
    var bar = new Map([[1,foo], [2,foo]]);
    var map = new Map([[1,foo], [2,bar]]);

    var copy = deepcopy(map);
    assert.notEqual(map, copy);
    assert.strictEqual(map.get(1), map.get(2).get(1));
  }
};
