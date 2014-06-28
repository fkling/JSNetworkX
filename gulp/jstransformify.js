"use strict";

var es6ShortObjectNotationVisitors = require('jstransform/visitors/es6-object-short-notation-visitors.js').visitorList;
var es6ClassVisitors = require('jstransform/visitors/es6-class-visitors').visitorList;
var es6ArrowFuncVisitors = require('jstransform/visitors/es6-arrow-function-visitors').visitorList;
var es6RestArgumentsVisitors = require('jstransform/visitors/es6-rest-param-visitors').visitorList;
var jstransform = require('jstransform');
var transformify = require('./transformify');

var visitors = es6ShortObjectNotationVisitors
  .concat(es6ClassVisitors)
  .concat(es6ArrowFuncVisitors)
  .concat(es6RestArgumentsVisitors);

function jst(code) {
  return jstransform.transform(visitors, code).code;
}

var jstransformify = transformify(function(filename, code) {
    return jst(code);
});

module.exports = exports = jstransformify;
exports.jst = jst;
