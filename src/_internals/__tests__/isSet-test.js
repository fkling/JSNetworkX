/*global assert */
'use strict';

import isSet from '../isSet';
import Set from '../Set';

export var testIsSet = {
  'returns true for sets': function() {
    assert(isSet(new Set()));
  },

  'doesn\'t consider normal objects as Set': function() {
    assert(!isSet({}));
  }
};
