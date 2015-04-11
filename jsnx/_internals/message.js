'use strict';

import isIterable from './isIterable';
import isPlainObject from './isPlainObject';
import Map from './Map';
import Set from './Set';
import * as classes from '../classes';

const KEY = '__type-jsnx__';

/**
 * @fileoverview
 * Helper methods to serialize and unserialize data for communicating with
 * workers.
 */

function serializeSet(value) {
  // TODO: serialize nested values
  return {
    [KEY]: 'Set',
    data: Array.from(value.values())
  };
}

function deserializeSet(value) {
  return new Set(value.data);
}

function serializeMap(value) {
  return {
    [KEY]: 'Map',
    data: [for ([k,v] of value) [k, serialize(v)]]//eslint-disable-line no-undef
  };
}

function deserializeMap(value) {
  return new Map(value.data.map(kv => (kv[1] = deserialize(kv[1]), kv)));
}

function serializeGraph(value) {
  // TODO: serialize complex edge and node data
  return {
    [KEY]: value.constructor.__name__,
    data: value.graph,
    nodes: Array.from(value.node),
    edges: value.edges(null, true)
  };
}

function deserializeGraph(value) {
  var G = new classes[value[KEY]](value.edges, value.data);
  G.addNodesFrom(value.nodes);
  return G;
}

/**
 * Returns true if the value can be properly serialized, otherwise false.
 *
 * @param {*} value
 * @return {boolean}
 */
export function isSupported(value) {
  var type = typeof value;
  return (
    // Primitives
    value == null ||
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||

    // Objects and arrays (we just assume they contain only primitives)
    isPlainObject(value) ||
    Array.isArray(value) ||

    // Our custom collections (shallow)
    value instanceof Map ||
    value instanceof Set ||

    // Graphs
    value.constructor.__name__ === 'Graph' ||
    value.constructor.__name__ === 'DiGraph' ||

    // Generic iterables
    isIterable(value)
  );
}

export function serialize(value) {
  // primitives
  var type = typeof value;
  if (!value || type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }
  // Collections
  if (value instanceof Set) {
    return serializeSet(value);
  }
  else if (value instanceof Map) {
    return serializeMap(value);
  }
  // Graphs
  else if (value.constructor.__name__ === 'Graph' ||
    value.constructor.__name__ === 'DiGraph') {
    return serializeGraph(value);
  }
  // Iterables
  else if (isIterable(value)) {
    // We keep it simple for now and don't serialize the values of the iterable
    // itself
    return Array.from(value);
  }
  // TODO: Handle arrays and objects better

  // default
  return value;
}

export function deserialize(value) {
  // primitives
  var type = typeof value;
  if (!value || type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }
  // custom serializtion?
  if (value[KEY]) {
    switch(value[KEY]) {
      case 'Map':
        return deserializeMap(value);
      case 'Set':
        return deserializeSet(value);
      case 'Graph':
      case 'DiGraph':
        return deserializeGraph(value);
    }
  }
  // TODO: Handle arrays and objects better

  // default
  return value;
}

/**
 * Serialize an array of values (e.g. arguments passed to a method).,
 *
 * @param {Array} values
 * @return {{serializable: bool, values: Array}}
 */
export function serializeAll(values=[]) {
  var serializedValues = new Array(values.length);
  var serializable = values.every((value, i) => {
    var supported = isSupported(value);
    if (supported) {
      serializedValues[i] = serialize(value);
    }
    return supported;
  });

  return {serializable, serializedValues};
}
