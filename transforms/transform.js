"use strict";
var _ = require('lodash');
var asyncTransform = require('./async');
var mapStream = require('map-stream');
var path = require('path');
var through = require('through');
var to5 = require('6to5');

function jstransform(src, prod, options) {
  options = options || {};
  if (!prod) {
    options = _.assign({
      sourceMap: 'inline',
    }, options);
  }

  // Transform async functions first
  src = asyncTransform(src, _.assign({
    delegateName: 'delegateToWorker',
    delegatePath: './jsnx/_internals'
  }, options)).code;

  // Then ES6 and inline source maps
  var result = to5.transform(src, options);
  var code = result.code;
  return code;
}

module.exports = function(prod, options) {
  return function(filepath) {
    var data = '';
    return through(write, end);

    function write (buf) { data += buf; }
    function end() {
      /*jshint validthis:true*/
      var code = jstransform(
        data,
        prod,
        _.assign({filename: path.relative('./', filepath)}, options)
      );
      this.queue(code);
      this.queue(null);
    }
  };
};

module.exports.mapStream = function(prod, options) {
  return mapStream(function(file, cb) {
    try {
      var src = jstransform(
        file.contents.toString(),
        prod,
        _.assign({filename: path.relative('./', file.path)}, options)
      );
      file.contents = new Buffer(src);
      cb(null, file);
    } catch(ex) {
      cb(file.path + ': ' + ex);
    }
  });
};
