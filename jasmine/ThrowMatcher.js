/*global jasmine*/
// overwrite default toThrow to handle exception objects instead of messages
jasmine.Matchers.prototype.toThrow = function(expected) {
  var result = false;
  var exception;
  if (typeof this.actual != 'function') {
    throw new Error('Actual is not a function');
  }
  try {
    this.actual();
  } catch (e) {
    exception = e;
  }
  if (exception) {
    result = (expected === jasmine.undefined || exception.name === expected);
  }

  var not = this.isNot ? "not " : "";

  this.message = function() {
    if (exception && (expected === jasmine.undefined || !(exception.name === expected))) {
      return ["Expected function " + not + "to throw", expected ? expected.name || expected : "an exception", ", but it threw", exception.name].join(' ');
    } else {
      return "Expected function to throw an exception.";
    }
  };

  return result;
};
