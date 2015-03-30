'use strict';

import sprintf from 'tiny-sprintf';

var undef;

sprintf.j = function(value) {
  if (value === undef) {
    return undef + '';
  }

  try {
    return JSON.stringify(value);
  }
  catch(e) {
    return value + '';
  }
};

export default sprintf;
