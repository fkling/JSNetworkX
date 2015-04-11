/*global assert */
'use strict';

import Map from '../Map';
import Set from '../Set';
import isIterable from '../isIterable';

export var testIsIterable = {
  'Maps are iterable': function() {
    assert(isIterable(new Map()));
  },

  'Sets are iterable': function() {
    assert(isIterable(new Set()));
  },
};
