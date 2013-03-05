/*jshint loopfunc:true*/
"use strict";
goog.provide('jsnx.algorithms.dag');

goog.require('jsnx.exception');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.structs.Set');

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
  var seen = {};
  var order_explored = []; // provide order and
  var explored = {};       // fast search without more general priorityDictionary

  if (!goog.isDefAndNotNull(opt_nbunch)) {
    opt_nbunch = G.nodes_iter();
  }

  jsnx.helper.forEach(opt_nbunch, function(/**string*/v) { // process all vertices in G
    if (goog.object.containsKey(explored, v)) {
      return; // continue
    }

    var fringe = [v]; // nodes yet to look at
    while (fringe.length > 0) {
      var w = fringe[fringe.length - 1]; // depth first search
      if (goog.object.containsKey(explored, w)) { // already looked down this branch
        fringe.pop();
        continue;
      }
      seen[w] = true; // mark as seen
      // Check successors for cycles for new nodes
      var new_nodes = [];
      goog.object.forEach(G.get_node(w), function(_, n) {
        if (!goog.object.containsKey(explored, n)) {
          if (goog.object.containsKey(seen, n)) { // CYCLE !!
            throw new jsnx.exception.JSNetworkXUnfeasible('Graph contains a cycle');
          }
          new_nodes.push(n);
        }
      });
      if (new_nodes.length > 0) { // add new nodes to fringe
        fringe.push.apply(fringe, new_nodes);
      }
      else {
        explored[w] = true;
        goog.array.insertAt(order_explored, w.toString());
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
   * @param {goog.structs.Set} seen
   * @param {Array} explored
   * @param {string} v
   *
   * @return {boolean}
   */
  function _dfs(G, seen, explored, v) {
    seen.add(v);
    goog.object.forEach(G.get_node(v), function(_, w) {
      if (!seen.contains(w)) {
        if (!_dfs(G, seen, explored, w)) {
          return false;
        }
      }
      else if (seen.contains(w) && !goog.array.contains(explored, w)) {
        throw new jsnx.exception.JSNetworkXUnfeasible('Graph contains a cycle');
      }
    });
    goog.array.insertAt(explored, v.toString());
    return true;
  }

  var seen = new goog.structs.Set();
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
  var levels = {};
  levels[s] = 0;
  var this_level = [s];
  var g = 0;
  var l = 1;

  while (this_level.length > 0) {
    var next_level = [];
    goog.array.forEach(this_level, function(u) {
      goog.object.forEach(G.get_node(u), function(_, v) {
        if (goog.object.containsKey(levels, v)) { // non-tree edge
          g = jsnx.helper.gcd(g, levels[u] - levels[v] + 1);
        }
        else { // tree edge
          next_level.push(v);
          levels[v] = l;
        }
      });
    });
    this_level = next_level;
    l += 1;
  }

  if (jsnx.helper.len(levels) === jsnx.helper.len(G)) {
    return g === 1;
  }
  return g === 1 && is_aperiodic(
    G.subgraph(
      (new goog.structs.Set(G.nodes())).difference(goog.object.getKeys(levels))
    )
  );
};
goog.exportSymbol(
  'jsnx.is_aperiodic',
  jsnx.algorithms.dag.is_aperiodic
);
