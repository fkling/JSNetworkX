"use strict";

var Graph = require('../classes/graph');

var genCombinations = require('../_internals/genCombinations');
var genPermutations = require('../_internals/genPermutations');
var genRange = require('../_internals/genRange');
var isGraph = require('../_internals/isGraph');
var mapIterator = require('../_internals/itertools/mapIterator');
var range = require('../_internals/range');
var tuple2 = require('../_internals/tuple').tuple2;

/**
 * @param {number} n nodes
 * @param {number} r bredth
 *
 * @return {Iterator}
 */
function *treeEdges(n, r) {
  // helper function for trees
  // yields edges in rooted tree at 0 with n nodes and branching ratio r
  var nodes = genRange(n);
  if (n === 0) {
    return;
  }
  var parents = [nodes.next().value];
  while (parents.length > 0) {
    /*jshint unused:false*/
    var source = parents.pop();
    for (var _ of genRange(r)) {
      var target = nodes.next();
      if (target.done) {
        return;
      }
      target = target.value;
      parents.push(target);
      yield tuple2(source, target);
    }
  }
}

/**
 * Creates a full r-ary tree of n vertices.
 * Sometimes called a k-ary, n-ary, or m-ary tree.  "... all non-leaf
 * vertices have exactly r children and all levels are full except
 * for some rightmost position of the bottom level (if a leaf at the
 * bottom level is missing, then so are all of the leaves to its
 * right."
 *
 * @param {number} r branching factor of the tree
 * @param {number} n number of nodes in the tree
 * @param {Graph=} opt_create_using
 *   Use specified type to construct graph
 *
 * @return {Graph} An r-ary tree with n nodes.
 * @export
 */
function fullRaryTree(r, n, optCreateUsing) {
  var G = emptyGraph(n, optCreateUsing);
  G.addEdgesFrom(treeEdges(n,r));
  return G;
}


/**
 * Return the perfectly balanced r-tree of height h.
 *
 * This is the rooted tree where all leaves are at distance h from
 * the root. The root has degree r and all other internal nodes have
 * degree r+1.
 *
 * Node labels are the integers 0 (the root) up to  number_of_nodes - 1.
 *
 * Also refered to as a complete r-ary tree.
 *
 * @param {number} r  Branching factor of the tree
 * @param {number} h Height of the tree
 * @param {Graph} opt_create_using
 *    Use specified type to construct graph
 *
 * @return {Graph}
 * @export
 */
function balancedTree(r, h, optCreateUsing) {
  var n = r === 1 ? 2 : Math.floor((1 - Math.pow(r, (h+1))) / (1 - r));
  var G = emptyGraph(n, optCreateUsing);
  G.addEdgesFrom(treeEdges(n,r));
  return G;
}

//TODO: barbell_graph

/**
 * Return the complete graph K_n with n nodes.
 *
 * Node labels are the integers 0 to n-1.
 *  @param{number} n The number of nodes to add to the graph
 *  @param{Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 *  @return {Graph}
 *  @export
 */
function completeGraph(n, optCreateUsing) {
  var G = emptyGraph(n, optCreateUsing);
  G.name = 'complete_graph(' + n + ')';
  if (n > 1) {
    G.addEdgesFrom(G.isDirected() ?
      genPermutations(range(n), 2) :
      genCombinations(range(n), 2)
    );
  }
  return G;
}

//TODO: complete_bipartite_graph
//TODO: circular_ladder_graph

/**
 * Return the cycle graph C_n over n nodes.
 *
 * C_n is the n-path with two end-nodes connected.
 *
 * Node labels are the integers 0 to n-1
 * If create_using is a DiGraph, the direction is in increasing order.
 *
 * @param{number} n The number of nodes to add to the graph
 * @param{Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {Graph}
 * @export
 */
function cycleGraph(n, optCreateUsing) {
  var G = pathGraph(n, optCreateUsing);
  G.name = 'cycle_graph(' + n + ')';
  if (n > 1) {
    G.addEdge(n-1,0);
  }
  return G;
}

//TODO: dorogovtsev_goltsev_mendes_graph

/**
 *  Return the empty graph with n nodes and zero edges.
 *
 *  Node labels are the integers 0 to n-1
 *
 *  For example:
 *  >>> var G = jsnx.empty_graph(10)
 *  >>> G.number_of_nodes()
 *  10
 *  >>> G.number_of_edges()
 *  0
 *
 *  The variable create_using should point to a "graph"-like object that
 *  will be cleaned (nodes and edges will be removed) and refitted as
 *  an empty "graph" with n nodes with integer labels. This capability
 *  is useful for specifying the class-nature of the resulting empty
 *  "graph" (i.e. Graph, DiGraph, MyWeirdGraphClass, etc.).
 *
 *  The variable create_using has two main uses:
 *  Firstly, the variable create_using can be used to create an
 *  empty digraph, network,etc.  For example,
 *
 *  >>> var n = 10
 *  >>> var G = jsnx.empty_graph(n, jsnx.DiGraph())
 *
 *  will create an empty digraph on n nodes.
 *
 *  Secondly, one can pass an existing graph (digraph, pseudograph,
 *  etc.) via create_using. For example, if G is an existing graph
 *  (resp. digraph, pseudograph, etc.), then empty_graph(n,G)
 *  will empty G (i.e. delete all nodes and edges using G.clear() in
 *  base) and then add n nodes and zero edges, and return the modified
 *  graph (resp. digraph, pseudograph, etc.).
 *
 *  @see create_empty_copy
 *
 *  @param{?number=} opt_n The number of nodes to add to the graph
 *  @param{?Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 *  @return {Graph}
 *  @export
 */
