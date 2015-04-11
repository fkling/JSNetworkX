/*eslint max-len:[1, 94]*/
'use strict';

import {
/*jshint ignore:start*/
  Map,
  Set,
/*jshint ignore:end*/

  mapIterator,
  max,
  tuple2
} from '../_internals';

/**
 * @fileoverview
 * Find and manipulate cliques of graphs.
 *
 * Note that finding the largest clique of a graph has been
 * shown to be an NP-complete problem; the algorithms here
 * could take a long time to run.
 *
 * http://en.wikipedia.org/wiki/Clique_problem
 */

// TODO: enumerate_all_cliques


/**
 * Search for all maximal cliques in a graph.
 *
 * Maximal cliques are the largest complete subgraph containing
 * a given node.  The largest maximal clique is sometimes called
 * the maximum clique.
 *
 *
 * ### Notes
 *
 * Based on the algorithm published by Bron & Kerbosch (1973) ([1][])
 * as adapted by Tomita, Tanaka and Takahashi (2006) ([2][])
 * and discussed in Cazals and Karande (2008) ([3][]).
 *
 * This algorithm ignores self-loops and parallel edges as
 * clique is not conventionally defined with such edges.
 *
 * There are often many cliques in graphs.  This algorithm can
 * run out of memory for large graphs.
 *
 * ### References
 *
 * [1] [Bron, C. and Kerbosch, J. 1973.
 *    Algorithm 457: finding all cliques of an undirected graph.
 *    Commun. ACM 16, 9 (Sep. 1973), 575-577.][1]
 * [1]: http://portal.acm.org/citation.cfm?doid=362342.362367
 *
 * [2] [Etsuji Tomita, Akira Tanaka, Haruhisa Takahashi,
 *    The worst-case time complexity for generating all maximal
 *    cliques and computational experiments,
 *    Theoretical Computer Science, Volume 363, Issue 1,
 *    Computing and Combinatorics,
 *    10th Annual International Conference on
 *    Computing and Combinatorics (COCOON 2004), 25 October 2006,
 *    Pages 28-42][2]
 * [2]: http://dx.doi.org/10.1016/j.tcs.2006.06.015
 *
 * [3] [F. Cazals, C. Karande,
 *    A note on the problem of reporting maximal cliques,
 *    Theoretical Computer Science,
 *    Volume 407, Issues 1-3, 6 November 2008, Pages 564-568][3]
 * [3]: http://dx.doi.org/10.1016/j.tcs.2008.05.010
 *
 * @see findCliquesRecursive
 *
 * @param {Graph} G
 * @return {Iterator<Array<Node>>} Iterator over member lists for each maximal
 *  clique
 */
export async function* findCliques(G) { // eslint-disable-line no-unused-expressions
  if (G.numberOfNodes() === 0) {
    return [];
  }

  var adj = new Map(mapIterator(G, u => {
    var neighbors = new Set(G.neighborsIter(u));
    neighbors.delete(u);
    return tuple2(u, neighbors);
  }));

  var subgraph = new Set(G);
  var candidates = new Set(G);
  var Q = [null];

  var u = max(subgraph, u => candidates.intersection(adj.get(u)).size);
  var extU = candidates.difference(adj.get(u));
  var stack = [];

  while (true) {
    if (extU.size > 0) {
      var q = extU.pop();
      candidates.delete(q);
      Q[Q.length - 1] = q;
      var adjQ = adj.get(q);
      var subgraphQ = subgraph.intersection(adjQ);
      if (subgraphQ.size === 0) {
        yield Q.slice();
      }
      else {
        var candidatesQ = candidates.intersection(adjQ);
        if (candidatesQ.size > 0) {
          stack.push([subgraph, candidates, extU]);
          Q.push(null);
          subgraph = subgraphQ;
          candidates = candidatesQ;
          /* eslint-disable no-loop-func*/
          u = max(subgraph, u => candidates.intersection(adj.get(u)).size);
          /* eslint-enable no-loop-func*/
          extU = candidates.difference(adj.get(u));
        }
      }
    }
    else {
      if (Q.length === 0 || stack.length === 0) {
        break;
      }
      Q.pop();
      [subgraph, candidates, extU] = stack.pop();
    }
  }
};

