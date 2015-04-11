/*globals assert, utils*/
'use strict';

import mapIterator from '../mapIterator';

function* generator(data) {
  for (var i = 0; i < data.length; i++) {
    yield data[i];
  }
}

export var testMapIterator = function() {
  var iterator = mapIterator(generator([1,2,3]), x => x * 3);

  assert(utils.isIterator(iterator));

  var result = [];
  for (var v of iterator) {
    result.push(v);
  }
  assert.deepEqual(result, [3,6,9]);
};
