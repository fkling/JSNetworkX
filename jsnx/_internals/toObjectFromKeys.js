"use strict";

var forEach = require('./forEach');

/**
 * Returns an object, given an array of keys and an default value.
 * Like dict.fromkeys in Python.
 *
 * @param {jsnx.helper.Iterable} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!Object}
 */
function toObjectFromKeys(keys, opt_value) {
    if(opt_value == null) { // && opt_value == undefined
        opt_value = null;
    }
    var result = {};
    forEach(keys, function(key) {
        result[key] = opt_value;
    });
    return result;
}

module.exports = toObjectFromKeys;