/**
 * Recursive search for all maximal cliques in a graph.
 *
 * Maximal cliques are the largest complete subgraph containing
 * a given point.  The largest maximal clique is sometimes called
 * the maximum clique.
 *
 * ### Notes
 *
 * Based on the algorithm published by Bron & Kerbosch (1973) ([1][])
 * as adapted by Tomita, Tanaka and Takahashi (2006) ([2][])
 * and discussed in Cazals and Karande (2008) ([3][]).
 *
 * This algorithm ignores self-loops and parallel edges as
 * clique is not conventionally defined with such edges.
 *
 *
 * ### References
 *
 * [1] [Bron, C. and Kerbosch, J. 1973.
 *    Algorithm 457: finding all cliques of an undirected graph.
 *    Commun. ACM 16, 9 (Sep. 1973), 575-577.][1]
 * [1]: http://portal.acm.org/citation.cfm?doid=362342.362367
 *
 * [2] [Etsuji Tomita, Akira Tanaka, Haruhisa Takahashi,
 *    The worst-case time complexity for generating all maximal
 *    cliques and computational experiments,
 *    Theoretical Computer Science, Volume 363, Issue 1,
 *    Computing and Combinatorics,
 *    10th Annual International Conference on
 *    Computing and Combinatorics (COCOON 2004), 25 October 2006, Pages 28-42][2]
 * [2]: http://dx.doi.org/10.1016/j.tcs.2006.06.015
 *
 * [3] [F. Cazals, C. Karande,
 *    A note on the problem of reporting maximal cliques,
 *    Theoretical Computer Science,
 *    Volume 407, Issues 1-3, 6 November 2008, Pages 564-568][3]
 * [3]: http://dx.doi.org/10.1016/j.tcs.2008.05.010
 *
 * @param {Graph} G
 * @return {!Iterator<Array<Node>>} List of members in each maximal clique
 *
 * @see find_cliques
 */
export async function* findCliquesRecursive(G) { // eslint-disable-line no-unused-expressions
  if (G.size === 0) {
    yield [];
  }

  var adj = new Map(mapIterator(G, u => {
    var neighbors = new Set(G.neighborsIter(u));
    neighbors.delete(u);
    return tuple2(u, neighbors);
  }));
  var Q = [];

  function* expand(subgraph, candidates) {
    var u = max(subgraph, u => candidates.intersection(adj.get(u)).size);
    for (var q of candidates.difference(adj.get(u))) {
      candidates.delete(q);
      Q.push(q);
      var adjQ = adj.get(q);
      var subgraphQ = subgraph.intersection(adjQ);
      if (subgraphQ.size === 0) {
        yield Q.slice();
      }
      else {
        var candidatesQ = candidates.intersection(adjQ);
        if (candidatesQ.size > 0) {
          yield* expand(subgraphQ, candidatesQ);
        }
      }
      Q.pop();
    }
  }

  yield* expand(new Set(G), new Set(G));
};

//TODO: make_max_clique_graph
//TODO: make_clique_bipartite
//TODO: project_down
//TODO: project_up

/**
 * Return the clique number (size of the largest clique) for G.
 *
 * An optional list of cliques can be input if already computed.
 *
 * @param {Graph} G graph
 * @param {Iterable=} optCliques
 * @return {number}
 */
export async function graphCliqueNumber(G, optCliques) {
  if (optCliques == null) {
    optCliques = await findCliques(G); // eslint-disable-line no-undef
  }
  return max(optCliques, c => c.length).length;
}

/**
 * Returns the number of maximal cliques in G.
 *
 * An optional list of cliques can be input if already computed.
 *
 * @param {Graph} G graph
 * @param {Iterable=} optCliques
 * @return {number}
 */
export async function graphNumberOfCliques(G, optCliques) {
  if (optCliques == null) {
    optCliques = await findCliques(G); // eslint-disable-line no-undef
  }
  return Array.from(optCliques).length;
}

//TODO: node_clique_number


/**
 * Returns the number of maximal cliques for each node.
 *
 * Returns a single or list depending on input nodes.
 * Optional list of cliques can be input if already computed.
 *
 * @param {Graph} G graph
 * @param {Iterable=} optNodes List of nodes
 * @param {Iterable=} optCliques List of cliques
 * @return {!(Map|number)}
 */
export async function numberOfCliques(G, optNodes, optCliques) {
  optCliques = Array.from(optCliques || await findCliques(G)); // eslint-disable-line no-undef

  if (optNodes == null) {
    optNodes = G.nodes(); // none, get entire graph
  }

  var numcliq;
  if (!Array.isArray(optNodes)) {
    var v = optNodes;
    numcliq = optCliques.filter(c => (new Set(c)).has(v)).length;
  }
  else {
    optCliques = optCliques.map(c => new Set(c));
    numcliq = new Map();
    optNodes.forEach(v => {
      numcliq.set(v, optCliques.filter(c => c.has(v)).length);
    });
  }
  return numcliq;
}

//TODO: cliques_containing_node
