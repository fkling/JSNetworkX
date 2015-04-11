/*eslint camelcase:0*/
'use strict';

import path from 'path';
import child_process from 'child_process';
import {serializeAll, deserialize} from './message';
import delegateSync from './delegateSync';

function delegateToChildProcess(method, args) {
  return new Promise((resolve, reject) => {
    var response = '';
    var error = '';
    var child = child_process.spawn(
      process.execPath,
      [path.join(__dirname, '../worker.js')]
    );
    child.stdout.on('data', data => response += data);
    child.stderr.on('data', data => error += data);
    child.on('close', () => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(JSON.parse(response));
      }
    });

    child.stdin.write(JSON.stringify({method, args}));
    child.stdin.end();
  });
}

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
  var {serializable, serializedValues} = serializeAll(args);
  if (!serializable) {
    console.info(
      `At least one argument can't be serialized and sent to the worker. ` +
      `We will run ${method} in the same thread instead.`
    );
    return delegateSync(method, args);
  }
  return delegateToChildProcess(method, serializedValues)
    .then(response => deserialize(response.result));
}
