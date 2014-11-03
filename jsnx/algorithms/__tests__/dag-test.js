/*globals assert, utils*/
"use strict";

var DiGraph = require('../../classes/digraph');
var Graph = require('../../classes/graph');
var JSNetworkXError = require('../../exceptions/JSNetworkXError');
var JSNetworkXUnfeasible = require('../../exceptions/JSNetworkXUnfeasible');

var dag = require('../dag');
var full_rary_tree = require('../../generators/classic').full_rary_tree;

exports.TestDAG = {

  test_topological_sort1: function() {
    var DG = new DiGraph();
    DG.add_edges_from([[1,2],[1,3],[2,3]]);
    assert.deepEqual(dag.topological_sort(DG), [1,2,3]);
    assert.deepEqual(dag.topological_sort_recursive(DG), [1,2,3]);
  },

  test_topological_sort2: function() {
    var DG = new DiGraph({1:[2], 2:[3], 3:[4],
                          4:[5], 5:[1], 11:[12],
                          12:[13], 13:[14], 14:[15]});

    assert.throws(() =>  dag.topological_sort(DG), JSNetworkXUnfeasible);
    assert.throws(
      () => dag.topological_sort_recursive(DG),
      JSNetworkXUnfeasible
    );

    assert(!dag.is_directed_acyclic_graph(DG));

    DG.remove_edge(1,2);
    assert.deepEqual(
      dag.topological_sort_recursive(DG),
      [11, 12, 13, 14, 15, 2, 3, 4, 5, 1]
    );
    assert.deepEqual(
      dag.topological_sort(DG),
      [11, 12, 13, 14, 15, 2, 3, 4, 5, 1]
    );
    assert(dag.is_directed_acyclic_graph(DG));
  },

  test_topological_sort3: function() {
    var DG = new DiGraph();
    DG.add_edges_from(utils.range(2,5).map(i => [1,i]));
    DG.add_edges_from(utils.range(5,9).map(i => [2,i]));
    DG.add_edges_from(utils.range(9,12).map(i => [6,i]));
    DG.add_edges_from(utils.range(12,15).map(i => [4,i]));

    /*
    * Doesn't validate, probably because the order in which the nodes are
    * iterated over is different.
    assert.deepEqual(
      dag.topological_sort_recursive(DG),
      [1,4,14,13,12,3,2,7,6,11,10,9,5,8]
    );
    assert.deepEqual(
      dag.topological_sort(DG),
      [1,2,8,5,6,9,10,11,7,3,4,12,13,14]
    );
    */

    DG.add_edge(14, 1);

    assert.throws(() => dag.topological_sort(DG), JSNetworkXUnfeasible);
    assert.throws(
      () => dag.topological_sort_recursive(DG),
      JSNetworkXUnfeasible
    );
  },

  test_topological_sort4: function() {
    var G = new Graph();
    G.add_edge(0,1);
    assert.throws(() => dag.topological_sort(G), JSNetworkXError);
    assert.throws(() => dag.topological_sort_recursive(G), JSNetworkXError);
  },

  test_topological_sort5: function() {
    var G = new DiGraph();
    G.add_edge(0,1);
    assert.deepEqual(dag.topological_sort_recursive(G), [0,1]);
    assert.deepEqual(dag.topological_sort(G), [0,1]);
  },

  test_nbunch_argument: function() {
    var G = new DiGraph();
    G.add_edges_from([[1,2], [2,3], [1,4], [1,5], [2,6]]);
    assert.deepEqual(dag.topological_sort(G), [1,2,3,6,4,5]);
    assert.deepEqual(dag.topological_sort_recursive(G), [1,5,4,2,6,3]);
    assert.deepEqual(dag.topological_sort(G, [1]), [1,2,3,6,4,5]);
    assert.deepEqual(dag.topological_sort_recursive(G,[1]), [1,5,4,2,6,3]);
    assert.deepEqual(dag.topological_sort(G, [5]), [5]);
    assert.deepEqual(dag.topological_sort_recursive(G,[5]), [5]);
  },

  test_is_aperiodic_cycle: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    assert(!dag.is_aperiodic(G));
  },

  test_is_aperiodic_cycle2: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([3,4,5,6,7]);
    assert(dag.is_aperiodic(G));
  },

  test_is_aperiodic_cycle3: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([3,4,5,6]);
    assert(!dag.is_aperiodic(G));
  },

  test_is_aperiodic_cycle4: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([1,3]);
    assert(dag.is_aperiodic(G));
  },

  test_is_aperiodic_selfloop: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_edge(1,1);
    assert(dag.is_aperiodic(G));
  },

  test_is_aperiodic_raise: function() {
    var G = new Graph();
    assert.throws(() =>  dag.is_aperiodic(G), JSNetworkXError);
  },

  /* TODO: davis_southern_women_graph
  test_is_aperiodic_bipartite: function() {
    var G = new DiGraph(davis_southern_women_graph());
    assert(!dag.is_aperiodic(G));
  },
  */

  test_is_aperiodic_rary_tree: function() {
    var G = full_rary_tree(3, 27, new DiGraph());
    assert(!dag.is_aperiodic(G));
  },

  test_is_aperiodic_disconnected: function() {
    var G = new DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([5,6,7,8]);
    assert(!dag.is_aperiodic(G));
    G.add_edge(1,3);
    G.add_edge(5,7);
    assert(dag.is_aperiodic(G));
  },

  test_is_aperiodic_disconnected2: function() {
    var G = new DiGraph();
    G.add_cycle([0,1,2]);
    G.add_edge(3,3);
    assert(!dag.is_aperiodic(G));
  }
};
