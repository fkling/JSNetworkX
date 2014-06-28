"use strict";

var es6forof = require('es6forof');
var regenerator = require('regenerator');
var transformify = require('./transformify');

function gen(code) {
  return regenerator(es6forof(code));
}

var generatorify = transformify(function(filename, code) {
  return gen(code);
});

module.exports = exports = generatorify;
exports.gen = gen;
