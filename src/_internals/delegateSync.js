'use strict';
import WorkerSettings from '../WorkerSettings';
import isIterator from './isIterator';

/**
 * DON'T CALL THIS FUNCTION EXPLICITLY. It's inserted by a transform.
 *
 * In environments that does not support workers, we are using this synchronous
 * version.
 *
 * @param {string} method The name on the root jsnx object to execute.
 * @param {Array} args An array of arguments to send to the worker.
 *    Some types, such as graphs, are converted to a different format first.
 * @return {Promise}
 */
export default function delegateSync(method, args) {
  return new Promise(function(resolve, reject) {
    try {
      // We have to do the same here as we do in the worker, which is
      // returning an array if we get back an iterator
      var result =
        WorkerSettings.methodLookupFunction(method).apply(null, args);
      if (isIterator(result)) {
        result = Array.from(result);
      }
      resolve(result);
    } catch(ex) {
      reject(ex);
    }
  });
}
