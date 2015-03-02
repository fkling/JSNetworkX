"use strict";
var _ = require('lodash');
var asyncTransform = require('./async');
var path = require('path');
var through = require('through');
var babel = require('babel-core');

function jstransform(src, dev, options) {
  options = options || {};
  if (dev) {
    options = _.assign({
      sourceMap: 'inline',
    }, options);
  }

  // Transform async functions first
  src = asyncTransform(src, _.assign({
    delegateName: 'delegate',
    delegatePath: './jsnx/_internals'
  }, options)).code;

  // Then ES6 and inline source maps
  var result = babel.transform(src, options);
  var code = result.code;
  return code;
}

module.exports = function(filepath) {
  var data = '';
  return through(write, end);

  function write (buf) { data += buf; }
  function end() {
    /*jshint validthis:true*/
    var code = jstransform(
      data,
      process.env.NODE_ENV === 'dev',
      {
        filename: path.relative('./', filepath),
        experimental: true,
        optional: ['runtime']
      }
    );
    this.queue(code);
    this.queue(null);
  }
};

module.exports.transform = function(path, source, options) {
  return jstransform(
    source,
    options.dev,
    {
      experimental: true,
      filename: path,
      optional: ['runtime']
    }
  );
};
