'use strict';

import JSNetworkXException from './JSNetworkXException';

/**
 * Exception for unexpected termination of algorithms.
 * @constructor
 * @extends {JSNetworkXException}
 */
export default class JSNetworkXAlgorithmError extends JSNetworkXException {
   constructor(message) {
     super(message);
     this.name = 'JSNetworkXAlgorithmError';
   }
}
