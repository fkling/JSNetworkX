"use strict";

import {serialize, deserialize} from './_internals/message';
import WorkerSettings from './_internals/WorkerSettings';
import * as jsnx from './';

Object.defineProperty(jsnx, 'workerPath', {
  set: function(value) {
    WorkerSettings.workerPath = value;
  },
  get: function() {
    return WorkerSettings.workerPath;
  }
});

export default jsnx;

if (!global.document) {
  // inside worker
  global.onmessage = function(event) {
    var args = event.data.args.map(deserialize);
    var result = jsnx[event.data.method].apply(null, args);
    global.postMessage(serialize(result));
    global.close();
  };
}
