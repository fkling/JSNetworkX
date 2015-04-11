/*global assert*/
'use strict';

import zipIterator from '../zipIterator';

function* gen(data) {
  for (var i = 0; i < data.length; i++) {
    yield data[i];
  }
}

export var testZipIterator = {
  'zip itarators of equal length': function() {
    assert.deepEqual(
      Array.from(zipIterator(gen([1,2,3]), gen([4,5,6]), gen([7,8,9]))),
      [[1,4,7],[2,5,8],[3,6,9]]
    );
  },

  'zip shortest iterator': function() {
    assert.deepEqual(
      Array.from(zipIterator(gen([1,2,3]), gen([4,5]))),
      [[1,4],[2,5]]
    );
  },

  'empty iterator': function() {
    assert.deepEqual(
      Array.from(zipIterator(gen([1,2,3]), gen([]))),
      []
    );
  }
};
