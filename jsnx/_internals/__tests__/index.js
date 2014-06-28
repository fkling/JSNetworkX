"use strict";
var _ = require('lodash-node');

exports._Internals = _.merge(
  require('./Map'),
  require('./Set'),
  require('./clear'),
  require('./deepcopy'),
  require('./forEach'),
  require('./genRange'),
  require('./isArrayLike'),
  require('./isGraph'),
  require('./isMap'),
  require('./isIterable'),
  require('./isIterator'),
  require('./isSet'),
  require('./mapSequence'),
  require('./size'),
  require('./toMapFromKeys'),
  require('./toObjectFromKV'),
  require('./toObjectFromKeys'),
  require('./zipSequence')
);
