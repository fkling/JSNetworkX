"use strict";

var isGraph = require('../isGraph');
var isArrayLike = require('../isArrayLike');
var isIterator = require('../isIterator');
var isIterable = require('../isIterable');

/**
 * Returns an iterator object for the given array, array-like object
 * or object. Should behave like Python's iter:
 * http://docs.python.org/library/functions.html#iter
 *
 *
 * The iterator object implements the goog.iter.Iterator interface.
 *
 * @param {Iterable} seq
 * @return {!Iterator}
 */
function toIterator(seq) {
  /*jshint expr:true*/
  if (isIterator(seq)) {
    return seq;
  }
  else if (isIterable(seq)) {
    return seq['@@iterator']();
  }
  else if (isGraph(seq)) {
    return seq.adj.keys();
  }
  else if (typeof seq === 'object') {
    if (!isArrayLike(seq)) {
      seq = Object.keys(seq);
    }
    return (function*(seq) {
      for (var i = 0, l = seq.length; i < l; i++) {
        yield seq[i];
      }
    }(seq));
  }
  else {
    throw new TypeError('Unable to convert ' + seq + ' to an iterator'); 
  }
}

module.exports = toIterator;
