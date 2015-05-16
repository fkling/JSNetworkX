import {serialize, deserialize} from './_internals/message';
import WorkerSettings from './WorkerSettings';

/**
 * If this function is executed inside a Worker, it will listen to the
 * "message" event and use `WorkerSettings.methodLookupFunction` to get a
 * reference to the JSNetworkX method to executed.
 */
export default function initializeBrowserWorker() {
  if (!global.document) {
    // inside worker
    global.onmessage = function(event) {
      var args = event.data.args.map(deserialize);
      var result = WorkerSettings.methodLookupFunction(event.data.method)
        .apply(null, args);
      global.postMessage(serialize(result));
      global.close();
    };
  }
}
