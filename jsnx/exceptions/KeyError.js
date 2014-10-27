"use strict";

class KeyError extends Error {
  constructor(message) {
    this.name = 'KeyError';
    this.message = message;
  }
}

module.exports = KeyError;
