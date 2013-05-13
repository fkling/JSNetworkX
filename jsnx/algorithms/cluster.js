"use strict";
goog.provide('jsnx.algorithms.cluster');

goog.require('goog.array');
goog.require('goog.iter');
goog.require('goog.math');
goog.require('goog.object');
goog.require('jsnx.contrib.Map');
goog.require('jsnx.contrib.Set');
goog.require('jsnx.exception');
goog.require('jsnx.helper');

/**
 * Compute the number of triangles.
 *
 * Finds the number of triangles that include a node as one vertex.
 *
 * Notes:
 * When computing triangles for the entire graph each triangle is counted 
 * three times, once at each node.  Self loops are ignored.
 *
 * @param {jsnx.classes.Graph} G A jsnetworkx graph
 * @param {jsnx.NodeContainer=} opt_nodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 *
 * @return {!(jsnx.contrib.Map|number)} Number of triangles keyed by node label.
 * @export
 */
jsnx.algorithms.cluster.triangles = function(G, opt_nodes) {
  if (G.is_directed()) {
    throw new jsnx.exception.JSNetworkXError(
      'triangles() is not defined for directed graphs.'
    );
  }

  if (goog.isDefAndNotNull(opt_nodes) && G.has_node(opt_nodes)) {
    // return single value
    return Math.floor(
      jsnx.algorithms.cluster.triangles_and_degree_iter_(G, opt_nodes).next()[2] / 2
    );
  }

  var result = new jsnx.contrib.Map();
  goog.iter.forEach(
    jsnx.algorithms.cluster.triangles_and_degree_iter_(G, opt_nodes),
    function(val) {
      result.set(val[0], Math.floor(val[2]/2));
    }
  );
  return result;
};
goog.exportSymbol('jsnx.triangles', jsnx.algorithms.cluster.triangles);



/**
 * Return an iterator of (node, degree, triangles). 
 *
 * This double counts triangles so you may want to divide by 2.
 * See degree() and triangles() for definitions and details.
 *
 * @param {jsnx.classes.Graph} G A jsnetworkx graph
 * @param {jsnx.NodeContainer=} opt_nodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 *
 * @return {!goog.iter.Iterator}
 */
jsnx.algorithms.cluster.triangles_and_degree_iter_ = function(G, opt_nodes) {
  if (G.is_multigraph()) {
    throw new jsnx.exception.JSNetworkXError(
      'Not defined for multigraphs.'
    );
  }

  var nodes_nbrs;

  if(!goog.isDefAndNotNull(opt_nodes)) {
    nodes_nbrs = goog.iter.toIterator(G['adj']);
  }
  else {
    nodes_nbrs = jsnx.helper.nested_chain(G.nbunch_iter(opt_nodes), function(n) {
      return [n, G.get(n)];
    });
  }

  return goog.iter.map(nodes_nbrs, function(d) {
    var vs = new jsnx.contrib.Set(d[1].keys());
    var ntriangles = 0;

    vs.remove(d[0]);
    goog.iter.forEach(vs, function(w) {
      var ws = new jsnx.contrib.Set(G.get(w).keys());
      ws.remove(w);
      ntriangles += vs.intersection(ws).count();
    });
    return [d[0], vs.count(), ntriangles];
  });
};


/**
 * Return an iterator of (node, degree, weighted_triangles).
 *
 * Used for weighted clustering.
 *
 * @param {jsnx.classes.Graph} G A jsnetworkx graph
 * @param {jsnx.NodeContainer=} opt_nodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 * @param {string=} opt_weight (default: 'weight')
 *      The name of edge weight attribute.
 *
 * @return {!goog.iter.Iterator}
 *
 * @suppress {checkTypes}
 */
