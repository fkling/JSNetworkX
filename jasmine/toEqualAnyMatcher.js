/*global jasmine*/
jasmine.Matchers.prototype.toEqualAny = function(expected) {
  "use strict";
  var result = false;
  for (var i = 0, l = expected.length; i < l; i++) {
    result = this.env.equals_(this.actual, expected[i]);
    if (result) {
      break;
    }
  }
  return result;
};
