"use strict";

var JSNetworkXError = require('../exceptions/JSNetworkXError');
var JSNetworkXUnfeasible = require('../exceptions/JSNetworkXUnfeasible');
/*jshint ignore:start*/
var Map = require('../_internals/Map');
var Set = require('../_internals/Set');
/*jshint ignore:end*/

var forEach = require('../_internals/forEach');
var gcd = require('../_internals/gcd');
var setDifference = require('../_internals/sets/difference');

/**
 * Return true if the graph G is a directed acyclic graph (DAG) or false if not.
 *
 * @param {Graph} G A graph
 * @return {boolean} true of G is a DAG, false otherwise
 * @export
 */
async function is_directed_acyclic_graph(G) {
  try {
    topological_sort(G);
    return true;
  }
  catch(ex) {
    if (ex instanceof JSNetworkXUnfeasible) {
      return false;
    }
    throw ex;
  }
}

/**
 * Return a list of nodes in topological sort order.
 *
 * A topological sort is a non-unique permutation of the nodes such that an edge
 * from u to v implies that u appears before v in the topological sort order.
 *
 * @see #is_directed_acyclic_graph
 *
 * @param {Graph} G A directed Graph
 * @param {NodeContainer=} opt_nbunch Explore graph in specified order given
 *    in opt_nbunch.
 *
 * @return {!Array}
 *
 * @export
 */
async function topological_sort(G, opt_nbunch) {
  if (!G.is_directed()) {
    throw new JSNetworkXError(
      'Topological sort not defined on undirected graphs.'
    );
  }

  // nonrecursive version
  var seen = new Set();
  var order_explored = []; // provide order and
  // fast search without more general priorityDictionary
  var explored = new Set();

  if (opt_nbunch == null) {
    opt_nbunch = G.nodes_iter();
  }

  forEach(opt_nbunch, function(v) { // process all vertices in G
    if (explored.has(v)) {
      return; // continue
    }

    var fringe = [v]; // nodes yet to look at
    while (fringe.length > 0) {
      var w = fringe[fringe.length - 1]; // depth first search
      if (explored.has(w)) { // already looked down this branch
        fringe.pop();
        continue;
      }
      seen.add(w); // mark as seen
      // Check successors for cycles for new nodes
      var new_nodes = [];
      /*jshint loopfunc:true*/
      G.get(w).forEach(function(_, n) {
        if (!explored.has(n)) {
          if (seen.has(n)) { // CYCLE !!
            throw new JSNetworkXUnfeasible('Graph contains a cycle.');
          }
          new_nodes.push(n);
        }
      });
      if (new_nodes.length > 0) { // add new nodes to fringe
        fringe.push.apply(fringe, new_nodes);
      }
      else {
        explored.add(w);
        order_explored.unshift(w);
      }
    }
  });

  return order_explored;
}

/**
 * Return a list of nodes in topological sort order.
 *
 * A topological sort is a non-unique permutation of the nodes such that an edge
 * from u to v implies that u appears before v in the topological sort order.
 *
 * @see #topological_sort
 * @see #is_directed_acyclic_graph
 *
 * @param {Graph} G A directed Graph
 * @param {NodeContainer=} opt_nbunch Explore graph in spcified order given
 *    in opt_nbunch.
 * @return {!Array}
 *
 * @export
 */
async function topological_sort_recursive(G, opt_nbunch) {
  if (!G.is_directed()) {
    throw new JSNetworkXError(
      'Topological sort not defined on undirected graphs.'
    );
  }

  // function for recursive dfs
  /**
   * @param {Graph} G graph
   * @param {Set} seen
   * @param {Array} explored
   * @param {string} v
   * @return {boolean}
   */
  function _dfs(G, seen, explored, v) {
    seen.add(v);
    G.get(v).forEach(function(_, w) {
      if (!seen.has(w)) {
        if (!_dfs(G, seen, explored, w)) {
          return false;
        }
      }
      else if (seen.has(w) && explored.indexOf(w) === -1) {
        throw new JSNetworkXUnfeasible('Graph contains a cycle.');
      }
    });
    explored.unshift(v);
    return true;
  }

  var seen = new Set();
  var explored = [];

  if (opt_nbunch == null) {
    opt_nbunch = G.nodes_iter();
  }

  forEach(opt_nbunch, function(v) {
    if (explored.indexOf(v) === -1) {
      if (!_dfs(G, seen, explored, v)) {
        throw new JSNetworkXUnfeasible('Graph contains a cycle.');
      }
    }
  });

  return explored;
}

/**
 * Return true if G is aperiodic.
 *
 * A directed graph is aperiodic if there is no integer k > 1 that
 * divides the length of every cycle in the graph.
 *
 * @param {jsnx.classes.Graph} G
 *
 * @return {boolean} true if the graph is aperiodic false otherwise
 * @export
 */
async function is_aperiodic(G) {
  if (!G.is_directed()) {
    throw new JSNetworkXError(
      'is_aperiodic not defined for undirected graphs.'
    );
  }

  var next = G.nodes_iter().next();
  if (next.done) {
    return true;
  }
  var levels = new Map();
  levels.set(next.value, 0);
  var this_level = [next.value];
  var g = 0;
  var l = 1;

  while (this_level.length > 0) {
    var next_level = [];
    for (var i = 0; i < this_level.length; i++) {
      var u = this_level[i];
      /*jshint loopfunc:true*/
      G.get(u).forEach(function(_, v) {
        if (levels.has(v)) { // non-tree edge
          g = gcd(g, levels.get(u) - levels.get(v) + 1);
        }
        else { // tree edge
          next_level.push(v);
          levels.set(v, l);
        }
      });
    }
    this_level = next_level;
    l += 1;
  }

  if (levels.size === G.number_of_nodes()) {
    return g === 1;
  }
  return g === 1 && is_aperiodic(
    G.subgraph(setDifference(new Set(G.nodes()), new Set(levels.keys())))
  );
}

module.exports = {
  is_directed_acyclic_graph,
  topological_sort,
  topological_sort_recursive,
  is_aperiodic,
};
