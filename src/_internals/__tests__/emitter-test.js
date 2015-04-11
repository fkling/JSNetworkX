/*global assert*/
'use strict';

import emitter from '../emitter';

function onHelper(obj, type, callback) {
  var resolve;
  var promise = new Promise(function(res) {
    resolve = res;
  });

  obj.on(type, x => (callback && callback(x), resolve(x)));
  return promise;
}

export var testEmitter = {
  API: function() {
    var ee = emitter();
    assert.isFunction(ee.on);
    assert.isFunction(ee.off);
    assert.isFunction(ee.emit);

    var obj = {};
    var emit = emitter(obj);
    assert.isFunction(emit);
    assert.isFunction(obj.on);
    assert.isFunction(obj.off);
  },

  'on/emit': function() {
    var obj = {};
    var emit = emitter(obj);

    var promises = [];

    promises.push(assert.becomes(onHelper(obj, 'foo'), 'bar'));
    emit('foo', 'bar');

    promises.push(assert.becomes(onHelper(obj, 'bar'), 'abc'));
    promises.push(assert.becomes(onHelper(obj, 'bar'), 'abc'));
    emit('bar', 'abc');

    return Promise.all(promises);
  }
};
