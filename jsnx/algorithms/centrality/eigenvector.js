"use strict";
/*jshint loopfunc:true*/

goog.provide('jsnx.algorithms.centrality.eigenvector');

goog.require('jsnx.exception');
goog.require('jsnx.helper');

goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.object');

/*jshint expr:true*/

/**
 * Optional "named" arguments to pass to 
 * jsnx.algorithms.centrality.eigenvector.
 *
 * max_iter (default=100)
 *     Maximum number of iterations in power method 
 * tol (default=1.0e-6)
 *     Error tolerance used to check convergence in power method iteration
 * nstart (default=null)
 *     Starting value of eigenvector iteration for each node.
 *
 * @typedef {Object|{max_iter: (number|undefined), tol: (number|undefined), nstart: (Object|undefined)}}
*/

jsnx.algorithms.centrality.eigenvector.eigenvector_centrality_args;

/*jshint expr:false*/

/**
 * Compute the eigenvector centrality for the graph G.
 *
 * Uses the power method to find the eigenvector for the 
 * largest eigenvalue of the adjacency matrix of G.
 *
 * See Also
 * --------
 * pagerank
 * hits
 *
 * Notes
 * -----
 *
 * The eigenvector calculation is done by the power iteration method
 * and has no guarantee of convergence.  The iteration will stop 
 * after max_iter iterations or an error tolerance of number_of_nodes(G)*tol
 * has been reached.
 * 
 * For directed graphs this is "right" eigevector centrality.  For 
 * "left" eigenvector centrality, first reverse the graph with G.reverse().
 *
 * @param {!jsnx.classes.Graph} G A JSNetworkX graph
 * @param {jsnx.algorithms.centrality.eigenvector.eigenvector_centrality_args=} opt_arg_dict (default=null)
 *
 * @return {jsnx.contrib.Map} object with node keys with eigenvector centrality as the value.
 * @export
*/
jsnx.algorithms.centrality.eigenvector.eigenvector_centrality = function(
  G,
  opt_arg_dict
) {
  if (!goog.isDefAndNotNull(opt_arg_dict)) {
    opt_arg_dict={};
  }
  if (goog.typeOf(opt_arg_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The arg_dict argument must be an object.'
    );
  }
  if (G.is_multigraph()) {
    throw new Error(
      'eigenvector_centrality() not defined for multigraphs'
    );
  }
  var length = jsnx.helper.len(G);
  if (length == 0) {
    throw new jsnx.exception.JSNetworkXError(
      'eigenvector_centrality(): empty graph'
    );
  }
  var max_iter = goog.object.get(opt_arg_dict, 'max_iter', 100);
  var tol = goog.object.get(opt_arg_dict, 'tol', 1.0e-6);
  var x;
  if (goog.object.get(opt_arg_dict, 'nstart', null) === null) {
    // Choose starting vector with entries of 1 / G.length
    x = jsnx.helper.mapfromkeys(G, 1.0 / length);
  } else {
    x = opt_arg_dict['nstart'];
  }
  // Normalize starting vector
  var sum_x = goog.math.sum.apply(null, x.values());
  var s = 1.0 / sum_x;
  x.forEach(function(k, v) {
    x.set(k, v * s);
  });
  var nnodes = G.number_of_nodes();
  var xlast;
  var weights = jsnx.classes.func.get_edge_attributes(G, 'weight');
  // Make up to max_iter iterations
  for(var i = 0; i < max_iter; i++) {
    xlast = jsnx.helper.deepcopy(x);
    x.forEach(function(k, v) {
      x.set(k, 0);
    });
    //Do the multiplication y=Ax
    x.forEach(function(n, v) {
      jsnx.helper.forEach(G.neighbors_iter(n), function(nbr) {
        x.set(n, x.get(n) + xlast.get(nbr)*weights.get([n, nbr], 1));
      });
    });
    // Normalize vector
    try {
      s = 1.0 / Math.sqrt(goog.math.sum.apply(null, goog.array.map(x.values(), function(v) { return Math.pow(v, 2) })));
    } catch (e) {
      s = 1.0;
    }
    x.forEach(function(n, v) {
      x.set(n, v * s);
    });
    // Check convergence
    var err = goog.math.sum.apply(null, goog.array.map(x.keys(), function(n) { return Math.abs(x.get(n) - xlast.get(n)) }));
    if (err < nnodes*tol) {
      return x
    }
  }
  throw new jsnx.exception.JSNetworkXError(
    'eigenvector_centrality(): power iteration failed to converge in ' + max_iter + 'iterations'
  )
};
goog.exportSymbol(
  'jsnx.eigenvector_centrality',
  jsnx.algorithms.centrality.eigenvector.eigenvector_centrality
);
