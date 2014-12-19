"use strict";

import isIterator from './isIterator';
import {isSupported, serialize, deserialize} from './message';

var delegateImplementation;
if (typeof global.Worker === 'function') {
  // Workers are supported
  delegateImplementation = function(method, args) {
    var serializedArgs = new Array(args.length);
    var serializable =  args.every((arg, i) => {
      var supported = isSupported(arg);
      if (supported) {
        serializedArgs[i] = serialize(arg);
      }
      return supported;
    });

    if (!serializable) {
      console.info(
        `At least one argument can't be serialized and sent to the worker. ` +
        `We will run ${method} synchronously instead.`
      );
      var jsnx = require('../');
      return new Promise(function(resolve, reject) {
        try {
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

    return new Promise(function(resolve, reject) {
      var worker = new global.Worker('{{BUNDLE_NAME}}');
      worker.addEventListener("message", function (oEvent) {
        resolve(deserialize(oEvent.data));
      }, false);
      worker.addEventListener("error", reject, false);
      worker.postMessage({method, args: serializedArgs});
    });
  };
}
else {
  delegateImplementation = function(method, args) {
    // @ifndef NODE
    // We don't want to show this in Node.
    console.info(
      `Workers are not supported in this environment, so "${method}" will ` +
      `be performed synchronously instead. This might block the environment.`
    );
    // @endif
    var jsnx = require('../');
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
  };
}

/**
 * DON'T CALL THIS FUNCTION EXPLICITLY. It's inserted by a transform.
 *
 * Tries to create a worker and pass the arguments to it. Copying large graphs
 * is not very fast, but still faster than running most algorithms
 * synchronously.
 *
 * NOTE: Currently only Graphs and DiGraphs are supported and no edge data is
 * sent to the worker.
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
