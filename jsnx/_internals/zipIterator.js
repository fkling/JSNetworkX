"use strict";

/**
 * Takes a number of iterators and returns a new iterator which emits an array
 * of each of the iterators next values. Stops when the shortest iterator is
 * exhausted.
 *
 * @param {...Iterator} var_args
 * @return {Iterator}
 */
export default function* zipIterator() {
  // TODO: Use rest parameter once 6to5 is fixed (2.0)
  var varArgs = arguments;
  var length = varArgs.length;

  while (true) {
    var done = false;
    var nextZip = new Array(length);
    for (var i = 0; i < length; i++) {
      var next = varArgs[i].next();
      if (next.done) {
        done = true;
        break;
      }
      nextZip[i] = next.value;
    }
    if (done) {
      break;
    }
    yield nextZip;
  }
}
