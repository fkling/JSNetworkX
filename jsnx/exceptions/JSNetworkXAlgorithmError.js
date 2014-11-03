"use strict";

var JSNetworkXException = require('./JSNetworkXException');

/**
 * Exception for unexpected termination of algorithms.
 * @constructor
 * @extends {JSNetworkXException}
 * @export
 */
class JSNetworkXAlgorithmError extends JSNetworkXException {
   constructor(message) {
     super(message);
     this.name = 'JSNetworkXAlgorithmError';
   }
}

module.exports = JSNetworkXAlgorithmError;
