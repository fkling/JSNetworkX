"use strict";

goog.provide('jsnx.helper');

goog.require('goog.array');
goog.require('goog.iter');
goog.require('goog.object');
goog.require('jsnx');
goog.require('jsnx.contrib');

/*jshint expr:true*/

/** @typedef {(goog.iter.Iterable|Array|Object)} */
jsnx.helper.Iterable;

/** @typedef {(Array|{length:number})} */
jsnx.helper.ArrayLike;


/*jshint expr:false*/

// exposes goog.iter.filter for easier processing of iterators in user code
goog.exportSymbol('jsnx.filter', goog.iter.filter);


/**
 * Returns an object, given an array of (key, value) tuples.
 *
 * @param {jsnx.helper.Iterable} kvs Container of key,value tuples
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
 * @param {jsnx.helper.Iterable} keys Container of keys
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
 * Same as 'jsnx.helper.fromkeys' but returns a Map instead of an object.
 * 
 * @param {jsnx.helper.Iterable} keys Container of keys
 * @param {*} opt_value the value, default is null
 *
 * @return {!jsnx.contrib.Map}
 */
 jsnx.helper.mapfromkeys = function(keys, opt_value) {
   if (!goog.isDef(opt_value)) {
     opt_value = null;
   }
   var result = new jsnx.contrib.Map();
   jsnx.helper.forEach(keys, function(key) {
     result.set(key, opt_value);
   });
   return result;
 };
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.mapfromkeys', jsnx.helper.mapfromkeys);
}


/**
 * Returns true if object is an iterator 
 * 
 * @param {*} obj
 *  
 * @return {boolean}
 */
jsnx.helper.isIterator = function(obj) {
    return goog.isDefAndNotNull(obj) && (obj instanceof goog.iter.Iterator || goog.isFunction(obj.__iterator__));
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.isIterator', jsnx.helper.isIterator);
}


/**
 * Returns true if object is an container which can be iterated over,
 * i.e. if it is an object, array, array-like object or an iterator.
 * 
 * @param {*} obj
 *  
 * @return {boolean}
 */
jsnx.helper.isIterable = function(obj) {
    return goog.typeOf(obj) === 'object' || 
      goog.isArrayLike(obj) || 
      jsnx.helper.isIterator(obj);
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.isIterable', jsnx.helper.isIterable);
}


/**
 * Returns the number of elements in the container. That is 
 * the number of elements in the array or object or the length
 * of a string.
 * 
 * @param {(string|Object|goog.array.ArrayLike|jsnx.classes.Graph)} obj
 *    Object to determine the length of
 *  
 * @return {number} The number of elements
 * @throws {TypeError} When length cannot be determined
 */
