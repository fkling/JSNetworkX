"use strict";

var forEach = require('./forEach');

/**
 * Returns an object, given a container of (key, value) tuples.
 *
 * @param {Iterable} kvs Container of key,value tuples
 *
 * @return {!Object}
 */
function toObjectFromKV(kvs) {
  var obj = {};
  forEach(kvs, function(kv) {
    obj[kv[0]] = kv[1];
  });
  return obj;
}

module.exports = toObjectFromKV;