function emptyGraph(optN, optCreateUsing) {
  if (isGraph(optN)) {
    optCreateUsing = optN;
    optN = null;
  }
  if (optN == null) {
    optN = 0;
  }

  var G;

  if (optCreateUsing == null) {
    // default empty graph is a simple graph
    G = new Graph();
  }
  else {
    G = optCreateUsing;
    G.clear();
  }

  G.addNodesFrom(genRange(optN));
  G.name = 'empty_graph(' + optN + ')';
  return G;
}

/**
 * Return the 2d grid graph of mxn nodes,
 * each connected to its nearest neighbors.
 * Optional argument periodic=True will connect
 * boundary nodes via periodic boundary conditions.
 *
 * @param {number} m Number of rows
 * @param {number} n Number of columns
 * @param {boolean=} opt_periodic
 * @param {Graph=} opt_create_using
 *
 * @return {Graph}
 * @export
 */
function grid2dGraph(m, n, optPeriodic, optCreateUsing) {
  var G = emptyGraph(0, optCreateUsing);
  G.name = 'grid_2d_graph';
  var rows = range(m);
  var columns = range(n);
  var i;
  var j;
  for (i = 0; i < rows.length; i++) {
    for (j = 0; j < columns.length; j++) {
      G.addNode([i,j]);
    }
  }
  for (i of genRange(1, m)) {
    for (j = 0; j < columns.length; j++) {
      G.addEdge([i,j], [i-1,j]);
    }
  }
  for (i = 0; i < rows.length; i++) {
    for (j of genRange(1, n)) {
      G.addEdge([i,j], [i,j-1]);
    }
  }
  if (G.isDirected()) {
    for (i of genRange(0, m-1)) {
      for (j = 0; j < columns.length; j++) {
        G.addEdge([i,j], [i+1,j]);
      }
    }
    for (i = 0; i < rows.length; i++) {
      for (j of genRange(0, n - 1)) {
        G.addEdge([i,j], [i,j+1]);
      }
    }
  }

  if (optPeriodic) {
    if (n > 2) {
      for (i = 0; i < rows.length; i++) {
        G.addEdge([i,0], [i,n-1]);
      }
      if (G.isDirected()) {
        for (i = 0; i < rows.length; i++) {
          G.addEdge([i,n-1], [i,0]);
        }
      }
    }
    if (m > 2) {
      for (j = 0; j < columns.length; j++) {
        G.addEdge([0,j], [m-1,j]);
      }
      if (G.isDirected()) {
        for (j = 0; j < columns.length; j++) {
          G.addEdge([m-1,j], [0,j]);
        }
      }
    }
    G.name = 'periodic_grid_2d_graph(' + m + ',' + n + ')';
  }
  return G;
}

//TODO: grid_graph
//TODO: hypercube_graph
//TODO: ladder_graph
//TODO: lollipop_graph

/**
 * Return the Null graph with no nodes or edges.
 *
 * See empty_graph for the use of create_using.
 *
 * @param {Graph=} opt_create_using Graph instance to empty and add nodes to.
 *
 * @return {Graph}
 * @export
 */
function nullGraph(optCreateUsing) {
  var G = emptyGraph(0, optCreateUsing);
  G.name = 'null_graph()';
  return G;
}

/**
 * Return the Null graph with no nodes or edges.
 *
 * See empty_graph for the use of create_using.
 *
 * @param {number} n The number of nodes to add to the graph
 * @param {Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {Graph}
 * @export
 */
function pathGraph(n, optCreateUsing) {
  var G = emptyGraph(n, optCreateUsing);
  G.name = 'path_graph(' + n + ')';
  G.addEdgesFrom(mapIterator(
    genRange(n-1),
    function(v) {
      return tuple2(v, v+1);
    }
  ));
  return G;
}

//TODO: star_graph

/**
 * Return the Trivial graph with one node (with integer label 0) and no edges.
 *
 * @param{Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {Graph}
 * @export
 */
function trivialGraph(optCreateUsing) {
  var G = emptyGraph(1, optCreateUsing);
  G.name = 'null_graph()';
  return G;
}

//TODO: wheel_graph

module.exports = {
  fullRaryTree: fullRaryTree,
  balancedTree: balancedTree,
  completeGraph: completeGraph,
  cycleGraph: cycleGraph,
  emptyGraph: emptyGraph,
  grid2dGraph: grid2dGraph,
  nullGraph: nullGraph,
  pathGraph: pathGraph,
  trivialGraph: trivialGraph,
};
