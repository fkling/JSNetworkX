'use strict';

var sprintf = require('tiny-sprintf');

sprintf.j = function(value) {
  try {
    return JSON.stringify(value);
  }
  finally {
    return;
  }
};

module.exports = sprintf;
