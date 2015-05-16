'use strict';

import WorkerSettings from './WorkerSettings';
import initializeBrowserWorker from './initializeBrowserWorker';
import * as jsnx from './';

Object.defineProperty(jsnx, 'workerPath', {
  set: function(value) {
    WorkerSettings.workerPath = value;
  },
  get: function() {
    return WorkerSettings.workerPath;
  }
});

WorkerSettings.methodLookupFunction = name => jsnx[name];
initializeBrowserWorker();

export default jsnx;
