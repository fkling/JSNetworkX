"use strict";
var _ = require('lodash-node');

exports.Itertools = _.merge(
  require('./iteritems'),
  require('./mapIterator'),
  require('./toArray'),
  require('./toIterator'),
  require('./zipIterator')
);
