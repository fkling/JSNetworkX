'use strict';

export default class KeyError extends Error {
  constructor(message) {
    super();
    this.name = 'KeyError';
    this.message = message;
  }
}
