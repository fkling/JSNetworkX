/*global utils, assert*/
'use strict';

import iteritems from '../iteritems';

export var testIteritems = function() {
  var obj = {foo: 5, bar: [1,2], 5: 42};
  var iter = iteritems(obj);
  assert(utils.isIterator(iter));
  assert.sameMembersDeep(
    Array.from(iter),
    [['5', 42], ['bar', [1,2]], ['foo', 5]]
  );
};
