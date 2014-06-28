"use strict";

/**
 * Takes a number of iterators and returns a new iterator which emits an array
 * of each of the iterators next values. Stops when the shortest iterator is
 * exhausted.
 *
 * @param {...Iterator} var_args
 * @return {Iterator}
 */
function* zipIterator(...var_args) {
  var length = var_args.length;

  while (true) {
    var done = false;
    var next_zip = new Array(length);
    for (var i = 0; i < length; i++) {
      var next = var_args[i].next();
      if (next.done) {
        done = true;
        break;
      }
      next_zip[i] = next.value;
    }
    if (done) {
      break;
    }
    yield next_zip;
  }
}

module.exports = zipIterator;
