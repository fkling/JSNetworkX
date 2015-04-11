'use strict';

import JSNetworkXAlgorithmError from './JSNetworkXAlgorithmError';

/**
 * Exception raised by algorithms trying to solve a problem
 * instance that has no feasible solution.
 * @constructor
 * @extends {JSNetworkXAlgorithmError}
 */
export default class JSNetworkXUnfeasible extends JSNetworkXAlgorithmError {
   constructor(message) {
     super(message);
     this.name = 'JSNetworkXUnfeasible';
   }
}
