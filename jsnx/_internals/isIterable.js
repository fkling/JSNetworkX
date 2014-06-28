"use strict";

var wrapGenerator =
  require('regenerator').wrapGenerator || global.wrapGenerator;

/**
 * Returns true if object implement the @@iterator method.
 *
 * @param {*} obj
 
 * @return {boolean}
 */
function isIterable(obj) {
  return wrapGenerator.isGeneratorFunction(obj['@@iterator']);
}

module.exports = isIterable;
