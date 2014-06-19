/**
 * @typedef {{value: ?, done: boolean}}
 */
var IteratorResult;

/**
 * @typedef {{next: function(): IteratorResult}}
 */
var Iterator;

/**
 * @param {function(wrapGenerator.Context)} func
 * @param {T} thisobj
 * @this {T}
 * @template T
 */
var wrapGenerator = function(func, thisobj) {};

/**
 * @typedef ({delegateYield: function(), abrupt: function(), catch: function()})
 */
wrapGenerator.Context;

/**
 * @param {function()} func
 * @return {function(): Iterator}
 */
wrapGenerator.mark = function(func) {};
