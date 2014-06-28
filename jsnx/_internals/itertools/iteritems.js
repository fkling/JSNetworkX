"use strict";

require('regenerator');

var items = require('../items');
var toIterator = require('./toIterator');

/**
 * Returns an iterator of [key, value] pairs for the given object (just like
 * Python's dict.iteritems()).
 *
 * @param {Object} obj
 * @return {!Array}
 */
function iteritems(obj) {
  return toIterator(items(obj));
}



module.exports = iteritems;
