/*jshint latedef:false*/
'use strict';

import baseClone from 'lodash/internal/baseClone';
import isGraph from './isGraph';
import isMap from './isMap';
import isSet from './isSet';

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
  ownProps = deepcopyImplementation(ownProps, stackA, stackB);

  // create a new instance and assign properties
  instance = new T_();
  for(prop in ownProps) {
      instance[prop] = ownProps[prop];
  }

  return instance;
}

function deepcopyImplementation(value, stackA, stackB) {
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
    null,
    null,
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
export default function deepcopy(value) {
  return deepcopyImplementation(value, [], []);
}
