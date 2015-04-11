'use strict';

import forEach from './forEach';

/**
 * Returns an object, given a container of (key, value) tuples.
 *
 * @param {Iterable} kvs Container of key,value tuples
 *
 * @return {!Object}
 */
export default function toObjectFromKV(kvs) {
  var obj = {};
  forEach(kvs, function(kv) {
    obj[kv[0]] = kv[1];
  });
  return obj;
}
