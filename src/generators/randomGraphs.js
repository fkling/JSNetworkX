'use strict';

import DiGraph from '../classes/DiGraph';
import Graph from '../classes/Graph';

import {
  completeGraph,
  emptyGraph
} from './classic';

import {
  genCombinations,
  genPermutations,
  range,
  sprintf
} from '../_internals';

//
//-------------------------------------------------------------------------
//  Some Famous Random Graphs
//-------------------------------------------------------------------------


/**
 * Return a random graph `$G_{n,p}$` (Erdős-Rényi graph, binomial graph).
 *
 * The `$G_{n,p}$` graph algorithm chooses each of the `$[n(n-1)]/2$`
 * (undirected) or `$n(n-1)$` (directed) possible edges with probability `$p$`.
 *
 * This algorithm is `$O(n+m)$` where `$m$` is the expected number of
 * edges `$m = p*n*(n-1)/2$`.
 *
 * It should be faster than `gnpRandomGraph` when `p` is small and
 * the expected number of edges is small (sparse graph).
 *
 * ### References
 *
 * [1] Vladimir Batagelj and Ulrik Brandes,
 *     "Efficient generation of large random networks",
 *     Phys. Rev. E, 71, 036113, 2005.
 *
 * @param {number} n The number of nodes
 * @param {number} p Probability for edge creation
 * @param {boolean} optDirected If true return a directed graph
 * @return {Graph}
 */
export async function fastGnpRandomGraph(n, p, optDirected=false) {
  var G = emptyGraph(n);
  G.name = sprintf('fastGnpRandomGraph(%s, %s)', n, p);

  if (p <= 0 || p >= 1) {
    return gnpRandomGraph(n, p, optDirected);
  }
  var v;
  var w = -1;
  var lp = Math.log(1 - p);
  var lr;

  if (optDirected) {
    // Nodes in graph are from 0,n-1 (start with v as the first node index).
    v = 0;
    G = new DiGraph(G);
    while (v < n) {
      lr = Math.log(1 - Math.random());
      w = w + 1 + Math.floor(lr / lp);
      if (v === w) { // avoid self loops
        w = w + 1;
      }
      while (w >= n && v < n) {
        w = w - n;
        v = v + 1;
        if (v === w) { // avoid self loops
          w = w + 1;
        }
      }
      if (v < n) {
        G.addEdge(v, w);
      }
    }
  }
  else {
    v = 1; // Nodes in graph are from 0, n-1 (this is the second node index).
    while (v < n) {
      lr = Math.log(1 - Math.random());
      w = w + 1 + Math.floor(lr / lp);
      while (w >= v && v < n) {
        w = w - v;
        v = v + 1;
      }
      if (v < n) {
        G.addEdge(v, w);
      }
    }
  }
  return G;
}


/**
 * Return a random graph `$G_{n,p}$` (Erdős-Rényi graph, binomial graph).
 *
 * Chooses each of the possible edges with probability `p.
 *
 * This is also called `binomialGraph` and `erdosRenyiGraph`.
 *
 * This is an `$O(n^2)$` algorithm.  For sparse graphs (small `$p$`) see
 * `fastGnpRandomGraph for a faster algorithm.
 *
 * @param {number} n The number of nodes
 * @param {number} p Probability for edge creation
 * @param {boolean} optDirected
 *  If true returns a directed graph
 * @return {Graph}
 */
export async function gnpRandomGraph(n, p, optDirected=false) {
  var G = optDirected ? new DiGraph() : new Graph();
  var edges;
  var rangeN = range(n);

  G.addNodesFrom(rangeN);
  G.name = sprintf('gnpRandomGraph(%s, %s)', n, p);
  if(p <= 0) {
    return G;
  }
  if(p >= 1) {
    return completeGraph(n, G);
  }

  edges = G.isDirected() ?
    genPermutations(rangeN, 2) :
    genCombinations(rangeN, 2);

  for (var edge of edges) {
    if(Math.random() < p) {
      G.addEdge(edge[0], edge[1]);
    }
  }
  return G;
}

/**
 * @alias gnpRandomGraph
 */
export async function binomialGraph(n, p, optDirected) {
  return await gnpRandomGraph(n, p, optDirected);
}

/**
 * @alias gnpRandomGraph
 */
export async function erdosRenyiGraph(n, p, optDirected) {
  return await gnpRandomGraph(n, p, optDirected);
}

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
