/*global assert, sinon */
'use strict';

import delegate from '../delegateSync';
import * as jsnx from '../../';

export var testDelegateSync = {
  beforeEach: function() {
    this.spy = jsnx.testFunction = sinon.spy();
  },

  afterEach: function() {
    delete jsnx.testFunction;
  },

  'it returns a promise': function() {
    var promise = delegate('testFunction');
    return assert.isFunction(promise.then);
  },

  'it passes the arguments to the delegated function': function(done) {
    var promise = delegate('testFunction', ['foo', 'bar']);
    promise.then(() => {
      assert(this.spy.calledWith('foo', 'bar'));
      done();
    });
  },

  'it resolves to the return value of the delegated function': function() {
    jsnx.testFunction = function() {
      return 'foo';
    };
    var promise = delegate('testFunction', ['foo', 'bar']);
    return assert.becomes(promise, 'foo');
  },

  'it rejects if the delegated function throws an error': function() {
    jsnx.testFunction = function() {
      throw new Error('some error');
    };
    var promise = delegate('testFunction', ['foo', 'bar']);
    return assert.isRejected(promise, 'some error');
  }
};
