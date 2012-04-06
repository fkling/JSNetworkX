/*global goog:true, jsnx:true*/
/*jshint iterator:true*/
"use strict";

goog.provide('jsnx.helper');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.iter');


/**
 * Returns an object, given an array of (key, value) tuples.
 *
 * @param {Array.<Array>} kvs Array of key,value tuples
 * 
 * @return {Object}
 */
jsnx.helper.objectFromKeyValues = function(kvs) {
    return goog.iter.reduce(jsnx.helper.iter(kvs), function(obj, kv) {
        obj[kv[0]] = kv[1];
        return obj;
    }, {});
};


/**
 * Returns true if object is an iterator 
 * 
 * @param {*} iterable
 *  
 * @return {boolean}
 */
jsnx.helper.isIterator = function(iterable) {
    return iterable instanceof goog.iter.Iterator || goog.isFunction(iterable.__iterator__);
};


/**
 * Returns true if object is an container which can be iterated over,
 * i.e. if it is an object, array, array-like object or an iterator.
 * 
 * @param {*} container
 *  
 * @return {boolean}
 */
jsnx.helper.isIterable = function(container) {
    return goog.typeOf(container) === 'object' || goog.isArrayLike(container) || jsnx.isIterator(container);
};

/**
 * Returns the number of elements in the container. That is 
 * the number of elements in the array or object or the length
 * of a string.
 * 
 * @param {(string|Array|Object|{length})} obj Object to determine the length of
 *  
 * @return {number} The number of elements
 */
jsnx.helper.len = function(obj) {
    if(goog.isString(obj) || 
       goog.isArrayLike(obj) || 
       goog.object.containsKey(obj, 'length')) {
        return obj.length;
    }
    else if(jsnx.helper.isPlainObject(obj)) {
        return goog.object.getCount(obj);
    }
    else {
        throw new TypeError();
    }
};


/**
 * Helper to iterate over sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {*} sequence
 * @param {function} callback
 * @param {*} this_obj
 */
jsnx.helper.forEach = function(sequence, callback, this_obj) {
    var each = goog.object.forEach;

    if(goog.isArrayLike(sequence)) {
        each = goog.array.forEach;
    }

    if(jsnx.helper.isIterator(sequence)) {
        each = goog.iter.forEach;
    }

    each(sequence, callback, this_obj);
};


/**
 * Helper to map sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {*} sequence
 * @param {function} callback
 * @param {*} this_obj
 *
 * @return {*}
 */
jsnx.helper.map = function(sequence, callback, this_obj) {
    var map = goog.object.map;

    if(goog.isArrayLike(sequence)) {
        map = goog.array.map;
    }

    if(jsnx.helper.isIterator(sequence)) {
        map = goog.iter.map;
    }

    return map(sequence, callback, this_obj);
};


/**
 * Helper to create an array from sequence types 
 * (arrays, array-like objects, objects, etc)
 *
 * @param {*} sequence
 * @param {function} callback
 * @param {*} this_obj
 */
jsnx.helper.toArray = function(sequence) {
    var toArray = goog.object.getKeys;

    if(goog.isArrayLike(sequence)) {
        toArray = goog.array.toArray;
    }

    if(jsnx.helper.isIterator(sequence)) {
        toArray = goog.iter.toArray;
    }

    return toArray(sequence);    
};



/**
 * Provides an equivalent method to dict.items().
 *
 * @param {Object} obj to extract the key-values from
 *
 * @return {Array.<Array>}
 */
jsnx.helper.items = function(obj) {
    var result = [];

    goog.object.forEach(obj, function(value, key) {
        result.push([key, value]);
    });

    return result;
};


/**
 * Provides an equivalent method to dict.items().
 *
 * @param {Object} obj to extract the key-values from
 *
 * @return {Array.<Array>}
 */
jsnx.helper.iteritems = function(obj) {
    var iterator = new goog.iter.Iterator(),
        key_iterator = goog.iter.toIterator(goog.object.getKeys(obj));

    iterator.next = function() {
        var key = key_iterator.next();
        return [key, obj[key]];
    };

    return iterator;
};


/**
 * Returns an iterator object for the given array, array-like object
 * or object.
 *
 * The iterator object implements the goog.iter.Iteror interface.
 *
 * @param {(Array|Object|{length:number)} seq
 *
 * @return {goog.iter.Iterator)
 */
