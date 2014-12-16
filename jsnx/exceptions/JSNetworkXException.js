"use strict";

export default class JSNetworkXException extends Error {
  constructor(message) {
    this.name = 'JSNetworkXException';
    this.message = message;
  }
}
