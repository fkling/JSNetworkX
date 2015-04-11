/*global assert*/
'use strict';

import {MultiGraph, DiGraph} from '../../classes';

import * as classic from '../classic';
import {degreeHistogram} from '../../classes/functions';

function sorted(v) {
  return Array.from(v).sort();
}

export var testGeneratorClassic = {

  testBalancedTree: function() {
    [[2, 2], [3, 3], [6, 2]].forEach(([r, h]) => {
      var t = classic.balancedTree(r, h);
      var order = t.order();
      assert.equal(order, (Math.pow(r, h+1) - 1) / (r - 1));
      // TODO: is_connected
      // assert(is_connected(t));
      assert.equal(t.size(), order - 1);
      var dh = degreeHistogram(t);
      assert.equal(dh[0], 0); // no nodes of 0
      assert.equal(dh[1], Math.pow(r, h)); // nodes of degree 1 are leaves
      assert.equal(dh[r], 1); // root is degree r
      // everyone else is degree r+1
      assert.equal(dh[r+1], order - Math.pow(r, h) - 1);
      assert.equal(dh.length, r+2);
    });
  },

  //TODO: test_balanced_tree_star

  testFullRaryTree: function() {
    var r = 2;
    var n = 9;
    var t = classic.fullRaryTree(r, n);
    assert.equal(t.order(), n);
    //TODO: is_connected
    // assert(is_connected(t));
    var dh = degreeHistogram(t);
    assert.equal(dh[0], 0); // no nodes of 0
    assert.equal(dh[1], 5); // nodes of degree 1 are leaves
    assert.equal(dh[r], 1); // root is degree r
    assert.equal(dh[r+1], 9-5-1); // everyone else is degree r+1
    assert.equal(dh.length, r+2);
  },

  /* TODO: is_isomorphic
  test_rary_tree_balanced: function() {
    var t = classic.full_rary_tree(2,15);
    var th = classic.balanced_tree(2,3);
    assert(is_isomorphic(t, th));
  },

  test_rary_tree_path: function() {
    var t = full_rary_tree(1,10);
    assert.equal(is_isomorphic(t, path_graph(10)), true);
  },

  test_rary_tree_empty: function() {
    var t = full_rary_tree(0,10);
    assert.equal(is_isomorphic(t, empty_graph(10)), true);
    t = full_rary_tree(3,0);
    assert.equal(is_isomorphic(t, empty_graph(0)), true);
  },
  */

  testRaryTree320: function() {
    var t = classic.fullRaryTree(3, 20);
    assert.equal(t.order(), 20);
  },

  //TODO: test_barbell_graph

  testCompleteGraph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    var G;
    [0, 1, 3, 5].forEach(function(m) {
        G = classic.completeGraph(m);
        assert.equal(G.numberOfNodes(), m);
        assert.equal(G.numberOfEdges(), Math.floor(m * (m-1) / 2));
    });

    var MG = classic.completeGraph(5, new MultiGraph());
    assert.deepEqual(MG.edges(), G.edges());
  },


  testCompleteDigraph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    [0, 1, 3, 5].forEach(function(m) {
        var G = classic.completeGraph(m, new DiGraph());
        assert.equal(G.numberOfNodes(), m);
        assert.equal(G.numberOfEdges(), Math.floor(m * (m-1)));
    });
  },

  //TODO: test_complete_bipartite_graph
  //TODO: test_circular_ladder_graph

  testCycleGraph: function() {
    var G = classic.cycleGraph(4);
    assert.deepEqual(G.edges(), [[0, 1], [0, 3], [1, 2], [2, 3]]);

    var mG = classic.cycleGraph(4, new MultiGraph());
    assert.deepEqual(sorted(mG.edges()), [[0, 1], [0, 3], [1, 2], [2, 3]]);

    G = classic.cycleGraph(4, new DiGraph());
    assert.equal(G.hasEdge(2, 1), false);
    assert.equal(G.hasEdge(1, 2), true);
  },

  //TODO: test_dorogovtsev_goltsev_mendes_graph

  testEmptyGraph: function() {
    var G = classic.emptyGraph();
    assert.equal(G.numberOfNodes(), 0);
    G = classic.emptyGraph(42);
    assert(G.numberOfNodes(), 42);
    assert.equal(G.numberOfEdges(), 0);
    assert.equal(G.name, 'emptyGraph(42)');

    // create empty digraph
    G = classic.emptyGraph(42, new DiGraph(null, {name: 'duh'}));
    assert.equal(G.numberOfNodes(), 42);
    assert.equal(G.numberOfEdges(), 0);
    assert.equal(G.name, 'emptyGraph(42)');
    assert.equal(G instanceof DiGraph, true);

    // create empty multigraph
    G = classic.emptyGraph(42, new MultiGraph(null, {name: 'duh'}));
    assert.equal(G.numberOfNodes(), 42);
    assert.equal(G.numberOfEdges(), 0);
    assert.equal(G.name, 'emptyGraph(42)');
    assert.equal(G instanceof MultiGraph, true);

    /* TODO: peterson_graph
    // create empty graph from another
    var pete = petersen_graph();
    G = empty_graph(42, pete);
    assert.equal(number_of_nodes(G), 42);
    assert.equal(number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');
    assert.equal(G instanceof Graph, true);
    */
  },

  testGrid2dGraph: function() {
    var n = 5;
    var m = 6;

    var G = classic.grid2dGraph(n, m);
    assert.equal(G.numberOfNodes(), n * m);
    assert.deepEqual(
      degreeHistogram(G),
      [0, 0, 4, 2 * (n + m) - 8, (n - 2) * (m - 2)]);
    var DG = classic.grid2dGraph(n, m, false, new DiGraph());
    assert.deepEqual(DG.succ, G.adj);
    assert.deepEqual(DG.pred, G.adj);
    var MG = classic.grid2dGraph(n, m, false, new MultiGraph());
    assert.deepEqual(MG.edges(), G.edges());
  },

  //TODO: test_grid_graph
  //TODO: test_hypercube_graph
  //TODO: test_ladder_grap    h
  //TODO: test_lollipop_graph

  testNullGraph: function() {
    assert.equal(classic.nullGraph().numberOfNodes(), 0);
  },

  //TODO: test_path_graph
  //TODO: test_periodic_grid_2d_graph
  //TODO: test_star_graph

  testTrivialGraph: function() {
    assert.equal(classic.trivialGraph().numberOfNodes(), 1);
  }

  //TODO: test_wheel_graph
};
