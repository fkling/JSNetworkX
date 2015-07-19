'use strict';
var path = require('path');
var through = require('through');
var babel = require('babel-core');
var _ = require('lodash');

var sharedOptions = {
  stage: 0,
  plugins: [path.join(__dirname, 'async')],
  optional: ['runtime'],
};

function jstransform(src, filepath, options) {
  // Then ES6 and inline source maps
  var result = babel.transform(
    src,
    _.assign(
      {filename: path.relative('./', filepath)},
      options,
      sharedOptions
    )
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
      {
        sourceMaps: dev ? 'inline' : false,
      }
    );
    this.queue(code);
    this.queue(null);
  }
};

module.exports.transform = function(filepath, source, options) {
  return jstransform(
    source,
    filepath,
    {
      sourceMaps: options.dev ? 'inline' : false,
      auxiliaryCommentBefore: "istanbul ignore next",
    }
  );
};
