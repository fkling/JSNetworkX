"use strict";

class JSNetworkXException extends Error {
  constructor(message) {
    this.name = 'JSNetworkXException';
    this.message = message;
  }
}

module.exports = JSNetworkXException;
