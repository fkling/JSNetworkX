'use strict';
var path = require('path');
var through = require('through');
var babel = require('babel-core');

function jstransform(src, options) {
  // Then ES6 and inline source maps
  var result = babel.transform(src, options);
  var code = result.code;
  return code;
}

var plugins = [path.join(__dirname, 'async')];

module.exports = function(filepath) {
  var dev = process.env.NODE_ENV === 'dev';
  var data = '';
  return through(write, end);

  function write (buf) { data += buf; }
  function end() {
    /*jshint validthis:true*/
    var code = jstransform(
      data,
      {
        filename: path.relative('./', filepath),
        stage: 0,
        optional: ['runtime'],
        sourceMaps: dev ? 'inline' : false,
        plugins: plugins
      }
    );
    this.queue(code);
    this.queue(null);
  }
};

module.exports.transform = function(filepath, source, options) {
  return jstransform(
    source,
    {
      stage: 0,
      filename: filepath,
      plugins: plugins,
      optional: ['runtime'],
      sourceMaps: options.dev ? 'inline' : false,
      auxiliaryComment: "istanbul ignore next"
    }
  );
};
