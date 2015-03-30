"use strict";
import * as jsnx from '../';
import isIterator from './isIterator';

/**
 * DON'T CALL THIS FUNCTION EXPLICITLY. It's inserted by a transform.
 *
 * Eventually this will spawn another thread and run the computation there.
 *
 * @param {string} method The name on the root jsnx object to execute.
 * @param {Array} args An array of arguments to send to the worker.
 *    Some types, such as graphs, are converted to a different format first.
 * @return {Promise}
 */
export default function delegate(method, args) {
  return new Promise(function(resolve, reject) {
    try {
      // We have to do the same here as we do in the worker, which is
      // returning an array if we get back an iterator
      var result = jsnx[method].apply(null, args);
      if (isIterator(result)) {
        result = Array.from(result);
      }
      resolve(result);
    } catch(ex) {
      reject(ex);
    }
  });
}
