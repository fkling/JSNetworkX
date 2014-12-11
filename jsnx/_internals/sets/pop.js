"use strict";

/**
 * Removes and returns an element from the set.
 *
 * @param {Set} set
 * @return {?}
 */
function pop(set) {
  try {
    var value = set.values().next().value;
    set.delete(value);
    return value;
  } catch (ex) {}
}

module.exports = pop;