jsnx.helper.len = function(obj) {
    if (obj instanceof jsnx.classes.Graph) {
      return obj.number_of_nodes();
    }
    else if(goog.isString(obj) || 
       goog.isArrayLike(obj)) {
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
 * @param {jsnx.helper.Iterable} seq
 * @param {function(this:T, ...)} callback
 * @param {T=} opt_this_obj
 * @param {boolean=} opt_expand If true, elements of the sequence are expected
 *      to be array-like and each item in these elements is passed as 
 *      argument to the callback
 * @template T
 */
jsnx.helper.forEach = function(seq, callback, opt_this_obj, opt_expand) {

    // opt_this_obj can be omitted
    if(goog.isBoolean(opt_this_obj)) { 
        opt_expand = opt_this_obj;
        opt_this_obj = null;
    }

    if(opt_expand) {
        var orig_callback = callback;
        /** @this {*} */
        callback = function(val) {
            orig_callback.apply(this, val);
        };
    }

    if (seq instanceof jsnx.classes.Graph) {
        goog.iter.forEach(jsnx.helper.iter(seq), callback, opt_this_obj);
    }
    else if(jsnx.helper.isIterator(seq)) {
        goog.iter.forEach(
          /** @type {goog.iter.Iterable} */ (seq),
          callback,
          opt_this_obj
        );
    }
    else if(goog.isArrayLike(seq) || goog.isString(seq)) {
        goog.array.forEach(
          /** @type {jsnx.helper.ArrayLike} */ (seq),
          callback,
          opt_this_obj
        );
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
 * @param {jsnx.helper.Iterable} sequence
 * @param {function(this:T,...)} callback
 * @param {T=} this_obj
 * @template T
 *
 * @return {(Array|Object|goog.iter.Iterator)}
 */
jsnx.helper.map = function(sequence, callback, this_obj) {
    if (sequence instanceof jsnx.classes.Graph) {
        return jsnx.helper.map(jsnx.helper.iter(sequence), callback, this_obj);
    }
    else if(goog.isArrayLike(sequence)) {
        return goog.array.map(
          /** @type {jsnx.helper.ArrayLike} */ (sequence),
          callback,
          this_obj
        );
    }
    else if(jsnx.helper.isIterator(sequence)) {
        return goog.iter.map(
          /** @type {goog.iter.Iterable} */ (sequence),
          callback,
          this_obj
        );
    }
    else if(goog.isObject(sequence)) {
        return goog.object.map(sequence, callback, this_obj);
    }
    else {
        throw new TypeError();
    }
};
goog.exportSymbol('jsnx.map', jsnx.helper.map);
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.map', jsnx.helper.map);
}


/**
 * Helper to zip sequence types (arrays, array-like objects, objects, etc)
 *
 * @param {...(jsnx.helper.Iterable)} var_args
 *
 * @return {!(Array|Object|goog.iter.Iterator)}
 */
jsnx.helper.zip = function(var_args) {
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
 * Max with callback function.
 *
 * @param {jsnx.helper.Iterable} seq
 * @param {function(...)=} opt_map
 *
 * @return {number}
 */
jsnx.helper.max = function(seq, opt_map) {
    if(!goog.isFunction(opt_map)) {
        seq = jsnx.helper.toArray(seq);
    }
    else {
        seq = jsnx.helper.toArray(jsnx.helper.map(seq, function() {
            return opt_map.apply(null, arguments);
        }));
    }
    return Math.max.apply(null, seq);
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.max', jsnx.helper.max);
}


/**
 * Implements Python's range function, returns an iterator.
 *
 * If one argument n is passed, iteratos over 0...n.
 * If two arguments i,j are passed, iterates over i...j.
 * If three arguments i,j,k are passed, iterates over i, i+k, i+2k, ...j
 *
 * @param {?number=} opt_start Number to start from
 * @param {?number=} opt_end Number to count to
 * @param {?number=} opt_step Stepsize
 *
 * @return {!goog.iter.Iterator}
 */
jsnx.helper.range = function(opt_start, opt_end, opt_step) {

    if(arguments.length === 0) {
        return goog.iter.toIterator([]);
    }
    else if(arguments.length === 1) {
        opt_end = opt_start;
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
        if(negative && counter <= opt_end || !negative && counter >= opt_end) {
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
 * @param {jsnx.helper.Iterable} iterable
 * @param {number} r
 *
 * @return {goog.iter.Iterator}
 */
jsnx.helper.combinations = function(iterable, r) {
    var pool = jsnx.helper.toArray(iterable),
        n = pool.length;

    if(r > n) {
        return new goog.iter.Iterator();
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
 * @param {jsnx.helper.Iterable} iterable
 * @param {number=} opt_r
 *
 * @return {goog.iter.Iterator}
 */
jsnx.helper.permutations = function(iterable, opt_r) {
    var pool = jsnx.helper.toArray(iterable),
        n = pool.length,
        r = goog.isNumber(opt_r) ? opt_r : n;

    if(r > n) {
        return new goog.iter.Iterator();
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
 *
 * @suppress {visibility}
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
 * @param {jsnx.helper.Iterable} sequence
 *
 * @return {!Array}
 */
jsnx.helper.toArray = function(sequence) {
    if (sequence instanceof jsnx.classes.Graph) {
      return jsnx.helper.toArray(jsnx.helper.iter(sequence));
    }
    else if(goog.isArrayLike(sequence)) {
        return goog.array.toArray(/** @type jsnx.helper.ArrayLike */ (sequence));
    }
    else if(jsnx.helper.isIterator(sequence)) {
        return goog.iter.toArray(/** @type {goog.iter.Iterable} */ (sequence));
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
 * @return {!goog.iter.Iterator}
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
 * @param {jsnx.helper.Iterable} seq
 *
 * @return {!goog.iter.Iterator}
 */
jsnx.helper.iter = function(seq) {
    if (seq instanceof jsnx.classes.Graph) {
        return jsnx.helper.iter(seq['adj'].keys());
    }
    else if (goog.typeOf(seq) === 'object' && 
        !goog.isArrayLike(seq) && 
        !jsnx.helper.isIterator(seq))
    {
        seq = goog.object.getKeys(/** @type {Object} */ (seq));
    }

    return goog.iter.toIterator(/** @type {goog.iter.Iterable} */ (seq));
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
 * @param {...function(?):*} var_args functions to successivly return 
 *    a new iterator
 */
jsnx.helper.nested_chain = function(iterable, var_args) {
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

    var stack_pointer = 0;
    var stack_size = args.length;
    var stack = [iterable];

    iterator.next = function() {
      do {
        try {
          var next_value, next_result;
          do {
            next_value = stack[stack_pointer].next();
            if (goog.isDef(next_value)) {
              next_result = args[stack_pointer](next_value);
            }
          }
          while(!goog.isDef(next_value));

          if (jsnx.helper.isIterator(next_result)) {
            // anything more to call?
            if (stack_pointer === stack_size - 1) {
              return next_result;
            }
            // push on stack
            stack.push(next_result);
            stack_pointer += 1;
          }
          else if(goog.isDef(next_result)) {
            return next_result;
          }
        }
        catch(ex) {
          if (ex !== goog.iter.StopIteration) {
            throw ex;
          }
          else {
            if (stack_pointer > 0) {
              stack.pop();
              stack_pointer -= 1;
            }
            else {
              throw ex;
            }
          }
        }
      }
      while(true);
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

    obj = /** @type {Object} */ (obj);

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

    return key === undefined || hasOwn.call(obj, key);
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
 * @param {T} obj The value to copy.
 * @param {Array=} opt_memo Only used internally
 *
 * @return {T} A copy of the value
 * @template T
 */
jsnx.helper.deepcopy = function(obj, opt_memo) {
    opt_memo = opt_memo || [];

    var type = goog.typeOf(obj);
    if (
      type == 'object' && 
      (goog.isFunction(obj.copy) || jsnx.helper.isPlainObject(obj)) || 
      type == 'array'
    ) {
        // search whether we already cloned the object/array
        var copy;
        for (var i = 0, l = opt_memo.length; i < l; i += 2) {
          if (obj === opt_memo[i]) { // found copy
            return opt_memo[i+1];
          }
        }

        if (goog.isFunction(obj.copy)) {
            copy = obj.copy(opt_memo);
            opt_memo.push(obj, copy);
            return copy;
        }
        copy = type == 'array' ? [] : {};
        opt_memo.push(obj, copy);
        for (var key in obj) {
          copy[key] = jsnx.helper.deepcopy(obj[key], opt_memo);
        }
        return copy;
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
 * @param {T} obj The value to copy.
 * @param {Array=} opt_memo A list of already cloned objects
 *
 * @return {T} A copy of the value
 * @template T
 */
jsnx.helper.deepcopy_instance = function(obj, opt_memo) {
    // temporary constructor, we don't know if the original expects
    // parameter
    /**
     * @constructor
     */
    var T_ = function() {};
    var props = {};
    var prop;
    var inst;

    T_.prototype = obj.constructor.prototype;

    // collect instance properties
    for(prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            props[prop] = obj[prop];
        }
    }

    // deepcopy them
    props = jsnx.helper.deepcopy(props, opt_memo);

    // create a new instance and assign properties
    inst = new T_();
    for(prop in props) {
        inst[prop] = props[prop];
    }

    return inst; 
};
if(jsnx.TESTING) {
    goog.exportSymbol('jsnx.helper.deepcopy_instance', jsnx.helper.deepcopy_instance);
}

/**
 * Computes the GCD of two numbers.
 *
 * @param {number} x
 * @param {number} y
 *
 * @return {number} gcs
 */
jsnx.helper.gcd = function gcd(x, y) {
  if (y === 0) {
    return x;
  }
  return gcd(y, x % y);
};