jsnx.algorithms.cluster.weighted_triangles_and_degree_iter_ = function(
  G,
  opt_nodes,
  opt_weight
) {
  if (G.is_multigraph()) {
    throw new jsnx.exception.JSNetworkXError(
      'Not defined for multigraphs.'
    );
  }

  if(!goog.isString(opt_weight)) {
    opt_weight = 'weight';
  }

  var max_weight, nodes_nbrs;
  if(G.number_of_edges() === 0) {
    max_weight = 1;
  }
  else {
    max_weight = jsnx.helper.max(G.edges(true), function(ed) {
      return goog.object.get(ed[2], /** @type {string} */ (opt_weight), 1);
    });
  }

  if(!goog.isDefAndNotNull(opt_nodes)) {
    nodes_nbrs = goog.iter.toIterator(G['adj']);
  }
  else {
    nodes_nbrs = jsnx.helper.nested_chain(G.nbunch_iter(opt_nodes), function(n) {
      return [n, G.get(n)];
    });
  }

  return goog.iter.map(nodes_nbrs, function(d) {
    var i = d[0];
    var inbrs = new jsnx.contrib.Set(d[1].keys());
    inbrs.remove(i);
    var weighted_triangles = 0;
    var seen = new jsnx.contrib.Set();

    goog.iter.forEach(inbrs, function(j) {
      var wij = goog.object.get(
        G.get(i).get(j),
        /** @type {string} */ (opt_weight),
        1
      ) / max_weight;
      seen.add(j);
      // this keeps from double counting
      var jnbrs = (new jsnx.contrib.Set(G.get(j).keys())).difference(seen);

      goog.iter.forEach(inbrs.intersection(jnbrs), function(k) {
        var wjk = goog.object.get(
          G.get(j).get(k),
          /** @type {string} */ (opt_weight),
          1
        ) / max_weight;
        var wki = goog.object.get(
          G.get(i).get(k),
          /** @type {string} */ (opt_weight),
          1
        ) / max_weight;
        weighted_triangles += Math.pow(wij * wjk * wki, 1/3);
      });
    });
    return [i, inbrs.count(), weighted_triangles * 2];
  });
};


/**
 * Compute the average clustering coefficient for the graph G.
 *
 * The clustering coefficient for the graph is the average.
 *
 * Notes
 * -----
 * This is a space saving routine; it might be faster
 * to use the clustering function to get a list and then take the average.
 *
 * Self loops are ignored.
 *
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {?(jsnx.NodeContainer|string|boolean)=} opt_nodes (default: all nodes)
 *      Compute average clustering for nodes in this container.
 * @param {?(string|boolean)=} opt_weight (default: null)
 *      The edge attribute that holds the numerical value used as a weight.
 *      If None, then each edge has weight 1.
 * @param {?boolean=} opt_count_zeros (default: true)
 *       If False include only the nodes with nonzero clustering in the average.
 *
 * @return {number}
 * @export
 */
jsnx.algorithms.cluster.average_clustering = function(
  G,
  opt_nodes,
  opt_weight, 
  opt_count_zeros
) {
  if(arguments.length === 2) {
    if(goog.isString(opt_nodes)) {
      opt_weight = /** @type {string} */ (opt_nodes);
      opt_nodes = null;
    }
    else if(goog.isBoolean(opt_nodes)) {
      opt_count_zeros = /** @type {boolean} */ (opt_nodes);
      opt_nodes = null;
    }
  }
  else if(arguments.length === 3) {
    if(goog.isBoolean(opt_weight)) {
      opt_count_zeros = /** @type {boolean} */ (opt_weight);
      opt_weight = null;
    }
  }

  if(!goog.isDefAndNotNull(opt_count_zeros)) {
    opt_count_zeros = true;
  }

  var c = /** @type {jsnx.contrib.Map} */ (jsnx.algorithms.cluster.clustering(
      G,
      /** @type {jsnx.NodeContainer}*/(opt_nodes),
      /** @type {string}*/ (opt_weight)
  )).values();

  if(!opt_count_zeros) {
    c = goog.array.filter(c, function(v) {
      return v > 0;
    });
  }
  return goog.math.sum.apply(goog.math, c) / c.length;
};
goog.exportSymbol('jsnx.average_clustering', jsnx.algorithms.cluster.average_clustering);


