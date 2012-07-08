"use strict";

goog.provide('jsnx.helper');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.iter');


/**
 * Returns an object, given an array of (key, value) tuples.
 *
 * @param {?.<Array>} kvs Container of key,value tuples
 * 
 * @return {!Object}
 */
jsnx.helper.objectFromKV = function(kvs) {
    return goog.iter.reduce(jsnx.helper.iter(kvs), function(obj, kv) {
        obj[kv[0]] = kv[1];
        return obj;
    }, {});
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.objectFromKV', jsnx.helper.objectFromKV);
}

/**
 * Returns an object, given an array of keys and an default value.
 * Like dict.fromkeys in Python.
 *
 * @param {?} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!Object}
 */
jsnx.helper.fromkeys = function(keys, opt_value) {
    if(!goog.isDef(opt_value)) {
        opt_value = null;
    }
    var result = {};
    jsnx.helper.forEach(keys, function(key) {
        result[key] = opt_value;
    });
    return result;
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.fromkeys', jsnx.helper.fromkeys);
}

/**
 * Returns true if object is an iterator 
 * 
 * @param {?} obj
 *  
 * @return {boolean}
 */
jsnx.helper.isIterator = function(obj) {
    return obj instanceof goog.iter.Iterator || goog.isFunction(obj.__iterator__);
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.isIterator', jsnx.helper.isIterator);
}


/**
 * Returns true if object is an container which can be iterated over,
 * i.e. if it is an object, array, array-like object or an iterator.
 * 
 * @param {?} obj
 *  
 * @return {boolean}
 */
jsnx.helper.isIterable = function(obj) {
    return goog.typeOf(obj) === 'object' || goog.isArrayLike(obj) || jsnx.isIterator(obj);
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.isIterable', jsnx.helper.isIterable);
}


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
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.len', jsnx.helper.len);
}


/**
 * Helper to iterate over sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {!(goog.iter.Iterable|Object)} seq
 * @param {function} callback
 * @param {*} opt_this_obj
 * @param {boolean} opt_expand If true, elements of the sequence are expected
 *      to be array-like and each item in these elements is passed as 
 *      argument to the callback
 */
jsnx.helper.forEach = function(seq, callback, opt_this_obj, opt_expand) {

    // opt_this_obj can be omitted
    if(goog.isBoolean(opt_this_obj)) { 
        opt_expand = opt_this_obj;
        opt_this_obj = null;
    }

    if(opt_expand) {
        var orig_callback = callback;
        /** @this opt_this_obj */
        callback = function(val) {
            orig_callback.apply(this, val);
        };
    }

    if(jsnx.helper.isIterator(seq)) {
        goog.iter.forEach(seq, callback, opt_this_obj);
    }
    else if(goog.isArrayLike(seq) || goog.isString(seq)) {
        goog.array.forEach(seq, callback, opt_this_obj);
    }
    else if(goog.isObject(seq)) {
        jsnx.helper.forEach(goog.object.getKeys(seq), callback, opt_this_obj);
    }
};
goog.exportSymbol('jsnx.forEach', jsnx.helper.forEach);
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.forEach', jsnx.helper.forEach);
}


/**
 * Helper to map sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {(goog.iter.Iterable|Object)} sequence
 * @param {function} callback
 * @param {*} this_obj
 *
 * @return {(Array|Object|goog.iter.Iterator)}
 */
jsnx.helper.map = function(sequence, callback, this_obj) {
    if(goog.isArrayLike(sequence)) {
         return goog.array.map(sequence, callback, this_obj);
    }
    else if(jsnx.helper.isIterator(sequence)) {
        return goog.iter.map(sequence, callback, this_obj);
    }
    else if(goog.isObject(sequence)) {
        return goog.object.map(sequence, callback, this_obj);
    }
    else {
        throw new TypeError();
    }
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.map', jsnx.helper.map);
}


/**
 * Helper to zip sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {(goog.iter.Iterable|Object),...} var_args
 *
 * @return {(Array|Object|goog.iter.Iterator)}
 */
jsnx.helper.zip = function() {
    var args = arguments,
        first = args[0];
    if(goog.isArrayLike(first)) {
         return goog.array.zip.apply(null, args);
    }
    else if(jsnx.helper.isIterator(first)) {
        var iterator = new goog.iter.Iterator(),
            l = args.length;

        iterator.next = function() {
            var next = [];
            for(var i = 0; i < l; i++) {
                next.push(args[i].next());
            }
            return next;
        };
        return iterator;
    }
    else if(goog.isObject(first)) {
        return goog.array.zip.apply(null, 
                         goog.array.map(args, goog.object.getKeys));
    }
    else {
        throw new TypeError();
    }
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.zip', jsnx.helper.zip);
}


/**
 * Implements Python's range function, returns an iterator.
 *
 * @param {number=} opt_start Number to start from
 * @param {number} end Number to count to
 * @param {number=} opt_step Stepsize
 *
 * @return {goog.iter.Iterator} 
 */
