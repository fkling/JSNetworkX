"use strict";

/**
 * Return a graph object ready to be populated.
 *
 * If create_using is null or undefined return the default (just jsnx.Graph())
 * If create_using.clear() works, assume it returns a graph object.
 * Otherwise raise an exception because create_using is not a jsnx graph.
 *
 * @param {Graph=} opt_create_using
 *
 * @return {Graph}
 */
function prep_create_using(opt_create_using) {
  var G;

  if (opt_create_using == null) {
    G = new require('../classes/graph')();
  }
  else {
    G = opt_create_using;

    try {
      G.clear();
    }
    catch(e) {
      throw new TypeError("Input graph is not a jsnx graph type");
    }
  }
  return G;
}

module.exports = prep_create_using;
