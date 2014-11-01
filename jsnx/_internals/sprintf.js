'use strict';

var sprintf = require('tiny-sprintf');

sprintf.j = function(value) {
  try {
    return JSON.stringify(value);
  }
  catch(e) {
    return value;
  }
};

module.exports = sprintf;
