'use strict';

function next(iterator) {
  var result = iterator.next();
  if (result.done) {
    throw new Error('Iterator is already exhausted');
  }
  return result.value;
}

module.exports = next;
