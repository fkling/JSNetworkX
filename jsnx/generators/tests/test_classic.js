/*jshint strict:false, node:true*/

var assert = require('assert');
var sorted = require('../../../mocha/helper').sorted;
var jsnx = require('../../../jsnetworkx-test');
var is_isomorphic = jsnx.could_be_isomorphic;

exports.TestGeneratorClassic = {

  test_balanced_tree: function() {
    [[2,2],[3,3],[6,2]].forEach(function(d) {
      var r = d[0];
      var h = d[1];
      var t = jsnx.balanced_tree(r, h);
      var order = t.order();
      assert.equal(order, (Math.pow(r, h+1) - 1) / (r - 1));
      // TODO: Implement is_connected
      // assert(jsnx.is_connected(t));
      assert.equal(t.size(), order - 1);
      var dh = jsnx.degree_histogram(t);
      assert.equal(dh[0], 0); // no nodes of 0
      assert.equal(dh[1], Math.pow(r,h)); // nodes of degree 1 are leaves
      assert.equal(dh[r], 1); // root is degree r
      assert.equal(dh[r+1], order - Math.pow(r, h) - 1); // everyone else is degree r+1
      assert.equal(dh.length, r+2);
    });
  },

  //TODO: test_balanced_tree_star

  test_full_rary_tree: function() {
    var r = 2;
    var n = 9;
    var t = jsnx.full_rary_tree(r,n);
    assert.equal(t.order(), n);
    //TODO: Implement is_connected
    // assert(jsnx.is_connected(t));
    var dh = jsnx.degree_histogram(t);
    assert.equal(dh[0], 0); // no nodes of 0
    assert.equal(dh[1], 5); // nodes of degree 1 are leaves
    assert.equal(dh[r], 1); // root is degree r
    assert.equal(dh[r+1], 9-5-1); // everyone else is degree r+1
    assert.equal(dh.length, r+2);
  },

  test_rary_tree_balanced: function() {
  var t = jsnx.full_rary_tree(2,15);
  var th = jsnx.balanced_tree(2,3);
  assert(is_isomorphic(t, th));
  },

  test_rary_tree_path: function() {
    var t = jsnx.full_rary_tree(1,10);
    assert.equal(is_isomorphic(t, jsnx.path_graph(10)), true);
  },

  test_rary_tree_empty: function() {
    var t = jsnx.full_rary_tree(0,10);
    assert.equal(is_isomorphic(t, jsnx.empty_graph(10)), true);
    t = jsnx.full_rary_tree(3,0);
    assert.equal(is_isomorphic(t, jsnx.empty_graph(0)), true);
  },

  test_rary_tree_3_20: function() {
    var t = jsnx.full_rary_tree(3,20);
    assert.equal(t.order(), 20);
  },

  //TODO: test_barbell_graph

  test_complete_graph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    var g;
    [0,1,3,5].forEach(function(m) {
        g = jsnx.complete_graph(m);
        assert.equal(jsnx.number_of_nodes(g), m);
        assert.equal(jsnx.number_of_edges(g), Math.floor(m*(m-1) / 2));
    });

    var mg = jsnx.complete_graph(5, jsnx.MultiGraph());
    assert.deepEqual(mg.edges(), g.edges());
  },


  test_complete_digraph: function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    [0,1,3,5].forEach(function(m) {
        var g = jsnx.complete_graph(m, jsnx.DiGraph());
        assert.equal(jsnx.number_of_nodes(g), m);
        assert.equal(jsnx.number_of_edges(g), Math.floor(m*(m-1)));
    });
  },

  //TODO: test_complete_bipartite_graph
  //TODO: test_circular_ladder_graph

  test_cycle_graph: function() {
    var G = jsnx.cycle_graph(4);
    assert.deepEqual(sorted(G.edges()), [[0,1],[0,3],[1,2],[2,3]]);

    var mG = jsnx.cycle_graph(4, /*create_using=*/jsnx.MultiGraph());
    assert.deepEqual(sorted(mG.edges()), [[0,1],[0,3],[1,2],[2,3]]);

    G = jsnx.cycle_graph(4, /*create_using=*/jsnx.DiGraph());
    assert.equal(G.has_edge(2,1), false);
    assert.equal(G.has_edge(1,2), true);
  },

  //TODO: test_dorogovtsev_goltsev_mendes_graph

  test_empty_graph: function() {
    var G = jsnx.empty_graph();
    assert.equal(jsnx.number_of_nodes(G), 0);
    G = jsnx.empty_graph(42);
    assert(jsnx.number_of_nodes(G), 42);
    assert.equal(jsnx.number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');

    // create empty digraph
    G = jsnx.empty_graph(42, jsnx.DiGraph(null, {name: 'duh'}));
    assert.equal(jsnx.number_of_nodes(G), 42);
    assert.equal(jsnx.number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');
    assert.equal(G instanceof jsnx.DiGraph, true);

    // create empty multigraph
    G = jsnx.empty_graph(42, jsnx.MultiGraph(null, {name: 'duh'}));
    assert.equal(jsnx.number_of_nodes(G), 42);
    assert.equal(jsnx.number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');
    assert.equal(G instanceof jsnx.MultiGraph, true);

    /* TODO: peterson_graph
    // create empty graph from another
    var pete = jsnx.petersen_graph();
    G = jsnx.empty_graph(42, pete);
    assert.equal(jsnx.number_of_nodes(G), 42);
    assert.equal(jsnx.number_of_edges(G), 0);
    assert.equal(G.name(), 'empty_graph(42)');
    assert.equal(G instanceof jsnx.Graph, true);
    */
  },

  test_grid_2d_graph: function() {
    var n = 5;
    var m = 6;

    var G = jsnx.grid_2d_graph(n,m);
    assert.equal(jsnx.number_of_nodes(G), n*m);
    assert.deepEqual(jsnx.degree_histogram(G), [0,0,4,2*(n+m)-8,(n-2)*(m-2)]);
    var DG = jsnx.grid_2d_graph(n, m, false, jsnx.DiGraph());
    assert.deepEqual(DG.succ, G.adj);
    assert.deepEqual(DG.pred, G.adj);
    var MG = jsnx.grid_2d_graph(n, m, false, jsnx.MultiGraph());
    assert.deepEqual(MG.edges(), G.edges());
  },

  //TODO: test_grid_graph
  //TODO: test_hypercube_graph
  //TODO: test_ladder_grap    h
  //TODO: test_lollipop_graph

  test_null_graph: function() {
    assert.equal(jsnx.number_of_nodes(jsnx.null_graph()), 0);
  },

  //TODO: test_path_graph
  //TODO: test_periodic_grid_2d_graph
  //TODO: test_star_graph

  test_trivial_graph: function() {
    assert.equal(jsnx.number_of_nodes(jsnx.trivial_graph()), 1);
  }

  //TODO: test_wheel_graph
};
