/*jshint latedef:false*/
"use strict";

var baseClone = require('lodash-node/modern/internals/baseClone');
var isGraph = require('./isGraph');
var isMap = require('./isMap');
var isSet = require('./isSet');

function deepcopyInstance(obj, stackA, stackB) {
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
  ownProps = deepcopy_implementation(ownProps, stackA, stackB);

  // create a new instance and assign properties
  instance = new T_();
  for(prop in ownProps) {
      instance[prop] = ownProps[prop];
  }

  return instance;
}

function deepcopy_implementation(value, stackA, stackB) {
  return baseClone(
    value,
    true,
    function(v) {
      if (isMap(v) || isSet(v) || isGraph(v)) {
        var copy = deepcopyInstance(v, stackA, stackB);
        stackA.push(v);
        stackB.push(copy);
        return copy;
      }
    },
    stackA,
    stackB
  );
}

/**
 * Creates a deep copy of the value, also of maps and sets.
 *
 * @param {*} value The value to be cloned
 * @return {?} 
 */
function deepcopy(value) {
  return deepcopy_implementation(value, [], []);
}

module.exports = deepcopy;
