/*global assert */
"use strict";

import isIterator from '../isIterator';

function* generator() { yield 0; }

export var testIsIterator = {
  'Generators produce an iterator': function() {
    assert(isIterator(generator()));
  },
};
