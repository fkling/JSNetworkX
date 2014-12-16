'use strict';

import sprintf from 'tiny-sprintf';

sprintf.j = function(value) {
  try {
    return JSON.stringify(value);
  }
  catch(e) {
    return value;
  }
};

export default sprintf;
