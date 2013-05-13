/*jshint strict:false, node:true*/

var BaseMultiGraphTester = require('./BaseMultiGraphTester');
var TestGraph = require('./test_0_graph').TestGraph;
var assert = require('assert');
var h = require('../../../mocha/helper');
var shared = require('./shared');
var jsnx = require('../../../jsnetworkx-test');

exports.TestMultiGraph = h.extend({}, TestGraph, BaseMultiGraphTester, {
  beforeEach: function() {
    this.Graph = jsnx.MultiGraph;
    var ed1 = {0: {}};
    var ed2 = {0: {}};
    var ed3 = {0: {}};
    this.k3adj = new jsnx.Map({
      0: new jsnx.Map({1: ed1, 2: ed2}),
      1: new jsnx.Map({0: ed1, 2: ed3}),
      2: new jsnx.Map({0: ed2, 1: ed3})
    });
    this.k3edges = [[0,1], [0,2], [1,2]];
    this.k3nodes = [0,1,2];
    this.K3 = this.Graph();
    this.K3.adj = this.K3.edge = this.k3adj;
    this.K3.node = new jsnx.Map({0:{}, 1:{}, 2:{}});
  },

  test_data_input: function() {
    var G = this.Graph({1: [2], 2: [1]}, {name: 'test'});
    assert.equal(G.name(), 'test');
    assert.deepEqual(
      h.sorted(G.adj.items()),
      [
        [1, new jsnx.Map({2: {0:{}}})],
        [2, new jsnx.Map({1: {0:{}}})]
      ]
    );
  },

  test_getitem: function() {
    var G = this.K3;
    assert.deepEqual(G.get(0), new jsnx.Map({1: {0:{}}, 2: {0:{}}}));
    assert.throws(function(){G.get('j');}, jsnx.KeyError);
    // not implemented:
    // assert.throws(function(){G.get(['A']);}, TypeError);
  },

  test_remove_node: function() {
    var G = this.K3;
    G.remove_node(0);
    assert.deepEqual(G.adj, new jsnx.Map({
      1: new jsnx.Map({2: {0:{}}}),
      2: new jsnx.Map({1: {0:{}}})
    }));
    assert.throws(function(){G.remove_node(-1);}, jsnx.JSNetworkXError);
  },

  test_add_edge: function() {
    var G = this.Graph();
    G.add_edge(0,1);
    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({1: {0:{}}}),
      1: new jsnx.Map({0: {0:{}}})
    }));
    G = this.Graph();
    G.add_edge.apply(G, [0,1]);
    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({1: {0:{}}}),
      1: new jsnx.Map({0: {0:{}}})
    }));
  },

  test_add_edge_conflicting_key: function() {
    var G = this.Graph();
    G.add_edge(0, 1, 1);
    G.add_edge(0, 1);
    assert.equal(G.number_of_edges(), 2);
    G = this.Graph();
    G.add_edges_from([[0,1,1,{}]]);
    G.add_edges_from([[0,1]]);
    assert.equal(G.number_of_edges(), 2);
  },

  test_add_edges_from: function() {
    var G = this.Graph();
    G.add_edges_from([[0,1], [0,1, {weight: 3}]]);
    assert.deepEqual(
      G.adj,
      new jsnx.Map({
        0: new jsnx.Map({1: {0: {}, 1: {weight: 3}}}),
        1: new jsnx.Map({0: {0: {}, 1: {weight: 3}}})
      })
    );
    G.add_edges_from([[0,1], [0,1, {weight: 3}]], {weight: 2});
    assert.deepEqual(
      G.adj,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}, 1:{weight: 3}, 2:{weight: 2}, 3:{weight: 3}}}),
        1: new jsnx.Map({0: {0:{}, 1:{weight: 3}, 2:{weight: 2}, 3:{weight: 3}}})
      })
    );

    // too few in tuple
    assert.throws(function(){G.add_edges_from([[0]]);}, jsnx.NetworkXError);
    // too many in tuple
    assert.throws(function(){G.add_edges_from([[0,1,2,3,4]]);}, jsnx.NetworkXError);
    // not a tuple
    assert.throws(function(){G.add_edges_from([0]);}, TypeError);
  },

  test_remove_edge: function() {
    var G = this.K3;
    G.remove_edge(0,1);
    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({2: {0:{}}}),
      1: new jsnx.Map({2: {0:{}}}),
      2: new jsnx.Map({0: {0:{}}, 1: {0: {}}})
    }));
    assert.throws(function(){G.remove_edge(-1,0);}, jsnx.JSNetworkXError);
    assert.throws(function(){G.remove_edge(0,2,1);}, jsnx.JSNetworkXError);
  },

  test_remove_edges_from: function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({2: {0:{}}}),
      1: new jsnx.Map({2: {0:{}}}),
      2: new jsnx.Map({0: {0:{}}, 1: {0: {}}})
    }));
    assert.doesNotThrow(function(){G.remove_edges_from([[0,0]]);});
  },

  test_remove_multiedge: function() {
    var G = this.K3;
    G.add_edge(0, 1, 'parallel edge');
    G.remove_edge(0, 1, 'parallel edge');

    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({1: {0:{}}, 2: {0:{}}}),
      1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
      2: new jsnx.Map({0: {0:{}}, 1: {0: {}}})
    }));
    G.remove_edge(0, 1);
    assert.deepEqual(G.adj, new jsnx.Map({
      0: new jsnx.Map({2: {0:{}}}),
      1: new jsnx.Map({2: {0:{}}}),
      2: new jsnx.Map({0: {0:{}}, 1: {0: {}}})
    }));
    assert.throws(function(){G.remove_edge(-1,0);}, jsnx.JSNetworkXError);
  }
});
