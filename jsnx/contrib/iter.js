'use strict';

goog.provide('jsnx.contrib.iter');

/**
 * Converts an iterator to an array.
 *
 * @param {Iterator} iterator
 * @return {Array}
 */
jsnx.contrib.iter.toArray = function(iterator) {
  var values = [];
  for (var v of iterator) {
    values.push(v);
  }
  return values;
};

/**
 * Iterates over  every value of the passed in iterator and execute the callback
 * function
 *
 * @param {Iterator} iterator
 * @param {function(?)} callback
 * @param {object=} this_obj
 *
 */
jsnx.contrib.iter.forEach = function(iterator, callback, this_obj) {
  for (var value of iterator) {
    callback.call(this_obj, value);
  }
};


/**
 * Maps every value of the passed in iterator according to the callback function.
 *
 * @param {Iterator} iterator
 * @param {function(?)} map
 * @param {object=} this_obj
 *
 * @return {Iterator}
 */
jsnx.contrib.iter.map = function*(iterator, map, this_obj) {
  for (var value of iterator) {
    yield map.call(this_obj, value);
  }
};


/**
 * Zips the iterators. The returned iterator has the same length as the shortest
 * iterator argument.
 *
 * @param {...Iterator} var_args
 * @return {Iterator}
 */
jsnx.contrib.iter.zip = function*(var_args) {
  var args = arguments;
  var n = arguments.length;
  while (true) {
    var next_zip = [];
    var stop = false;
    for (var i = 0; i < n; i++) {
      var next = args[i].next();
      if (next.done === true) {
        stop = true;
        break;
      }
      next_zip.push(next.value);
    }

    if (!stop) {
      yield next_zip;
    }
    else {
      break;
    }
  }
};