jsnx.helper.iter = function(seq, f, this_obj) {
    var iterator = new goog.iter.Iterator(), 
        counter = 0;


    if(goog.typeOf(seq) === 'object' && !goog.isArrayLike(seq) && !jsnx.helper.isIterator(seq)) {
        seq = goog.object.getKeys(seq);
    }
 
    return goog.iter.toIterator(seq);
};

/**
 * Chains nested iterators.
 *
 * If one of the callbacks does not return a value or iterator, 
 * the value is silently ignored.
 *
 * @param {goog.iter.Iterable} iterable 
 * @param {function} var_args functions to successivly return a new iterator
 */
jsnx.helper.nested_chain = function(iterable) {
    var iterator = new goog.iter.Iterator(),
        args = goog.array.slice(arguments, 1);

    if(args.length === 0) {
        return iterable;
    }

    try {
        iterable = goog.iter.toIterator(iterable);
    }
    catch(e) {
        iterator.next = function() {
            if(e.message === 'Not implemented') {
                throw new TypeError();
            }
        };
        return iterator;
    }

    var child = null;

    iterator.next = function() {
        var result, next;
        try {
            while(!goog.isDef(result)) {
                result = child.next();
            }
        }
        catch(e) {
            while(!goog.isDef(next) || !goog.isDef(result)) {
                next = iterable.next();
                result = args[0](next);
            }

            if(jsnx.helper.isIterator(result)) {
                child = jsnx.helper.nested_chain.apply(null, goog.array.concat([result], goog.array.slice(args, 1)));
                return iterator.next();
            }
            else {
                child = null;
            }
        }
        return result;
    };

    return iterator;
};


/**
 * Wraps an iterator to return a sentinel value instead of
 * raising an StopIteration exception. Returns undefined
 * if not provided
 *
 * @param {goog.iter.Iterable} iterable
 * @param {*} sentinel
 *
 * @return {goog.iter.Iterator}
 */
jsnx.helper.sentinelIterator = function(iterable, sentinel) {
    var iterator = new goog.iter.Iterator();

    iterator.next = function() {
        return goog.iter.nextOrValue(iterable, sentinel);
    };

    return iterator;
};


/**
 * Returns true if obj is a plain object, i.e.
 * created by an object literal or new Object()
 *
 * This is the same implementation jQuery uses:
 * https://github.com/jquery/jquery/blob/master/src/core.js#L493
 *
 * @param {Object} obj The object to test
 *
 * @return {boolean} True if plain object, else false
 */
jsnx.helper.isPlainObject = function(obj) {
    var hasOwn = Object.prototype.hasOwnProperty;
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || goog.typeOf(obj) !== "object" || obj.nodeType || obj == obj.window ) {
        return false;
    }

    try {
        // Not own constructor property must be Object
        if ( obj.constructor &&
            !hasOwn.call(obj, "constructor") &&
                    !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
            return false;
        }
    } catch ( e ) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
};


/**
 * Makes a deepcopy of the provided value, similar to 
 * Pythons deepcopy. That is, an object or array is 
 * only copied once.
 *
 * Complex object are not copied, unless they defined a
 * clone() method.
 *
 * The implemention is based on goog.object.unsafeClone
 * http://closure-library.googlecode.com/svn/docs/closure_goog_object_object.js.source.html#line450
 * but also works with circular references. Though it 
 * might be slow for large, nested objects. 
 *
 * @param {*} ibj The value to copy.
 *
 * @return {*} A copy of the value
 */
jsnx.helper.deepcopy = function(obj, cloned_) {
    cloned_ = cloned_ || [];

    var type = goog.typeOf(obj);
    if (type == 'object' && jsnx.helper.isPlainObject(obj) || type == 'array') {
        // search whether we alrady cloned the object/array
        var c_ = goog.array.find(cloned_, function(clone) {
            return obj === clone[0];
        });
        
        if(c_ !== null) { // found copy
            return c_[1];
        }

        if (obj.clone) {
            c_ = [obj, obj.clone()];
            cloned_.push(c_);
            return c_[1];
        }
        var clone = type == 'array' ? [] : {};
        c_ = [obj, clone];
        cloned_.push(c_);
        for (var key in obj) {
            clone[key] = jsnx.helper.deepcopy(obj[key], cloned_);
        }
        return clone;
    }

    return obj;
};
