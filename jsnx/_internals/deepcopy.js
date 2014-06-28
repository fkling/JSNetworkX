"use strict";

var cloneDeep = require('lodash-node/modern/objects/cloneDeep');
var isGraph = require('./isSet');
var isMap = require('./isMap');
var isSet = require('./isSet');

function deepcopyInstance(obj) {
  // temporary constructor, we don't know if the original expects
  // parameter
  /**
   * @constructor
   */
  var T_ = function() {};
  T_.prototype = obj.constructor.prototype;
  var ownProps = {};
  var prop;
  var instance;

  // collect instance properties
  for(prop in obj) {
      if(obj.hasOwnProperty(prop)) {
          ownProps[prop] = obj[prop];
      }
  }

  // deepcopy them
  ownProps = deepcopy(ownProps);

  // create a new instance and assign properties
  instance = new T_();
  for(prop in ownProps) {
      instance[prop] = ownProps[prop];
  }

  return instance;
}

/**
 * Creates a deep copy of the value, also of maps and sets.
 *
 * @param {*} value The value to be cloned
 * @return {?} 
 */
function deepcopy(value) {
  return cloneDeep(value, function(v) {
    if (isMap(v) || isSet(v) || isGraph(v)) {
      return deepcopyInstance(v);
    }
  });
}

module.exports = deepcopy;