/**
 * Compute the clustering coefficient for nodes.
 *
 * For unweighted graphs the clustering of each node `u`
 * is the fraction of possible triangles that exist.
 *
 * For weighted graphs the clustering is defined
 * as the geometric average of the subgraph edge weights .
 *
 * Self loops are ignored.
 *
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {?jsnx.NodeContainer=} opt_nodes (default: all nodes)
 *      Compute average clustering for nodes in this container.
 * @param {?string=} opt_weight (default: null)
 *
 * @return {!(number|jsnx.contrib.Map)} Clustering coefficient at specified nodes
 * @export
 */
jsnx.algorithms.cluster.clustering = function(G, opt_nodes, opt_weight) {
  if (G.is_directed()) {
    throw new jsnx.exception.JSNetworkXError(
      'Clustering algorithms are not defined for directed graphs.'
    );
  }

  var td_iter;
  if(goog.isDefAndNotNull(opt_weight)) {
    td_iter = jsnx.algorithms.cluster.weighted_triangles_and_degree_iter_(
      G,
      opt_nodes,
      opt_weight
    );
  }
  else {
    td_iter = jsnx.algorithms.cluster.triangles_and_degree_iter_(G, opt_nodes);
  }

  var clusterc = new jsnx.contrib.Map();
  goog.iter.forEach(td_iter, function(d) {
    clusterc.set(d[0], d[2] === 0 ? 0 : (d[2] / (d[1] * (d[1] - 1))));
  });

  if (goog.isDefAndNotNull(opt_nodes) && G.has_node(opt_nodes)) {
    return /** @type {number} */ (clusterc.values()[0]);
  }
  return clusterc;
};
goog.exportSymbol('jsnx.clustering', jsnx.algorithms.cluster.clustering);


/**
 * Compute graph transitivity, the fraction of all possible triangles 
 * present in G.
 *
 * Possible triangles are identified by the number of "triads" 
 * (two edges with a shared vertex).
 *
 * The transitivity is
 *
 *      T = 3 * (#triangles/$triads)
 *
 * @param {jsnx.classes.Graph} G graph
 *
 * @return {number} Transitivity
 * @export
 */
jsnx.algorithms.cluster.transitivity = function(G) {
  var triangles = 0; // 6 times number of triangles
  var contri = 0;  // 2 times number of connected triples
  goog.iter.forEach(
    jsnx.algorithms.cluster.triangles_and_degree_iter_(G),
    function(d) {
      contri += d[1] * (d[1] - 1);
      triangles += d[2];
    }
  );
  return triangles === 0 ? 0 : triangles/contri;
};
goog.exportSymbol('jsnx.transitivity', jsnx.algorithms.cluster.transitivity);


/**
 * Compute the squares clustering coefficient for nodes.
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {jsnx.NodeContainer} opt_nodes (default: all)
 *      Compute clustering for nodes in this container.
 *
 * @return {!jsnx.contrib.Map} 
 *      A dictionary keyed by node with the square clustering coefficient value.
 * @export
 */
jsnx.algorithms.cluster.square_clustering = function(G, opt_nodes) {
  var nodes_iter = !goog.isDefAndNotNull(opt_nodes) ? 
    jsnx.helper.iter(G) : G.nbunch_iter(opt_nodes);
  var clustering = new jsnx.contrib.Map();

  goog.iter.forEach(nodes_iter, function(v) {
    clustering.set(v, 0);
    var potential = 0;

    goog.iter.forEach(
      jsnx.helper.combinations(G.get(v).keys(), 2), 
      function(d) {
        var u = d[0], w = d[1];
        var squares = (new jsnx.contrib.Set(G.get(u).keys()))
          .intersection(G.get(w).keys());
        squares.remove(v);
        squares = squares.count();

        clustering.set(v, clustering.get(v) + squares);
        var degm = squares + 1;
        if(G.get(u).has(w)) {
          degm += 1;
        }
        potential += (G.get(u).count() - degm) *
          (G.get(w).count() - degm) +
            squares;
      });
      if(potential > 0) {
        clustering.set(v, /**@type {number}*/(clustering.get(v)) / potential);
      }
  });
  if (goog.isDefAndNotNull(opt_nodes) && G.has_node(opt_nodes)) {
    return clustering.values()[0]; // return single value
  }
  return clustering;
}; 
goog.exportSymbol('jsnx.square_clustering', jsnx.algorithms.cluster.square_clustering);
