"use strict";
var through = require('through');

function transformify(func) {
  return function(filename) {
    var buffer = '';
    return through(
      function(c) { buffer += c; },
      function() {
        try {
          this.queue(func(filename, buffer));
          this.queue(null);
        } catch(err) {
          this.emit('error', 'while transforming ' + filename + ':' + err);
        }
      }
    );
  };
}

module.exports = transformify;
