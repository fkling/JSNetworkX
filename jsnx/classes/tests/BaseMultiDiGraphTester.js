/*jshint strict:false, node:true*/

var BaseMultiGraphTester = require('./BaseMultiGraphTester');
var assert = require('assert');
var sorted = require('../../../mocha/helper').sorted;
var shared = require('./shared');
var jsnx = require('../../../jsnetworkx-test');

var shared_multi_digraph = {
  is_shallow: function(H, G) {
    // graph
    assert.deepEqual(G.graph['foo'], H.graph['foo']);
    G.graph['foo'].push(1);
    assert.deepEqual(G.graph['foo'], H.graph['foo']);
    // node
    assert.deepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
    G.node.get(0)['foo'].push(1);
    assert.deepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
    // edge
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
    G.get(1).get(2)[0]['foo'].push(1);
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
  },

  is_deep: function(H, G) {
    // graph
    assert.deepEqual(G.graph['foo'], H.graph['foo']);
    G.graph['foo'].push(1);
    assert.notDeepEqual(G.graph['foo'], H.graph['foo']);
    // node
    assert.deepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
    G.node.get(0)['foo'].push(1);
    assert.notDeepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
    // edge
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
    G.get(1).get(2)[0]['foo'].push(1);
    assert.notDeepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
  }
};

