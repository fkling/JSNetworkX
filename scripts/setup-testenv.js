'use strict';
require('babel-core/polyfill');
require('source-map-support').install();
global.assert = require('./assert');
global.utils = require('../node/_internals');
global.sinon = require('sinon');
