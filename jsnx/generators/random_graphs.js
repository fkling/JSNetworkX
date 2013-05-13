"use strict";
goog.provide('jsnx.generators.random_graphs');

goog.require('goog.iter');
goog.require('jsnx.generators.classic');
goog.require('jsnx.classes.Graph');
goog.require('jsnx.classes.DiGraph');
goog.require('jsnx.helper');


//-------------------------------------------------------------------------
//  Some Famous Random Graphs
//-------------------------------------------------------------------------


/**
 * Return a random graph G_{n,p} (Erdős-Rényi graph, binomial graph).
 *
 * Notes: The seed parameter does not exist since JavaScript does not provide
 * a way to set the seed.
 *
 * The G_{n,p} graph algorithm chooses each of the [n(n-1)]/2
 * (undirected) or n(n-1) (directed) possible edges with probability p.
 *
 * This algorithm is O(n+m) where m is the expected number of
 * edges m=p*n*(n-1)/2.
 *   
 * It should be faster than gnp_random_graph when p is small and
 * the expected number of edges is small (sparse graph).
 *
 *
 * @param {number} n The number of nodes
 * @param {number} p Probability for edge creation
 * @param {boolean} opt_directed (default=False) If True return a directed graph
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.random_graphs.fast_gnp_random_graph = function(
  n,
  p,
  opt_directed
) {
  if(!goog.isDefAndNotNull(opt_directed)) {
    opt_directed = false;
  }
  var G = jsnx.generators.classic.empty_graph(n);
  G.name('fast_gnp_random_graph(' + n + ',' + p  + ')');

  if(p <= 0 || p >= 1) {
    return jsnx.generators.random_graphs.gnp_random_graph(n, p, opt_directed);
  }
  var v = 1; // Nodes in graph are from 0, n-1 (this is the second node index).
  var w = -1;
  var lp = Math.log(1 - p);
  var lr;

  if(opt_directed) {
    G = new jsnx.classes.DiGraph(G);
    while(v < n) {
      lr = Math.log(1 - Math.random());
      w = w + 1 + Math.floor(lr/lp);
      if(v === w) { // avoid self loops
        w = w + 1;
      }
      while(w >= n && v < n) {
        w = w - n;
        v = v + 1;
        if(v == w) { // avoid self loops
          w = w + 1;
        }
      }
      if(v < n) {
        G.add_edge(v, w);
      }
    }
  }
  else {
    while(v < n) {
      lr = Math.log(1 - Math.random());
      w = w + 1 + Math.floor(lr/lp);
      while(w >= v && v < n) {
        w = w - v;
        v = v + 1;
      }
      if(v < n) {
        G.add_edge(v, w);
      }
    }
  }
  return G;
};
goog.exportSymbol('jsnx.fast_gnp_random_graph', jsnx.generators.random_graphs.fast_gnp_random_graph);


/**
 * Return a random graph G_{n,p} (Erdős-Rényi graph, binomial graph).
 *
 * Chooses each of the possible edges with probability p.
 *
 * This is also called binomial_graph and erdos_renyi_graph.
 *
 * Notes: The seed parameter does not exist since JavaScript does not provide
 * a way to set the seed.
 *
 * This is an O(n^2) algorithm.  For sparse graphs (small p) see
 * fast_gnp_random_graph for a faster algorithm.
 *
 * @param {number} n The number of nodes
 * @param {number} p Probability for edge creation
 * @param {boolean} opt_directed (default=False) If True return a directed graph
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.random_graphs.gnp_random_graph = function(n, p, opt_directed) {
  var G, edges;

  if(opt_directed) {
    G = new jsnx.classes.DiGraph();
  }
  else {
    G = new jsnx.classes.Graph();
  }
  G.add_nodes_from(jsnx.helper.range(n));
  G.name('gnp_random_graph(' + n + ',' + p  + ')');
  if(p <= 0) {
    return G;
  }
  if(p >= 1) {
    return jsnx.generators.classic.complete_graph(n, /*create_using=*/G);
  }

  if(G.is_directed()) {
    edges = jsnx.helper.permutations(jsnx.helper.range(n), 2);
  }
  else {
    edges = jsnx.helper.combinations(jsnx.helper.range(n), 2);
  }

  goog.iter.forEach(edges, function(e) {
    if(Math.random() < p) {
      G.add_edge(e[0], e[1]);
    }
  });
  return G;
};
goog.exportSymbol(
  'jsnx.gnp_random_graph',
  jsnx.generators.random_graphs.gnp_random_graph
);
goog.exportSymbol(
  'jsnx.binomial_graph',
  jsnx.generators.random_graphs.gnp_random_graph
);
goog.exportSymbol(
  'jsnx.erdos_renyi_graph',
  jsnx.generators.random_graphs.gnp_random_graph
);

//TODO: newman_watts_strogatz_graph
//TODO: watts_strogatz_graph
//TODO: connected_watts_strogatz_graph
//TODO: random_regular_graph
//TODO: _random_subset
//TODO: barabasi_albert_graph
//TODO: powerlaw_cluster_graph
//TODO: random_lobster
//TODO: random_shell_graph
//TODO: random_powerlaw_tree
//TODO: random_powerlaw_tree_sequence