var BaseMultiDiGraphTester = {
  test_edges: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.edges()),[[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]);
    assert.deepEqual(sorted(G.edges(0)),[[0,1], [0,2]]);
    assert.throws(function(){G.edges(-1);}, jsnx.JSNetworkxError);
  },

  test_edges_data: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edges(true)),
      [[0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
    assert.deepEqual(sorted(G.edges(0, true)),[[0,1,{}], [0,2,{}]]);
    assert.throws(function(){G.neighbors(-1);}, jsnx.JSNetworkxError);
  },

  test_edges_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edges_iter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.edges_iter(0)),[[0,1], [0,2]]);
    G.add_edge(0, 1);
    assert.deepEqual(
      sorted(G.edges_iter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
  },

  test_out_edges: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.out_edges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.out_edges(0)),[[0,1], [0,2]]);
    assert.throws(function(){G.out_edges(-1);}, jsnx.JSNetworkxError);
    assert.deepEqual(sorted(G.out_edges(0, false, true)),[[0,1,0], [0,2,0]]);
  },

  test_out_edges_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.out_edges_iter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.out_edges_iter(0)),[[0,1], [0,2]]);
    G.add_edge(0, 1, 2);
    assert.deepEqual(
      sorted(G.edges_iter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
  },

  test_in_edges: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.in_edges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.in_edges(0)),[[1,0], [2,0]]);
    G.add_edge(0, 1, 2);
    assert.deepEqual(
      sorted(G.in_edges()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      sorted(G.in_edges(0, false, true)),
      [[1,0,0], [2,0,0]]
    );
  },

  test_in_edges_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.in_edges_iter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.in_edges_iter(0)),[[1,0], [2,0]]);
    G.add_edge(0, 1, 2);
    assert.deepEqual(
      sorted(G.in_edges_iter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      sorted(G.in_edges(true)),
      [[0,1,{}], [0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
  },

  test_to_undirected: function() {
    // MultiDiGraph -> MultiGraph changes number of edges so it is
    // not a copy operation... use is_shallow, not is_shallow_copy
    var G = this.K3;
    shared.add_attributes(G);
    var H = jsnx.MultiGraph(G);
    shared_multi_digraph.is_shallow(H, G);
    H = G.to_undirected();
    shared_multi_digraph.is_deep(H, G);
  },

  test_has_successor: function() {
    var G = this.K3;
    assert.equal(G.has_successor(0, 1), true);
    assert.equal(G.has_successor(0, -1), false);
  },

  test_successors: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.successors(0)), [1,2]);
    assert.throws(function(){G.successors(-1);}, jsnx.JSNetworkxError);
  },

  test_successors_iter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.successors_iter(0)), [1,2]);
    assert.throws(function(){G.successors_iter(-1);}, jsnx.JSNetworkxError);
  },

  test_has_predecessor: function() {
    var G = this.K3;
    assert.equal(G.has_predecessor(0, 1), true);
    assert.equal(G.has_predecessor(0, -1), false);
  },

  test_predecessors: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.predecessors(0)), [1,2]);
    assert.throws(function(){G.predecessors(-1);}, jsnx.JSNetworkxError);
  },

  test_predecessors_iter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.predecessors_iter(0)), [1,2]);
    assert.throws(function(){G.predecessors_iter(-1);}, jsnx.JSNetworkxError);
  },

  test_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.degree().values(), [4,4,4]);
    assert.deepEqual(G.degree(), new jsnx.Map({0:4, 1:4, 2:4}));
    assert.equal(G.degree(0), 4);
    assert.deepEqual(G.degree([0]), new jsnx.Map({0:4}));
    assert.throws(function(){G.degree(-1);}, jsnx.JSNetworkxError);
  },

  test_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.degree_iter()), [[0,4], [1,4], [2,4]]);
    assert.deepEqual(
      new jsnx.Map(G.degree_iter()),
      new jsnx.Map([[0,4], [1,4], [2,4]])
    );
    assert.deepEqual(sorted(G.degree_iter(0)), [[0,4]]);
    G.add_edge(0,1,{weight:0.3, other:1.2});
    assert.deepEqual(
      sorted(G.degree_iter(null, 'weight')),
      [[0,4.3], [1,4.3], [2,4]]
    );
    assert.deepEqual(
      sorted(G.degree_iter(null, 'other')),
      [[0,5.2], [1,5.2], [2,4]]
    );
  },

  test_in_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.in_degree().values(), [2,2,2]);
    assert.deepEqual(G.in_degree(), new jsnx.Map({0:2, 1:2, 2:2}));
    assert.equal(G.in_degree(0), 2);
    assert.deepEqual(G.in_degree([0]), new jsnx.Map({0:2}));
    assert.throws(function(){G.in_degree(-1);}, jsnx.JSNetworkxError);
  },

  test_in_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.in_degree_iter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new jsnx.Map(G.in_degree_iter()),
      new jsnx.Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(sorted(G.in_degree_iter(0)), [[0,2]]);
    assert.deepEqual(sorted(G.in_degree_iter(0, 'weight')), [[0,2]]);
  },

  test_out_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.out_degree().values(), [2,2,2]);
    assert.deepEqual(G.out_degree(), new jsnx.Map({0:2, 1:2, 2:2}));
    assert.equal(G.out_degree(0), 2);
    assert.deepEqual(G.out_degree([0]), new jsnx.Map({0:2}));
    assert.throws(function(){G.out_degree(-1);}, jsnx.JSNetworkxError);
  },

  test_out_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.out_degree_iter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new jsnx.Map(G.out_degree_iter()),
      new jsnx.Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(sorted(G.out_degree_iter(0)), [[0,2]]);
    assert.deepEqual(sorted(G.out_degree_iter(0, 'weight')), [[0,2]]);
  },

  test_size: function() {
    var G = this.K3;
    assert.equal(G.size(), 6);
    assert.equal(G.number_of_edges(), 6);
    G.add_edge(0, 1, {weight:0.3, other:1.2});
    assert.equal(G.size('weight'), 6.3);
    assert.equal(G.size('other'), 7.2);
  },

  test_to_undirected_reciprocal: function() {
    var G = this.Graph();
    G.add_edge(1,2);
    assert.equal(G.to_undirected().has_edge(1,2), true);
    assert.equal(G.to_undirected(true).has_edge(1,2), false);
    G.add_edge(2,1);
    assert.equal(G.to_undirected(true).has_edge(1,2), true);
  },

  test_reverse_copy: function() {
    var G = jsnx.MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse();
    assert.deepEqual(sorted(R.edges()),[[1,0],[1,0]]);
    R.remove_edge(1,0);
    assert.deepEqual(sorted(R.edges()),[[1,0]]);
    assert.deepEqual(sorted(G.edges()),[[0,1],[0,1]]);
  },
  
  test_reverse_nocopy: function() {
    var G = jsnx.MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse(false);
    assert.deepEqual(sorted(R.edges()),[[1,0],[1,0]]);
    R.remove_edge(1,0);
    assert.deepEqual(sorted(R.edges()),[[1,0]]);
    assert.deepEqual(sorted(G.edges()),[[1,0]]);
  }
};

module.exports = BaseMultiDiGraphTester;
