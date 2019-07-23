'use strict';
var path = require('path');
var through = require('through');
var babel = require('@babel/core');

var sharedOptions = {
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-syntax-async-generators'],
};

function jstransform(src, filepath, options) {
  var result = babel.transform(
    src,
    options
  );

  var code = result.code;
  return code;
}


module.exports = function(filepath) {
  var dev = process.env.NODE_ENV === 'dev';
  var data = '';
  return through(write, end);

  function write (buf) { data += buf; }
  function end() {
    /*jshint validthis:true*/
    var code = jstransform(
      data,
      filepath,
      Object.assign(
        {},
        sharedOptions,
        { sourceMaps: dev ? 'inline' : false }
      )
    );
    this.queue(code);
    this.queue(null);
  }
};

module.exports.transform = function(filepath, source, options) {
  return jstransform(
    source,
    filepath,
    Object.assign(
      {},
      sharedOptions,
      {
        sourceMaps: options.dev ? 'inline' : false,
        auxiliaryCommentBefore: 'istanbul ignore next',
      }
    )
  );
};
