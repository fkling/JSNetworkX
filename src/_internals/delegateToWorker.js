'use strict';

import Worker from './Worker';
import WorkerSettings from '../WorkerSettings';
import delegateSync from './delegateSync';
import {serializeAll, deserialize} from './message';

var delegateImplementation;
if (typeof Worker === 'function') {
  // Workers are supported
  delegateImplementation = function(method, args) {
    var {serializable, serializedValues} = serializeAll(args);

    if (!serializable) {
      console.info(
        `At least one argument can't be serialized and sent to the worker. ` +
        `We will run ${method} in the same thread instead.`
      );
      return delegateSync(method, args);
    }

    return new Promise(function(resolve, reject) {
      var worker = new Worker(WorkerSettings.workerPath);
      worker.addEventListener(
        'message',
        oEvent => resolve(deserialize(oEvent.data)),
        false
      );
      worker.addEventListener('error', reject, false);
      worker.postMessage({method, args: serializedValues});
    });
  };
}
else {
  delegateImplementation = function(method, args) {
    console.info(
      `Workers are not supported in this environment, so "${method}" will ` +
      `run in the same thread instead. This might block the environment.`
    );
    return delegateSync(method, args);
  };
}

/**
 * DON'T CALL THIS FUNCTION EXPLICITLY. It's inserted by a transform.
 *
 * Tries to create a worker and pass the arguments to it. Copying large graphs
 * is not very fast, but still faster than running most algorithms
 * synchronously.
 *
 * Falls back to synchronous execution if browser doesn't support workers.
 *
 * This returns a promise which gets resolved with the result sent from the
 * worker or the synchronous functions.
 *
 * @param {string} method The name on the root jsnx object to execute.
 * @param {Array} args An array of arguments to send to the worker.
 *    Some types, such as graphs, are converted to a different format first.
 * @return {Promise}
 */
export default function delegateToWorker(method, args) {
  return delegateImplementation(method, args);
}
