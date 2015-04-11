'use strict';

export default class KeyError extends Error {
  constructor(message) {
    this.name = 'KeyError';
    this.message = message;
  }
}
