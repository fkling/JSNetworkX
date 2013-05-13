/*jshint loopfunc:true*/
"use strict";
goog.provide('jsnx.algorithms.dag');

goog.require('goog.array');
goog.require('goog.object');
goog.require('jsnx.contrib.Map');
goog.require('jsnx.contrib.Set');
goog.require('jsnx.exception');

/**
 * Return true if the graph G is a directed acyclic graph (DAG) or false if not.
 *
 * @param {jsnx.classes.Graph} G A graph
 *
 * @return {boolean} true of G is a DAG, false otherwise
 * @export
 */
jsnx.algorithms.dag.is_directed_acyclic_graph = function(G) {
  try {
    jsnx.algorithms.dag.topological_sort(G);
    return true;
  }
  catch(ex) {
    if (ex instanceof jsnx.exception.JSNetworkXUnfeasible) {
      return false;
    }
    throw ex;
  }
};
goog.exportSymbol(
  'jsnx.is_directed_acyclic_graph',
  jsnx.algorithms.dag.is_directed_acyclic_graph
);


/**
 * Return a list of nodes in topological sort order.
 *
 * A topological sort is a nonunique permutation of the nodes such that an edge
 * from u to v implies that u appears before v in the topological sort order.
 * 
 * @see #is_directed_acyclic_graph
 *
 * @param {jsnx.classes.Graph} G A directed Graph
 * @param {jsnx.NodeContainer=} opt_nbunch Explore graph in spcified order given
 *    in opt_nbunch.
 *
 * @return {!Array}
 *
 * @export
 */
jsnx.algorithms.dag.topological_sort = function(G, opt_nbunch) {
  if (!G.is_directed()) {
    throw new jsnx.exception.JSNetworkXError(
      'Topological sort not defined on undirected graphs.'
    );
  }

  // nonrecursive version
  var seen = new jsnx.contrib.Set();
  var order_explored = []; // provide order and
  // fast search without more general priorityDictionary
  var explored = new jsnx.contrib.Set(); 

  if (!goog.isDefAndNotNull(opt_nbunch)) {
    opt_nbunch = G.nodes_iter();
  }

  jsnx.helper.forEach(opt_nbunch, function(v) { // process all vertices in G
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
      G.get(w).forEach(function(n) {
        if (!explored.has(n)) {
          if (seen.has(n)) { // CYCLE !!
            throw new jsnx.exception.JSNetworkXUnfeasible('Graph contains a cycle');
          }
          new_nodes.push(n);
        }
      });
      if (new_nodes.length > 0) { // add new nodes to fringe
        fringe.push.apply(fringe, new_nodes);
      }
      else {
        explored.add(w);
        goog.array.insertAt(order_explored, w);
      }
    }
  });

  return order_explored;
};
goog.exportSymbol(
  'jsnx.topological_sort',
  jsnx.algorithms.dag.topological_sort
);


/**
 * Return a list of nodes in topological sort order.
 *
 * A topological sort is a nonunique permutation of the nodes such that an edge
 * from u to v implies that u appears before v in the topological sort order.
 * 
 * @see #topological_sort
 * @see #is_directed_acyclic_graph
 *
 * @param {jsnx.classes.Graph} G A directed Graph
 * @param {jsnx.NodeContainer=} opt_nbunch Explore graph in spcified order given
 *    in opt_nbunch.
 *
 * @return {!Array}
 *
 * @export
 */
jsnx.algorithms.dag.topological_sort_recursive = function(G, opt_nbunch) {
  if (!G.is_directed()) {
    throw new jsnx.exception.JSNetworkXError(
      'Topological sort not defined on undirected graphs.'
    );
  }

  // function for recursive dfs
  /**
   * @param {jsnx.classes.Graph} G graph
   * @param {jsnx.contrib.Set} seen
   * @param {Array} explored
   * @param {string} v
   *
   * @return {boolean}
   */
  function _dfs(G, seen, explored, v) {
    seen.add(v);
    G.get(v).forEach(function(w) {
      if (!seen.has(w)) {
        if (!_dfs(G, seen, explored, w)) {
          return false;
        }
      }
      else if (seen.has(w) && !goog.array.contains(explored, w)) {
        throw new jsnx.exception.JSNetworkXUnfeasible('Graph contains a cycle');
      }
    });
    goog.array.insertAt(explored, v);
    return true;
  }

  var seen = new jsnx.contrib.Set();
  var explored = [];

  if (!goog.isDefAndNotNull(opt_nbunch)) {
    opt_nbunch = G.nodes_iter();
  }

  jsnx.helper.forEach(opt_nbunch, function(v) {
    if (!goog.array.contains(explored, v)) {
      if (!_dfs(G, seen, explored, v)) {
        throw new jsnx.exception.JSNetworkXUnfeasible('Graph contains a cycle');
      }
    }
  });

  return explored;
};
goog.exportSymbol(
  'jsnx.topological_sort_recursive',
  jsnx.algorithms.dag.topological_sort_recursive
);


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
jsnx.algorithms.dag.is_aperiodic = function is_aperiodic(G) {
  if (!G.is_directed()) {
    throw new jsnx.exception.JSNetworkXError(
      'is_aperiodic not defined for undirected graphs.'
    );
  }

  var s = G.nodes_iter().next();
  var levels = new jsnx.contrib.Map();
  levels.set(s, 0);
  var this_level = [s];
  var g = 0;
  var l = 1;

  while (this_level.length > 0) {
    var next_level = [];
    goog.array.forEach(this_level, function(u) {
      G.get(u).forEach(function(v) {
        if (levels.has(v)) { // non-tree edge
          g = jsnx.helper.gcd(
            g,
            /**@type {number}*/(levels.get(u)) -
              /**@type {number}*/(levels.get(v)) + 1
          );
        }
        else { // tree edge
          next_level.push(v);
          levels.set(v, l);
        }
      });
    });
    this_level = next_level;
    l += 1;
  }

  if (levels.count() === jsnx.helper.len(G)) {
    return g === 1;
  }
  return g === 1 && is_aperiodic(
    G.subgraph(
      (new jsnx.contrib.Set(G.nodes())).difference(levels.keys())
    )
  );
};
goog.exportSymbol(
  'jsnx.is_aperiodic',
  jsnx.algorithms.dag.is_aperiodic
);
