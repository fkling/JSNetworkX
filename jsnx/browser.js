"use strict";
import '6to5/polyfill';

import isIterator from './_internals/isIterator';
import {serialize, deserialize} from './_internals/message';
export * from './';

if (!global.document) {
  // inside worker
  global.onmessage = function(event) {
    var args = event.data.args.map(deserialize);
    var result = exports[event.data.method].apply(null, args);
    global.postMessage(serialize(result));
    global.close();
  };
}
