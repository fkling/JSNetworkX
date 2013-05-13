/*jshint node:true*/
"use strict";

var jsnx = require('../jsnetworkx-test');

exports.extend = function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });
  return target; // for convenience
};

exports.sorted = function sorted(obj) {
  return jsnx.toArray(obj).sort();
};
