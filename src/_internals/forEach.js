'use strict';

import isIterable from './isIterable';
import isIterator from './isIterator';

/**
 * Helper to iterate over sequence types (arrays, array-like objects,
 * objects, etc)
 *
 * @param {Iterable} seq
 * @param {function(this:T, ...)} callback
 * @param {T=} optThisObj
 * @template T
 */
export default function forEach(seq, callback, optThisObj) {
  if (Array.isArray(seq)) {
    let i = 0;
    let l = seq.length;
    if (optThisObj) {
      for (; i < l; i++) {
        callback.call(optThisObj, seq[i], i);
      }
    } else {
      for (; i < l; i++) {
        callback(seq[i], i);
      }
    }
    return;
  }
  if (isIterable(seq)) {
    seq = seq[Symbol.iterator]();
  }
  if(isIterator(seq)) {
    var v;
    var i;
    // Avoiding call if it is not necessary is faster in some browsers
    if (optThisObj !== undefined) {
      for (v of seq) {
        i += 1;
        callback.call(optThisObj, v, i);
      }
    } else {
      for (v of seq) {
        i += 1;
        callback(v, i);
      }
    }
  }
  else if(seq && typeof seq === 'object') {
    if (optThisObj) {
      for (let prop in seq) {
        callback.call(optThisObj, seq[prop], prop);
      }
    } else {
      for (let prop in seq) {
        callback(seq[prop], prop);
      }
    }
  }
}
