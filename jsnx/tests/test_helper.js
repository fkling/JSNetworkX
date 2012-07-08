/*global describe:true, it:true, expect:true, goog: true, jsnx:true*/
"use strict";

describe('Helper', function() {

    var helper = jsnx.helper;

    it('Creates object from key value pairs', function() {
        var obj = helper.objectFromKV([['foo', 5], [10, [1,2]]]);

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

    it('Creates proper ranges', function() {
        var range = jsnx.helper.range(5);
        expect(jsnx.helper.isIterator(range)).toBeTruthy();
        expect(jsnx.toArray(range)).toEqual([0,1,2,3,4]);

        range = jsnx.helper.range(5,10);
        expect(jsnx.toArray(range)).toEqual([5,6,7,8,9]);

        range = jsnx.helper.range(0,10,2);
        expect(jsnx.toArray(range)).toEqual([0,2,4,6,8]);

        range = jsnx.helper.range();
        expect(jsnx.toArray(range)).toEqual([]);

        // negative step size
        range = jsnx.helper.range(10,5, -1);
        expect(jsnx.toArray(range)).toEqual([10,9,8,7,6]);
    });

    it('Creates proper combinations', function() {
        var comb = jsnx.helper.combinations([0,1,2,3], 3);
        expect(jsnx.helper.isIterator(comb)).toBeTruthy();
        expect(jsnx.toArray(comb)).toEqual([[0,1,2], [0,1,3], [0,2,3], [1,2,3]]);
    });

    it('Creates proper permutations', function() {
        var comb = jsnx.helper.permutations([0,1,2]);
        expect(jsnx.helper.isIterator(comb)).toBeTruthy();
        expect(jsnx.toArray(comb)).toEqual([[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]]);
    });

    it('Maps objects to an iterator of (key,value) pairs (like Python\'s iteritems)', function() {
        var obj = {foo: 5, bar: [1,2], 5: 42},
            iter = helper.iteritems(obj);

        expect(helper.isIterator(iter)).toBeTruthy();

        var kv = helper.toArray(iter);

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
                    helper.iter(['a', 'b'])
                ]
            ],
            iter = helper.nested_chain(iters, function(val) {
                return helper.iter(val);
            }, function(val) {
                 return helper.iter(val);
            }, function(val) {
                return val;
            });

        var kv = helper.toArray(iter);

        expect(kv).toEqual([1,2,3,4,5,6, 'a', 'b']);
    });

    it('Chains nested iterators, skips empty values', function() {
        var iters = [
                [
                    [1,2,3],
                    [4,5,6]
                ],
                [
                    helper.iter(['a', 'b'])
                ]
            ],
            iter = helper.nested_chain(iters, function(val) {
                return helper.iter(val);
            },function(val) {
                return helper.iter(val);
            }, function(val) {
                if(goog.isNumber(val) && val % 2 === 0) {
                    return val;
                }
            });

        var kv = helper.toArray(iter);

        expect(kv).toEqual([2,4,6]);
    });


    it('Prevents iterator from throwing an execption when reaching the end', function() {
        var iter = helper.sentinelIterator(new helper.iter([]), null);

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

    it('Deepcopy an instance of a constructor function', function() {
        var Constr = function() {
            this.foo = [1,2];
            this.bar = ['bar', this.foo];
        };

        Constr.prototype.baz = [1,2];

        var inst = new Constr();

        var copy = helper.deepcopy_instance(inst);

        expect(copy).toEqual(inst);
        expect(copy).not.toBe(inst);
        expect(copy.foo).not.toBe(inst.foo);
        expect(copy.foo).toBe(copy.bar[1]);
        expect(copy.baz).toBe(inst.baz);
        expect(copy.constructor).toBe(inst.constructor);
    });

    it('Extends nested objects', function() {
        var obj1 = {
                foo: {
                   bar: 5
                }
            },
            obj2 = {
                baz: 42,
                foo: {
                   baz: 6
                }
            };

        helper.extend(obj1, obj2);

        expect(obj1.foo).not.toBe(obj2.foo);
        expect(obj1.baz).toEqual(obj2.baz);
        expect(obj1.foo).toBe(obj1.foo);
        expect(obj1.foo.baz).toEqual(6);
        expect(obj1.foo.bar).toEqual(5);

    });


    //TODO: write tests for isIterable and len
    
    describe('forEach', function() {

        it('Iterates over arrays', function() {
            var arr = [1,2,3],
                result = [];

            helper.forEach(arr, function(val) {
                result.push(val);
            });

            expect(result).toEqual(arr);
        });

        it('Iterates over array like objects', function() {
            var arr = {0: 1, 1: 10, length: 2},
                result = [];

            helper.forEach(arr, function(val, i) {
                result.push(val);
            });

            expect(result).toEqual(arr);
        });

        it('Iterates over iterators', function() {
            var arr = [10, 15, 20],
                iter = helper.iter(arr),
                result = [];

            helper.forEach(iter, function(val) {
                result.push(val);    
            });

            expect(result).toEqual(arr);
        });

        it('Iterates over object keys', function() {
            var obj = {foo: 5, bar: 10},
                result = [];

            helper.forEach(obj, function(val) {
                result.push(val);    
            });

            expect(result).toEqual(goog.object.getKeys(obj));
        });

        
        it('Iterats over arrays 2', function() {
            var arr = [[1,2], [3,4]],
                result = [];

            helper.forEach(arr, function(val) {
                result.push(val);
            });

            expect(result).toEqual(arr);
        });


        it('Expands elements that are arrays', function() {
            var arr = [[1,2], [3,4]],
                result = [];

            helper.forEach(arr, function(a, b) {
                result.push(a, b);
            }, true);

            expect(result).toEqual([1,2,3,4]);
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
                iter = helper.iter(arr);


            var result = helper.map(iter, function(val) {
                return val * 2;    
            });

            expect(helper.isIterator(result)).toBeTruthy();
            expect(helper.toArray(result)).toEqual([2, 4, 6]);
        });
    });


    describe('zip', function() {

        it('Zip arrays', function() {
            var arr1 = [1,2,3],
                arr2 = [4,5,6];

            var result = helper.zip (arr1, arr2);
            expect(result).toEqual([[1,4], [2,5], [3,6]]);
        });

        it('Zips array like objects', function() {
            var arr1 = {0: 1, 1: 10, length: 2},
                arr2 = {0: 2, 1: 20, length: 2};

            var result = helper.zip (arr1, arr2);
            expect(result).toEqual([[1,2], [10,20]]);
        });

        it('Zips objects', function() {
            var obj1 = {foo: 5, bar: 10},
                obj2 = {baz: 10, faz: 20};

            var result = helper.zip(obj1, obj2);
            expect(result).toEqual([['foo', 'baz'], ['bar', 'faz']]);
        });

        
        it('Zips iterators', function() {
            var arr = [1, 2, 3],
                iter1 = helper.iter(arr),
                iter2 = helper.iter(arr);


            var result = helper.zip(iter1, iter2);

            expect(helper.isIterator(result)).toBeTruthy();
            expect(helper.toArray(result)).toEqual([[1,1], [2,2], [3,3]]);
        });

        it('Zip shorter sequence', function() {
            var arr1 = [1,2,3],
                arr2 = [4,5];

            var result = helper.zip(arr1, arr2);
            expect(result).toEqual([[1,4], [2,5]]);
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
                iter = helper.iter(arr);


            expect(helper.toArray(iter)).toEqual([1, 2, 3]);
        });
    });

    describe('iter', function() {

        it('Generates iterators for arrays and array-like objects', function() {
            var arr = [1,2,3],
                arr_like = {0: 1, 1: 2, length: 2};

            var arr_iter = helper.iter(arr),
                arr_like_iter = helper.iter(arr_like);

            expect(helper.isIterator(arr_iter)).toBeTruthy();    
            expect(helper.isIterator(arr_like_iter)).toBeTruthy();    

            expect(helper.toArray(arr_iter)).toEqual([1, 2, 3]);
            expect(helper.toArray(arr_like_iter)).toEqual([1, 2]);
        });

        it('Generates an iterator over keys when given an object', function() {
            var obj = {foo: 5, 0: 'bar'};

            var iter = helper.iter(obj);

            expect(helper.isIterator(iter)).toBeTruthy();

            var kv = helper.toArray(iter); 

            expect(kv).toContain('foo');
            expect(kv).toContain('0');
        });

    });

});
