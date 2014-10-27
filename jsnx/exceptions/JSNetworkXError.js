"use strict";

var JSNetworkXException = require('./JSNetworkXException');

class JSNetworkXError extends JSNetworkXException {
  constructor(message) {
    super(message);
    this.name = 'JSNetworkXError';
  }
}

module.exports = JSNetworkXError;
