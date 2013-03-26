/*jshint strict:false, node:true*/
var jsnx = require('../../../jsnetworkx-test');

exports.test_constructor = function(test) {
  test.expect(6);
  var elements = [1,2,'3',[]];
  var t = jsnx.t(1,2,3);
  test.equal(t.length, 3);
  t = jsnx.t(elements);
  test.equal(t.length, elements.length);

  for (var i = 0; i < elements.length; i++) {
    test.strictEqual(t[i], elements[i]);
  }
  test.done();
};

exports.test_equality = function(test) {
  var t = jsnx.t(1,'2',3);
  test.equal(t.toString(), jsnx.t(1,'2',3).toString());
  test.notEqual(jsnx.t(1,{}).toString(), jsnx.t(1,{}).toString());
  test.done();
};

exports.test_immutability = function(test) {
  "use strict";
  if (Object.freeze) {
    var t = jsnx.t(1,2);
    test.throws(function() {
      t[0] = 42;
    });
    test.equal(t[0], 1);
  }
  test.done();
};
