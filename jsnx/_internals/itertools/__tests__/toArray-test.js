/*jshint strict:false, node:true*/
/*global assert */

var toArray = require('../toArray');

function* generator(data) {
  for (var i = 0; i < data.length; i++) {
    yield data[i];
  }
}

exports.toArray = {
  'iterator to array': function() {
    var data = [1,2,3];
    assert.deepEqual(
      toArray(generator(data)),
      data
    );
  },
};
