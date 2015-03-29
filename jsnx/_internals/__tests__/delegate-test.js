/*global assert, sinon */
/*eslint camelcase:0*/
'use strict';

import delegate from '../delegate';
import * as jsnx from '../../';
import child_process from 'child_process';

export var testDelegate = {
  beforeEach: function() {
    this.origSpawn = child_process.spawn;
    this.spy = child_process.spawn = sinon.spy();
  },

  afterEach: function() {
    child_process.spawn = this.origSpawn;
  },

  'it returns a promise': function() {
    var promise = delegate('testFunction');
    return assert.isFunction(promise.then);
  }
};
