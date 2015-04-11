'use strict';

import JSNetworkXError from '../exceptions/JSNetworkXError';

import {emptyGraph} from './classic';
import {forEach} from '../_internals';

/**
 * Return a small undirected graph described by `graphDescription`.
 *
 * @see makeSmallGraph.
 *
 * @param {Array} graphDescription
 *    Description of the graph to create in the form `{type, name, n, list}`.
 * @param {Graph=}
 *    optCreateUsing Graph instance to empty and add nodes to.
 * @return {Graph}
 */
export function makeSmallUndirectedGraph(graphDescription, optCreateUsing) {
  if (optCreateUsing != null && optCreateUsing.isDirected()) {
    throw new JSNetworkXError('Directed Graph not supported');
  }
  return makeSmallGraph(graphDescription, optCreateUsing);
}

/**
 * Return the small graph described by graph_description.
 *
 * `graphDescription` is a list of the form `{type, name, n, list}`.
 *
 * Here `ltype` is one of `"adjacencylist"` or `"edgelist"`,
 * `name` is the name of the graph and `n` the number of nodes.
 * This constructs a graph of `n` nodes with integer labels 0,..,n-1.
 *
 * If `ltype="adjacencylist"` then `xlist` is an adjacency list
 * with exactly `n` entries, in with the `j`'th entry (which can be empty)
 * specifies the nodes connected to vertex `j`.
 *
 * E.g. the "square" graph `$C_4$` can be obtained by
 *
 * ```
 * var G = makeSmallGraph({
 *   type: "adjacencylist",
 *   name: "C_4",
 *   n: 4,
 *   list: [[2,4],[1,3],[2,4],[1,3]]
 * });
 * ```
 *
 * or, since we do not need to add edges twice,
 *
 * ```
 * var G = makeSmallGraph({
 *   type: "adjacencylist",
 *   name: "C_4",
 *   n: 4,
 *   list: [[2,4],[3],[4],[]]]
 * });
 * ```
 *
 * If `ltype="edgelist"` then `xlist` is an edge list written as
 * `[[v1,w2],[v2,w2],...,[vk,wk]]`, where `vj` and `wj` integers in the range
 * 1,..,n
 *
 * E.g. the "square" graph `$C_4$` can be obtained by
 *
 * ```
 * var G = makeSmallGraph({
 *   type: "edgelist",
 *   name: "C_4",
 *   n: 4,
 *   list: [[1,2],[3,4],[2,3],[4,1]]]
 * });
 * ```
 *
 * Use the `optCreateUsing` argument to choose the graph class/type.
 *
 * @param {Array} graphDescription
 *    Description of the graph to create in the form `{type, name, n, list}`.
 * @param {Graph=} optCreateUsing Graph instance to empty and add nodes to.
 * @return {Graph}
 */
export function makeSmallGraph({type, name, n, list}, optCreateUsing) {
  var G = emptyGraph(n, optCreateUsing);
  var nodes = G.nodes();

  if (type === 'adjacencylist') {
    if (list.length !== n) {
      throw new JSNetworkXError('invalid graphDescription');
    }
    nodes.forEach(v => {
      forEach(list[v], u => G.addEdge(u - 1, v));
    });
  }
  else if (type === 'edgelist') {
    forEach(list, ([v, u]) => {
      v -= 1;
      u -= 1;
      if (v < 0 || v > n - 1 || u < 0 || u > n - 1) {
        throw new JSNetworkXError('invalid graphDescription');
      } else {
        G.addEdge(v, u);
      }
    });
  }
  G.name = name;
  return G;
}

// TODO: LCF_graph

/**
 * Return the Bull graph.
 *
 * @param {Graph=} optCreateUsing  Graph instance to empty and add nodes to.
 * @return {Graph}
 */
export function bullGraph(optCreateUsing) {
  var type = 'adjacencylist';
  var name = 'Bull Graph';
  var n = 5;
  var list = [[2, 3], [1, 3, 4], [1, 2, 5], [2], [3]];

  return makeSmallUndirectedGraph({type, name, n, list}, optCreateUsing);
}

// TODO: chvatal_graph
// TODO: cubical_graph
// TODO: desargues_graph
// TODO: diamond_graph
// TODO: dodecahedral_graph
// TODO: frucht_graph
// TODO: heawood_graph
// TODO: house_graph
// TODO: house_x_graph
// TODO: icosahedral_graph


/**
 * Return the Krackhardt Kite Social Network.
 *
 * A 10 actor social network introduced by David Krackhardt
 * to illustrate: degree, betweenness, centrality, closeness, etc.
 * The traditional labeling is:
 * Andre=1, Beverley=2, Carol=3, Diane=4,
 * Ed=5, Fernando=6, Garth=7, Heather=8, Ike=9, Jane=10.
 *
 * @param {Graph=} opt_create_using Graph instance to empty and add nodes to.
 * @return {Graph}
 */
export function krackhardtKiteGraph(optCreateUsing) {
  var type = 'adjacencylist';
  var name = 'Krackhardt Kite Social Network';
  var n = 10;
  var list = [
    [2, 3, 4, 6],
    [1, 4, 5, 7],
    [1, 4, 6],
    [1, 2, 3, 5, 6, 7],
    [2, 4, 7],
    [1, 3, 4, 7, 8],
    [2, 4, 5, 6, 8],
    [6, 7, 9],
    [8, 10],
    [9]
  ];

  return makeSmallUndirectedGraph({type, name, n, list}, optCreateUsing);
}

// TODO: moebius_kantor_graph
// TODO: octahedral_graph
// TODO: pappus_graph
// TODO: petersen_graph
// TODO: sedgewick_maze_graph
// TODO: tetrahedral_graph
// TODO: truncated_cube_graph
// TODO: truncated_tetrahedron_graph
// TODO: tutte_graph