jsnx.helper.range = function(opt_start, end, opt_step) {

    if(arguments.length === 0) {
        return [];
    }
    else if(arguments.length === 1) {
        end = opt_start;
        opt_start = 0;
        opt_step = 1;
    }
    else if(arguments.length === 2) {
        opt_step = 1;
    }
    else if(arguments.length === 3 && arguments[2] === 0) {
        throw "range() step argument must not be zero";
    }

    var iterator = new goog.iter.Iterator(),
        negative = opt_step < 0,
        counter = opt_start,
        current;

    iterator.next = function() {
        if(negative && counter <= end || !negative && counter >= end) {
            throw goog.iter.StopIteration;
        }
        current = counter;
        counter += opt_step;
        return current;
    };

    return iterator;
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.range', jsnx.helper.range);
}


/**
 * Implements Python's itertools.combinations
 *
 * Return r length subsequences of elements from the input iterable.
 *
 * @param {?} iterable
 * @param {number} r
 *
 * @return {goog.iter.Iterable}
 */
jsnx.helper.combinations = function(iterable, r) {
    var pool = jsnx.helper.toArray(iterable),
        n = pool.length;

    if(r > n) {
        return;
    }

    var indices = jsnx.helper.toArray(jsnx.helper.range(r)),
        iterator = new goog.iter.Iterator();

    /** @this {goog.iter.Iterator} */
    iterator.next = function() {
        var result = goog.array.map(indices, function(i) {
            return pool[i];
        });

        this.next = function() {
            var cont = false, i;
            for(i = r; i--;) {
                if(indices[i] != i + n - r) {
                    cont = true;
                    break;
                }
            }
            if(!cont) {
                throw goog.iter.StopIteration;
            }
            
            indices[i] += 1;
            for(var j = i+1; j < r; j++) {
                indices[j] = indices[j-1] + 1;
            }
            return goog.array.map(indices, function(i) {
                return pool[i];
            });
        };

        return result;
    };

    return iterator;
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.combinations', jsnx.helper.combinations);
}


/**
 * Implements Python's itertools.permutations
 *
 * Return successive r length permutations of elements in the iterable.
 * *
 * @param {?} iterable
 * @param {number=} opt_r
 *
 * @return {goog.iter.Iterable}
 */
jsnx.helper.permutations = function(iterable, opt_r) {
    var pool = jsnx.helper.toArray(iterable),
        n = pool.length,
        r = goog.isNumber(opt_r) ? opt_r : n;

    if(r > n) {
        return;
    }

    var indices = jsnx.helper.toArray(jsnx.helper.range(n)),
        cycles = jsnx.helper.toArray(jsnx.helper.range(n, n - r, -1)),
        iterator = new goog.iter.Iterator(),
        itr = new goog.iter.Iterator(),
        chain,
        broke = true;

    /** @this {goog.iter.Iterator} */
    iterator.next = function() {
        this.next = chain.next;
        return  goog.array.map(indices.slice(0,r), function(i) {
            return pool[i];
        });

    };

    itr.next = function() {
         return broke;
    };

    chain = jsnx.helper.nested_chain(itr, function(br) {
        if(!br) {
             throw goog.iter.StopIteration;
        }
        broke = false;
        return jsnx.helper.range(r-1,-1,-1);
    }, function(i) {
        if(!broke) {
            cycles[i] -= 1;
            if(cycles[i] === 0) {
                indices.splice.apply(indices, [i, indices.length].concat(indices.slice(i+1).concat([indices[i]])));
                cycles[i] = n - i;
            }
            else {
                var j = cycles[i],
                    tmp = indices[i];
                indices[i] = indices[indices.length-j];
                indices[indices.length-j] = tmp;
                broke = true;
                return jsnx.helper.iter([goog.array.map(indices.slice(0,r), function(i) {
                    return pool[i];
                })]);
            }
        }
    }, function(t) {
        return t;
    });

    return iterator;
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.permutations', jsnx.helper.permutations);
}

/**
 * Like goog.object.extend, but also extends nested objects *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
jsnx.helper.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      if(!goog.isDef(target[key]) || goog.typeOf(target[key]) !== 'object') {
          target[key] = jsnx.helper.deepcopy(source[key]);
      }
      else if(goog.typeOf(target[key]) === 'object' && goog.typeOf(source) === 'object') {
          jsnx.helper.extend(target[key], source[key]);
      }
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
        key = goog.object.PROTOTYPE_FIELDS_[j];
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if(!goog.isDef(target[key]) || goog.typeOf(target[key]) !== 'object') {
                target[key] = jsnx.helper.deepcopy(source[key]);
            }
            else if(goog.typeOf(target[key]) === 'object' && goog.typeOf(source) === 'object') {
                jsnx.helper.extend(target[key], source[key]);
            }
        }
    }
  }
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.extend', jsnx.helper.extend);
}


/**
 * A simplified mixin version which only copies own properties
 *
 * @param {Object} target
 * @param {Object} source
 */
