"use strict";

var iteratorSymbol = require('./iteratorSymbol');

/**
 * Returns true if object implement the @@iterator method.
 *
 * @param {*} obj
 
 * @return {boolean}
 */
function isIterable(obj) {
  return typeof obj[iteratorSymbol] === 'function';
}

module.exports = isIterable;
