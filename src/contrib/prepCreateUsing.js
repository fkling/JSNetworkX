'use strict';

/**
 * Return a graph object ready to be populated.
 *
 * If create_using is null or undefined return the default (just jsnx.Graph())
 * If create_using.clear() works, assume it returns a graph object.
 * Otherwise raise an exception because create_using is not a jsnx graph.
 *
 * @param {Graph=} opt_create_using
 * @return {Graph}
 */
export default function prepCreateUsing(optCreateUsing) {
  var G;
  // can't use import statement because of circular dependency
  var Graph = require('../classes/Graph');

  if (optCreateUsing == null) {
    G = new Graph();
  }
  else {
    G = optCreateUsing;

    try {
      G.clear();
    }
    catch(e) {
      throw new TypeError('Input graph is not a jsnx graph type');
    }
  }
  return G;
}
