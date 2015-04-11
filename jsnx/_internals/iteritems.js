'use strict';

import items from './items';
import toIterator from './toIterator';

/**
 * Returns an iterator of [key, value] pairs for the given object (just like
 * Python's dict.iteritems()).
 *
 * @param {Object} obj
 * @return {!Array}
 */
export default function iteritems(obj) {
  return toIterator(items(obj));
}
