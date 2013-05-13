/*jshint strict:false, node:true*/

var BaseGraphTester = require('./BaseGraphTester');
var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');
var h = require('../../../mocha/helper');

// Tests specific to dict-of-dict-of-dict graph data structure
var BaseDiGraphTester = h.extend({}, BaseGraphTester, {
  test_has_successor: function() {
    var G = this.K3;
    assert.ok(G.has_successor(0, 1));
    assert.ok(!G.has_successor(0, -1));
  },

  test_successors: function() {
    var G = this.K3;
    assert.deepEqual(h.sorted(G.successors(0)), [1,2]);
    assert.throws(function(){G.successors(-1);}, jsnx.JSNetworkXError);
  },

  test_successors_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.successors_iter(0))),
      [1,2]
    );
    assert.throws(function(){G.successors_iter(-1);}, jsnx.JSNetworkXError);
  },

  test_has_predecessor: function() {
    var G = this.K3;
    assert.ok(G.has_predecessor(0,1));
    assert.ok(!G.has_predecessor(0,-1));
  },

  test_predecessors: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(G.predecessors(0)),
      [1,2]
    );
    assert.throws(function(){G.predecessors(-1);}, jsnx.JSNetworkXError);
  },

  test_predecessors_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.predecessors_iter(0))),
      [1,2]
    );
    assert.throws(function(){G.predecessors_iter(-1);}, jsnx.JSNetworkXError);
  },

  test_edges: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(G.edges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      h.sorted(G.edges(0)),
      [[0,1], [0,2]]
    );
    assert.throws(function(){G.edges(-1);}, jsnx.JSNetworkXError);
  },

  test_edges_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.edges_iter())),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.edges_iter(0))),
      [[0,1], [0,2]]
    );
  },

  test_edges_data: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(G.edges(true)),
      [[0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
    assert.deepEqual(
      h.sorted(G.edges(0, true)),
      [[0,1,{}], [0,2,{}]]
    );
    assert.throws(function(){G.edges(-1);}, jsnx.JSNetworkXError);
  },

  test_out_edges: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(G.out_edges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      h.sorted(G.out_edges(0)),
      [[0,1], [0,2]]
    );
    assert.throws(function(){G.edges(-1);}, jsnx.JSNetworkXError);
  },

  test_out_edges_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.out_edges_iter())),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      h.sorted(jsnx.toArray(G.out_edges_iter(0))),
      [[0,1], [0,2]]
    );
  },

  test_out_edges_dir: function() {
    var G = this.P3;
    assert.deepEqual(h.sorted(G.out_edges()), [[0,1], [1,2]]);
    assert.deepEqual(h.sorted(G.out_edges(0)), [[0,1]]);
    assert.deepEqual(h.sorted(G.out_edges(2)), []);
  },

  test_out_edges_iter_dir: function() {
    var G = this.P3;
    assert.deepEqual(h.sorted(G.out_edges_iter()), [[0,1], [1,2]]);
    assert.deepEqual(h.sorted(G.out_edges_iter(0)), [[0,1]]);
    assert.deepEqual(h.sorted(G.out_edges_iter(2)), []);
  },

  test_in_edges_dir: function() {
    var G = this.P3;
    assert.deepEqual(h.sorted(G.in_edges()), [[0,1], [1,2]]);
    assert.deepEqual(h.sorted(G.in_edges(0)), []);
    assert.deepEqual(h.sorted(G.in_edges(2)), [[1,2]]);
  },

  test_in_edges_iter_dir: function() {
    var G = this.P3;
    assert.deepEqual(h.sorted(G.in_edges_iter()), [[0,1], [1,2]]);
    assert.deepEqual(h.sorted(G.in_edges_iter(0)), []);
    assert.deepEqual(h.sorted(G.in_edges_iter(2)), [[1,2]]);
  },

  test_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.degree().values(), [4,4,4]);
    assert.deepEqual(G.degree(), new jsnx.Map([[0,4], [1,4], [2,4]]));
    assert.strictEqual(G.degree(0), 4);
    assert.deepEqual(G.degree([0]), new jsnx.Map([[0,4]]));
    assert.throws(function(){G.degree(-1);}, jsnx.JSNetworkXError);
  },

  test_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(h.sorted(G.degree_iter()), [[0,4], [1,4], [2,4]]);
    assert.deepEqual(
      new jsnx.Map(G.degree_iter()),
      new jsnx.Map([[0,4], [1,4], [2,4]])
    );
    assert.deepEqual(jsnx.toArray(G.degree_iter(0)), [[0,4]]);
  },

  test_in_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.in_degree().values(), [2,2,2]);
    assert.deepEqual(G.in_degree(), new jsnx.Map([[0,2], [1,2], [2,2]]));
    assert.strictEqual(G.in_degree(0), 2);
    assert.deepEqual(G.in_degree([0]), new jsnx.Map([[0,2]]));
    assert.throws(function(){G.in_degree(-1);}, jsnx.JSNetworkXError);
  },

  test_in_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(h.sorted(G.in_degree_iter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new jsnx.Map(G.in_degree_iter()),
      new jsnx.Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(jsnx.toArray(G.in_degree_iter(0)), [[0,2]]);
  },

  test_in_degree_iter_weighted: function() {
    var G = this.K3;
    G.add_edge(0,1,{weight: 0.3, other: 1.2});
    assert.deepEqual(
      h.sorted(G.in_degree_iter(null, 'weight')),
      [[0,2], [1,1.3], [2,2]]
    );
    assert.deepEqual(
      new jsnx.Map(G.in_degree_iter(null, 'weight')),
      new jsnx.Map([[0,2], [1,1.3], [2,2]])
    );
    assert.deepEqual(
      jsnx.toArray(G.in_degree_iter(1, 'weight')),
      [[1,1.3]]
    );
    assert.deepEqual(
      h.sorted(G.in_degree_iter(null, 'other')),
      [[0,2], [1,2.2], [2,2]]
    );
    assert.deepEqual(
      new jsnx.Map(G.in_degree_iter(null, 'other')),
      new jsnx.Map([[0,2], [1,2.2], [2,2]])
    );
    assert.deepEqual(
      jsnx.toArray(G.in_degree_iter(1, 'other')),
      [[1,2.2]]
    );
  },

  test_out_degree: function() {
    var G = this.K3;
    assert.deepEqual(G.out_degree().values(), [2,2,2]);
    assert.deepEqual(G.out_degree(), new jsnx.Map([[0,2], [1,2], [2,2]]));
    assert.strictEqual(G.out_degree(0), 2);
    assert.deepEqual(G.out_degree([0]), new jsnx.Map([[0,2]]));
    assert.throws(function(){G.out_degree(-1);}, jsnx.JSNetworkXError);
  },

  test_out_degree_iter: function() {
    var G = this.K3;
    assert.deepEqual(h.sorted(G.out_degree_iter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new jsnx.Map(G.out_degree_iter()),
      new jsnx.Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(jsnx.toArray(G.out_degree_iter(0)), [[0,2]]);
  },

  test_out_degree_iter_weighted: function() {
    var G = this.K3;
    G.add_edge(0,1,{weight: 0.3, other: 1.2});
    assert.deepEqual(
      h.sorted(G.out_degree_iter(null, 'weight')),
      [[0,1.3], [1,2], [2,2]]
    );
    assert.deepEqual(
      new jsnx.Map(G.out_degree_iter(null, 'weight')),
      new jsnx.Map([[0,1.3], [1,2], [2,2]])
    );
    assert.deepEqual(
      jsnx.toArray(G.out_degree_iter(0, 'weight')),
      [[0,1.3]]
    );
    assert.deepEqual(
      h.sorted(G.out_degree_iter(null, 'other')),
      [[0,2.2], [1,2], [2,2]]
    );
    assert.deepEqual(
      new jsnx.Map(G.out_degree_iter(null, 'other')),
      new jsnx.Map([[0,2.2], [1,2], [2,2]])
    );
    assert.deepEqual(
      jsnx.toArray(G.out_degree_iter(0, 'other')),
      [[0,2.2]]
    );
  },

  test_size: function() {
    var G = this.K3;
    assert.strictEqual(G.size(), 6);
    assert.strictEqual(G.number_of_edges(), 6);
  },

  test_to_undirected_reciprocal: function() {
    var G = this.Graph();
    G.add_edge(1,2);
    assert.ok(G.to_undirected().has_edge(1,2));
    assert.ok(!G.to_undirected(true).has_edge(1,2));
    G.add_edge(2,1);
    assert.ok(G.to_undirected(true).has_edge(1,2));
  },

  test_reverse_copy: function() {
    var G = jsnx.DiGraph([[0,1],[1,2]]);
    var R = G.reverse();
    assert.deepEqual(h.sorted(R.edges()), [[1,0], [2,1]]);
    R.remove_edge(1,0);
    assert.deepEqual(h.sorted(R.edges()), [[2,1]]);
    assert.deepEqual(h.sorted(G.edges()), [[0,1], [1,2]]);
  },

  test_reverse_nocopy: function() {
    var G = jsnx.DiGraph([[0,1],[1,2]]);
    var R = G.reverse(false);
    assert.deepEqual(h.sorted(R.edges()), [[1,0], [2,1]]);
    R.remove_edge(1,0);
    assert.deepEqual(h.sorted(R.edges()), [[2,1]]);
    assert.deepEqual(h.sorted(G.edges()), [[2,1]]);
  }
});

module.exports = BaseDiGraphTester;
