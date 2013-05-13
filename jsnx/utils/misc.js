"use strict";
goog.provide('jsnx.utils.misc');

goog.require('goog.iter');
goog.require('goog.ui.IdGenerator');

/**
 * @fileoverview
 *
 * Miscellaneous Helpers for JSNetworkX.
 *
 * These are not imported into the base networkx namespace but 
 * can be accessed through jsnx.utils.
 */

//TODO: is_string_like ?
//TODO: iterable ?
//TODO: flatten ?

/**
 * Return True if list is a list of ints.
 *
 * @param {Array} intlist
 *
 * @return {boolean}
 * @export
 */
jsnx.utils.misc.is_list_of_ints = function(intlist) {
    if(!goog.isArrayLike(intlist)) {
        return false;
    }
    for(var i = 0, l = intlist.length; i < l; i++) {
        if(isNaN(intlist[i])) {
            return false;
        }
    }
    return true;
};
goog.exportSymbol('jsnx.utils.is_list_of_ints', jsnx.utils.misc.is_list_of_ints);


//TODO: make_str ? (could always call `toString()`)


/**
 * Yield cumulative sum of numbers.
 *
 * @param {Array} numbers
 *
 * @return {goog.iter.Iterator}
 * @export
 */
jsnx.utils.misc.cumulative_sum = function(numbers) {
    var csum = 0;
    return goog.iter.map(numbers, function(n) {
        csum += n;
        return csum;
    });
};
goog.exportSymbol('jsnx.utils.cumulative_sum', jsnx.utils.misc.cumulative_sum);


/**
 * Generate a unique node label.
 *
 * @return {string}
 * @export
 */
jsnx.utils.misc.generate_unique_node = function() {
    return goog.ui.IdGenerator.getInstance().getNextUniqueId();
};
goog.exportSymbol('jsnx.utils.generate_unique_node', jsnx.utils.misc.generate_unique_node);


//WON'T_PORT: default_opener
//WON'T_PORT: dict_to_numpy_array
