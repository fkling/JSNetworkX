/*global describe:true, it:true, expect:true, goog: true, jsnx:true*/
/*jshint iterator:true*/
"use strict";

describe('Helper', function() {

    var helper = jsnx.helper,
        isIterator = function(iter) {
            return iter instanceof goog.iter.Iterator || goog.isFunction(iter.__iterator__);
        };


    it('Creates object from key value pairs', function() {
        var obj = helper.objectFromKeyValues([['foo', 5], [10, [1,2]]]);

        expect(obj).toEqual({foo: 5, 10: [1,2]});
    });

    it('Maps objects to (key,value) pairs (like Python\'s items)', function() {
        var obj = {foo: 5, bar: [1,2], 5: 42},
            kv = helper.items(obj);

        expect(kv.length === 3).toBeTruthy();
        expect(kv).toContain(['foo', 5]);
        expect(kv).toContain(['bar', [1,2]]);
        expect(kv).toContain(['5', 42]);
    });

    it('Maps objects to an iterator of (key,value) pairs (like Python\'s iteritems)', function() {
        var obj = {foo: 5, bar: [1,2], 5: 42},
            iter = helper.iteritems(obj);

        expect(isIterator(iter)).toBeTruthy();

        var kv = goog.iter.toArray(iter);

        expect(kv.length === 3).toBeTruthy();
        expect(kv).toContain(['foo', 5]);
        expect(kv).toContain(['bar', [1,2]]);
        expect(kv).toContain(['5', 42]);
    });

    it('Chains nested iterators', function() {
        var iters = [
                [
                    [1,2,3],
                    [4,5,6]
                ],
                [
                    goog.iter.toIterator(['a', 'b'])
                ]
            ],
            iter = helper.nested_chain(iters, function(val) {
                return goog.iter.toIterator(val);
            }, function(val) {
                 return goog.iter.toIterator(val);
            }, function(val) {
                return val;
            });

        var kv = goog.iter.toArray(iter);

        expect(kv).toEqual([1,2,3,4,5,6, 'a', 'b']);
    });

    it('Chains nested iterators, skips empty values', function() {
        var iters = [
                [
                    [1,2,3],
                    [4,5,6]
                ],
                [
                    goog.iter.toIterator(['a', 'b'])
                ]
            ],
            iter = helper.nested_chain(iters, function(val) {
                return goog.iter.toIterator(val);
            },function(val) {
                return goog.iter.toIterator(val);
            }, function(val) {
                if(goog.isNumber(val) && val % 2 === 0) {
                    return val;
                }
            });

        var kv = goog.iter.toArray(iter);

        expect(kv).toEqual([2,4,6]);
    });


    it('Prevents iterator from throwing an execption when reaching the end', function() {
        var iter = helper.sentinelIterator(new goog.iter.Iterator(), null);

        expect(iter.next()).toEqual(null);
    });


    it('Deepcopy copies same object only once', function() {
        var foo = [1,2],
            obj = {foo: foo,
                   bar: ['bar', foo]
            },
            Constr = function() {};

        obj.inst = new Constr();

        var copy = helper.deepcopy(obj);
        expect(copy).toEqual(obj);
        expect(copy).not.toBe(obj);
        expect(copy.foo).not.toBe(obj.foo);
        expect(copy.foo).toBe(copy.bar[1]);
        expect(copy.inst).toBe(obj.inst);

        // does not get stuck for self references
        foo.push(foo);
        copy = helper.deepcopy(foo);
        expect(copy).not.toBe(foo);
        expect(copy[2]).toBe(copy);
    });

    //TODO: write tests for isIterable and len
    
    describe('forEach', function() {

        it('Iterates over arrays', function() {
            var arr = [1,2,3];

            helper.forEach(arr, function(val, i) {
                expect(val).toEqual(arr[i]);
            });
        });

        it('Iterates over array like objects', function() {
            var arr = {0: 1, 1: 10, length: 2};

            helper.forEach(arr, function(val, i) {
                expect(val).toEqual(arr[i]);
            });
        });

        it('Iterates over iterators', function() {
            var arr = [10, 15, 20],
                iter = goog.iter.toIterator(arr),
                result = [];

            helper.forEach(iter, function(val) {
                result.push(val);    
            });

            expect(result).toEqual(arr);
        });
    });

    describe('map', function() {

        it('Maps array', function() {
            var arr = [1,2,3];

            var result = helper.map(arr, function(val) {
                return val * 2;
            });

            expect(result).toEqual([2, 4, 6]);
        });

        it('Maps array like objects', function() {
            var arr = {0: 1, 1: 10, length: 2};

            var result = helper.map(arr, function(val, i) {
                return val * 2;                
            });

            expect(result).toEqual([2,20]);
        });

        it('Maps objects', function() {
            var obj = {foo: 5, bar: 10};

            var result = helper.map(obj, function(val) {
                return val * 2;
            });

            expect(result).toEqual({foo: 10, bar: 20});
        });

        
        it('Maps iterators', function() {
            var arr = [1, 2, 3],
                iter = goog.iter.toIterator(arr);


            var result = helper.map(iter, function(val) {
                return val * 2;    
            });

            expect(isIterator(result)).toBeTruthy();
            expect(goog.iter.toArray(result)).toEqual([2, 4, 6]);
        });
    });

    describe('toArray', function() {

        it('Does convert array to new array', function() {
            var arr = [1,2,3];

            expect(helper.toArray(arr)).toEqual([1,2,3]);
            expect(helper.toArray(arr)).not.toBe(arr);
        });

        it('Converst array like objects to array', function() {
            var arr = {0: 1, 1: 10, length: 2};

            expect(helper.toArray(arr)).toEqual([1,10]);
        });

        it('Maps objects to aray keys', function() {
            var obj = {foo: 5, bar: 10};

            expect(helper.toArray(obj)).toEqual(['foo', 'bar']);
        });

        
        it('Maps iterators', function() {
            var arr = [1, 2, 3],
                iter = goog.iter.toIterator(arr);


            expect(helper.toArray(iter)).toEqual([1, 2, 3]);
        });
    });

    describe('iter', function() {

        it('Generates iterators for arrays and array-like objects', function() {
            var arr = [1,2,3],
                arr_like = {0: 1, 1: 2, length: 2};

            var arr_iter = helper.iter(arr),
                arr_like_iter = helper.iter(arr_like);

            expect(isIterator(arr_iter)).toBeTruthy();    
            expect(isIterator(arr_like_iter)).toBeTruthy();    

            expect(goog.iter.toArray(arr_iter)).toEqual([1, 2, 3]);
            expect(goog.iter.toArray(arr_like_iter)).toEqual([1, 2]);
        });

        it('Generates an iterator over keys when given an object', function() {
            var obj = {foo: 5, 0: 'bar'};

            var iter = helper.iter(obj);

            expect(isIterator(iter)).toBeTruthy();

            var kv = goog.iter.toArray(iter); 

            expect(kv).toContain('foo');
            expect(kv).toContain('0');
        });

    });

});
