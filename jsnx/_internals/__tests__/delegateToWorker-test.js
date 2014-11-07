/*global assert, sinon */
"use strict";

var delegateToWorker = require('../delegateToWorker');
var jsnx = require('../../');

exports.delegateToWorker = {
  beforeEach: function() {
    this.spy = jsnx.testFunction = sinon.spy();
  },

  afterEach: function() {
    delete jsnx.testFunction;
  },

  'it returns a promise': function() {
    var promise = delegateToWorker('testFunction');
    assert.isFunction(promise.then);
  },

  'it passes the arguments to the delegated function': function() {
    delegateToWorker('testFunction', ['foo', 'bar']);
    assert(this.spy.calledWith('foo', 'bar'));
  },

  'it resolves to the return value of the delegated function': function() {
    jsnx.testFunction = function() {
      return 'foo';
    };
    var promise = delegateToWorker('testFunction', ['foo', 'bar']);
    assert.becomes(promise, 'foo');
  },

  'it rejects if the delegated function throws an error': function() {
    jsnx.testFunction = function() {
      throw new Error('some error');
    };
    var promise = delegateToWorker('testFunction', ['foo', 'bar']);
    assert.isRejected(promise, 'some error');
  }
};
