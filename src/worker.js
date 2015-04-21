/**
 * @fileoverview
 * A "worker" node script for asynchronous methods. It accepts the method to
 * call and the arguments to pass from stdin and writes the result to stdout.
 *
 * Possible exit codes:
 *  - 0: Everything OK
 *  - 1: Computation produced an error
 *  - 2: Unable to deserialize input or serialize result
 */
'use strict';
import {serialize, deserialize} from './_internals/message';
import * as jsnx from './';

var input = '';
process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  var method;
  var args;
  var result;
  try {
    ({method, args} = JSON.parse(input));
    args = args.map(deserialize);
  } catch(error) {
    exitWithError(2, error.message);
    return;
  }
  try {
    result = jsnx[method].apply(null, args);
  } catch(error) {
    exitWithError(1, error.message);
    return;
  }
  try {
    result = JSON.stringify({result: serialize(result)});
    process.stdout.write(result);
    process.exit(0);
  } catch(error) {
    exitWithError(2, error.message);
  }
});

function exitWithError(code, message) {
  process.stderr.write(message);
  process.exit(code);
}
