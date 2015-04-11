/*global assert */
'use strict';

import isMap from '../isMap';
import Map from '../Map';

export var testIsMap = {
  'returns true for maps': function() {
    assert(isMap(new Map()));
  },

  'doesn\'t consider normal objects as Map': function() {
    assert(!isMap({}));
  }
};
