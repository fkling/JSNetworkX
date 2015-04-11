'use strict';

import JSNetworkXUnfeasible from './JSNetworkXUnfeasible';

/**
 * Exception for algorithms that should return a path when running
 * on graphs where such a path does not exist.
 */
export default class JSNetworkXNoPath extends JSNetworkXUnfeasible {
   constructor(message) {
     super(message);
     this.name = 'JSNetworkXNoPath';
   }
}
