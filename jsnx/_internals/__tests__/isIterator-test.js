/*global assert */
'use strict';

import isIterator from '../isIterator';

function* generator() { yield 0; }

export var testIsIterator = {
  'true for iterators': function() {
    assert(isIterator(generator()));
  },

  'does not fail for null/undefined': function() {
    assert(!isIterator(null));
    assert(!isIterator(void 0));
  },
};
