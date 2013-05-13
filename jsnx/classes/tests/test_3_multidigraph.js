/*jshint strict:false, node:true*/

var BaseMultiDiGraphTester = require('./BaseMultiDiGraphTester');
var TestMultiGraph = require('./test_2_multigraph').TestMultiGraph;
var assert = require('assert');
var sorted = require('../../../mocha/helper').sorted;
var extend = require('../../../mocha/helper').extend;
var jsnx = require('../../../jsnetworkx-test');


exports.TestMultiDiGraph = extend({}, TestMultiGraph, BaseMultiDiGraphTester, {
  beforeEach: function() {
    this.Graph = jsnx.MultiDiGraph;
    // build K3
    this.k3edges = [[0, 1], [0, 2], [1, 2]];
    this.k3nodes = [0, 1, 2];
    this.K3 = this.Graph();
    this.K3.adj = 
      new jsnx.Map({0:new jsnx.Map(),1:new jsnx.Map(),2:new jsnx.Map()});
    this.K3.succ = this.K3.adj;
    this.K3.pred = 
      new jsnx.Map({0:new jsnx.Map(),1:new jsnx.Map(),2:new jsnx.Map()});
    this.k3nodes.forEach(function(u) {
      this.k3nodes.forEach(function(v) {
        if (v !== u) {
          var d = {0:{}};
          this.K3.succ.get(u).set(v, d);
          this.K3.pred.get(v).set(u, d);
        }
      }, this);
    }, this);

    this.K3.adj = this.K3.succ;
    this.K3.edge = this.K3.adj;
    this.K3.node = new jsnx.Map({0:{}, 1:{}, 2:{}});
  },

  test_add_edge: function() {
    var G = this.Graph();
    G.add_edge(0, 1);
    assert.deepEqual(
      G.adj,
      new jsnx.Map({0: new jsnx.Map({1: {0:{}}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({0: new jsnx.Map({1: {0:{}}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({0: new jsnx.Map(), 1: new jsnx.Map({0: {0:{}}})})
    );

    G = this.Graph();
    G.add_edge.apply(G, [0, 1]);
    assert.deepEqual(
      G.adj,
      new jsnx.Map({0: new jsnx.Map({1: {0:{}}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({0: new jsnx.Map({1: {0:{}}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({0: new jsnx.Map(), 1: new jsnx.Map({0: {0:{}}})})
    );
  },

  test_add_edges_from: function() {
    var G = this.Graph();
    G.add_edges_from([[0,1], [0,1, {weight:3}]]);
    assert.deepEqual(
      G.adj,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}, 1: {weight: 3}}}),
        1: new jsnx.Map()
      })
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}, 1: {weight: 3}}}),
        1: new jsnx.Map()
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map(),
        1: new jsnx.Map({0: {0:{}, 1: {weight: 3}}})
      })
    );

    G.add_edges_from([[0,1], [0,1, {weight:3}]], {weight:2});
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}, 1:{weight:3}, 2:{weight:2}, 3:{weight:3}}}),
        1: new jsnx.Map()
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map(),
        1: new jsnx.Map({0: {0:{}, 1:{weight:3}, 2:{weight:2}, 3:{weight:3}}})
      })
    );

    // too few in tuple
    assert.throws(function(){G.add_edges_from([[0]]);}, jsnx.JSNetworkxError);
    // too many in tuple
    assert.throws(
      function(){G.add_edges_from([[0,1,2,3,4]]);},
      jsnx.JSNetworkxError
    );
    assert.throws(function(){G.add_edges_from([0]);}, TypeError);
  },

  test_remove_edge: function() {
    var G = this.K3;
    G.remove_edge(0, 1);
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({2: {0: {}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1: {0: {}}, 2: {0:{}}}),
        1: new jsnx.Map({2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.throws(function(){G.remove_edge(-1, 0);}, jsnx.JSNetworkxError);
    assert.throws(function(){G.remove_edge(0, 2, 1);}, jsnx.JSNetworkxError);
  },

  test_remove_multiedge: function() {
    var G = this.K3;
    G.add_edge(0, 1, 'parallel edge');
    G.remove_edge(0, 1, 'parallel edge');
    assert.deepEqual(
      G.adj,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}}, 2: {0:{}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}}, 2: {0:{}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1: {0:{}}, 2: {0:{}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );

    G.remove_edge(0, 1);
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({2: {0: {}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1: {0: {}}, 2: {0:{}}}),
        1: new jsnx.Map({2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.throws(function(){G.remove_edge(-1, 0);}, jsnx.NetworkXError);
  },

  test_remove_edges_from: function() {
    var G = this.K3;
    G.remove_edges_from([[0, 1]]);
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({2: {0: {}}}),
        1: new jsnx.Map({0: {0:{}}, 2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1: {0: {}}, 2: {0:{}}}),
        1: new jsnx.Map({2: {0:{}}}),
        2: new jsnx.Map({0: {0:{}}, 1: {0:{}}})
      })
    );
    assert.doesNotThrow(function(){G.remove_edges_from([[0,0]]);}); // silent fail
  }
});
