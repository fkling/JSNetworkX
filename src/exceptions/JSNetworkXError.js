'use strict';

import JSNetworkXException from './JSNetworkXException';

export default class JSNetworkXError extends JSNetworkXException {
  constructor(message) {
    super(message);
    this.name = 'JSNetworkXError';
  }
}
