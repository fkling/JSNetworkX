/*global assert, sinon */
"use strict";

import delegate from '../delegate';
import jsnx from '../../';

export var testDelegate = {
  beforeEach: function() {
    this.spy = jsnx.testFunction = sinon.spy();
  },

  afterEach: function() {
    delete jsnx.testFunction;
  },

  'it returns a promise': function() {
    var promise = delegate('testFunction');
    assert.isFunction(promise.then);
  },

  'it passes the arguments to the delegated function': function() {
    delegate('testFunction', ['foo', 'bar']);
    assert(this.spy.calledWith('foo', 'bar'));
  },

  'it resolves to the return value of the delegated function': function() {
    jsnx.testFunction = function() {
      return 'foo';
    };
    var promise = delegate('testFunction', ['foo', 'bar']);
    assert.becomes(promise, 'foo');
  },

  'it rejects if the delegated function throws an error': function() {
    jsnx.testFunction = function() {
      throw new Error('some error');
    };
    var promise = delegate('testFunction', ['foo', 'bar']);
    assert.isRejected(promise, 'some error');
  }
};
