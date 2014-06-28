"use strict";
var _ = require('lodash-node');

exports.sets = _.merge(
  require('./difference'),
  require('./intersection')
);