jsnx.helper.mixin = function(target, source) {
    for(var prop in source) {
        if(source.hasOwnProperty(prop) && prop !== 'constructor') {
            target[prop] = source[prop];
        }
    }
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.mixin', jsnx.helper.mixin);
}


/**
 * Helper to create an array from sequence types 
 * (arrays, array-like objects, objects, etc)
 *
 * @param {(goog.iter.Iterable|Object)} sequence
 * @param {function} callback
 * @param {*} this_obj
 *
 * @return {Array}
 */
jsnx.helper.toArray = function(sequence) {
    if(goog.isArrayLike(sequence)) {
        return goog.array.toArray(sequence);
    }
    else if(jsnx.helper.isIterator(sequence)) {
        return goog.iter.toArray(sequence);
    }
    else if(goog.isObject(sequence)) {
        return goog.object.getKeys(sequence);
    }
    else {
        throw new TypeError();
    }
};
goog.exportSymbol('jsnx.toArray', jsnx.helper.toArray);
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.toArray', jsnx.helper.toArray);
}


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
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.items', jsnx.helper.items);
}


/**
 * Provides an equivalent method to dict.iteritems().
 *
 * @param {Object} obj to extract the key-values from
 *
 * @return {goog.iter.Iterator}
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
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.iteritems', jsnx.helper.iteritems);
}


/**
 * Returns an iterator object for the given array, array-like object
 * or object. Should behave like Python's iter:
 * http://docs.python.org/library/functions.html#iter
 *
 *
 * The iterator object implements the goog.iter.Iterator interface.
 *
 * @param {(Object|goog.iter.Iterable)} seq
 *
 * @return {goog.iter.Iterator}
 */
jsnx.helper.iter = function(seq, f, this_obj) {
    if(goog.typeOf(seq) === 'object' && !goog.isArrayLike(seq) && !jsnx.helper.isIterator(seq)) {
        seq = goog.object.getKeys(/** @type {Object} */ seq);
    }

    return goog.iter.toIterator(seq);
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.iter', jsnx.helper.iter);
}


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
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.nested_chain', jsnx.helper.nested_chain);
}


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
goog.exportSymbol('jsnx.sentinelIterator', jsnx.helper.sentinelIterator);
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.sentinelIterator', jsnx.helper.sentinelIterator);
}


/**
 * Returns true if obj is a plain object, i.e.
 * created by an object literal or new Object()
 *
 * This is the same implementation jQuery uses:
 * https://github.com/jquery/jquery/blob/master/src/core.js#L493
 *
 * @param {*} obj The object to test
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
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.isPlainObject', jsnx.helper.isPlainObject);
}


/**
 * Makes a deepcopy of the provided value, similar to 
 * Pythons deepcopy. That is, an object or array is 
 * only copied once.
 *
 * See: http://docs.python.org/library/copy.html#copy.deepcopy
 *
 * Complex object are not copied, unless they defined a
 * clone() method.
 *
 * The implemention is based on goog.object.unsafeClone
 * http://closure-library.googlecode.com/svn/docs/closure_goog_object_object.js.source.html#line450
 * but also works with circular references. Though it 
 * might be slow for large, nested objects. 
 *
 * @param {*} obj The value to copy.
 *
 * @return {*} A copy of the value
 */
jsnx.helper.deepcopy = function(obj, memo_) {
    memo_ = memo_ || [];

    var type = goog.typeOf(obj);
    if (type == 'object' && jsnx.helper.isPlainObject(obj) || type == 'array') {
        // search whether we alrady cloned the object/array
        var c_ = goog.array.find(memo_, function(clone) {
            return obj === clone[0];
        });

        if(c_ !== null) { // found copy
            return c_[1];
        }

        if (obj.clone) {
            c_ = [obj, obj.clone()];
            memo_.push(c_);
            return c_[1];
        }
        var clone = type == 'array' ? [] : {};
        c_ = [obj, clone];
        memo_.push(c_);
        for (var key in obj) {
            clone[key] = jsnx.helper.deepcopy(obj[key], memo_);
        }
        return clone;
    }

    return obj;
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.deepcopy', jsnx.helper.deepcopy);
}


/**
 * Makes a deepcopy of the instance. This means that instance properties
 * are deepcopied
 *
 * @see #deepcopy
 *
 * @param {*} obj The value to copy.
 *
 * @return {*} A copy of the value
 */
jsnx.helper.deepcopy_instance = function(obj) {
    // temprory constructor, we don't know if the original expects
    // parameter
    var T_ = function() {},
        props = {},
        prop, inst;

    T_.prototype = obj.constructor.prototype;

    // collect instance properties
    for(prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            props[prop] = obj[prop];
        }
    }

    // deepcopy them
    props = jsnx.helper.deepcopy(props);

    // create a new instance and assigne properties
    inst = new T_();
    for(prop in props) {
        inst[prop] = props[prop];
    }

    return inst; 
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.deepcopy_instance', jsnx.helper.deepcopy_instance);
}
