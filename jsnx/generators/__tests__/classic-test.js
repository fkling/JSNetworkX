/*global assert*/
'use strict';

var DiGraph = require('../../classes/digraph');
/*jshint ignore:start*/
var Map = utils.Map;
/*jshint ignore:end*/

var classic = require('../classic');
var degree_histogram = require('../../classes/functions').degree_histogram;

exports.TestGeneratorClassic = {

  test_balanced_tree: function() {
    [[2,2],[3,3],[6,2]].forEach(function(d) {
      var r = d[0];
      var h = d[1];
      var t = classic.balanced_tree(r, h);
      var order = t.order();
      assert.equal(order, (Math.pow(r, h+1) - 1) / (r - 1));
      // TODO: is_connected
      // assert(is_connected(t));
      assert.equal(t.size(), order - 1);
      var dh = degree_histogram(t);
      assert.equal(dh[0], 0); // no nodes of 0
      assert.equal(dh[1], Math.pow(r,h)); // nodes of degree 1 are leaves
      assert.equal(dh[r], 1); // root is degree r
      // everyone else is degree r+1
      assert.equal(dh[r+1], order - Math.pow(r, h) - 1);
      assert.equal(dh.length, r+2);
    });
  },

  //TODO: test_balanced_tree_star

  test_full_rary_tree: function() {
    var r = 2;
    var n = 9;
    var t = classic.full_rary_tree(r,n);
    assert.equal(t.order(), n);
    //TODO: is_connected
    // assert(is_connected(t));
    var dh = degree_histogram(t);
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

  test_rary_tree_3_20: function() {
    var t = classic.full_rary_tree(3,20);
    assert.equal(t.order(), 20);
  },

  //TODO: test_barbell_graph

  test_complete_graph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    var G;
    [0,1,3,5].forEach(function(m) {
        G = classic.complete_graph(m);
        assert.equal(G.number_of_nodes(), m);
        assert.equal(G.number_of_edges(), Math.floor(m*(m-1) / 2));
    });

    /* TODO MultiGraph
    var mg = complete_graph(5, new MultiGraph());
    assert.deepEqual(mg.edges(), g.edges());
    */
  },


  test_complete_digraph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    [0,1,3,5].forEach(function(m) {
        var G = classic.complete_graph(m, new DiGraph());
        assert.equal(G.number_of_nodes(), m);
        assert.equal(G.number_of_edges(), Math.floor(m*(m-1)));
    });
  },

  //TODO: test_complete_bipartite_graph
  //TODO: test_circular_ladder_graph

  test_cycle_graph: function() {
    var G = classic.cycle_graph(4);
    assert.deepEqual(G.edges(), [[0,1],[0,3],[1,2],[2,3]]);

    /* TODO MultiGraph
    var mG = classic.cycle_graph(4, new MultiGraph());
    assert.deepEqual(sorted(mG.edges()), [[0,1],[0,3],[1,2],[2,3]]);
    */

    G = classic.cycle_graph(4, new DiGraph());
    assert.equal(G.has_edge(2,1), false);
    assert.equal(G.has_edge(1,2), true);
  },

  //TODO: test_dorogovtsev_goltsev_mendes_graph

  test_empty_graph: function() {
    var G = classic.empty_graph();
    assert.equal(G.number_of_nodes(), 0);
    G = classic.empty_graph(42);
    assert(G.number_of_nodes(), 42);
    assert.equal(G.number_of_edges(), 0);
    assert.equal(G.name, 'empty_graph(42)');

    // create empty digraph
    G = classic.empty_graph(42, new DiGraph(null, {name: 'duh'}));
    assert.equal(G.number_of_nodes(), 42);
    assert.equal(G.number_of_edges(), 0);
    assert.equal(G.name, 'empty_graph(42)');
    assert.equal(G instanceof DiGraph, true);

    /* TODO MultiGraph
    // create empty multigraph
    G = empty_graph(42, new MultiGraph(null, {name: 'duh'}));
    assert.equal(number_of_nodes(G), 42);
    assert.equal(number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');
    assert.equal(G instanceof MultiGraph, true);
    */

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

  test_grid_2d_graph: function() {
    var n = 5;
    var m = 6;

    var G = classic.grid_2d_graph(n,m);
    assert.equal(G.number_of_nodes(), n*m);
    assert.deepEqual(degree_histogram(G), [0,0,4,2*(n+m)-8,(n-2)*(m-2)]);
    var DG = classic.grid_2d_graph(n, m, false, new DiGraph());
    assert.deepEqual(DG.succ, G.adj);
    assert.deepEqual(DG.pred, G.adj);
    /* TODO MultiGraph
    var MG = grid_2d_graph(n, m, false, MultiGraph());
    assert.deepEqual(MG.edges(), G.edges());
    */
  },

  //TODO: test_grid_graph
  //TODO: test_hypercube_graph
  //TODO: test_ladder_grap    h
  //TODO: test_lollipop_graph

  test_null_graph: function() {
    assert.equal(classic.null_graph().number_of_nodes(), 0);
  },

  //TODO: test_path_graph
  //TODO: test_periodic_grid_2d_graph
  //TODO: test_star_graph

  test_trivial_graph: function() {
    assert.equal(classic.trivial_graph().number_of_nodes(), 1);
  }

  //TODO: test_wheel_graph
};
