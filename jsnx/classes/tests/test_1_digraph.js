/*jshint strict:false, node:true*/

var TestGraph = require('./test_0_graph.js').TestGraph;
var BaseDiGraphTester = require('./BaseDiGraphTester');
var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');
var h = require('../../../mocha/helper');

exports.TestDiGraph = h.extend({}, TestGraph, BaseDiGraphTester, {
  beforeEach: function() {
    this.Graph = jsnx.DiGraph;

    var ed1 = {};
    var ed2 = {};
    var ed3 = {};
    var ed4 = {};
    var ed5 = {};
    var ed6 = {};

    this.k3adj = new jsnx.Map([
      [0, new jsnx.Map([[1,ed1], [2, ed2]])],
      [1, new jsnx.Map([[0,ed3], [2, ed4]])],
      [2, new jsnx.Map([[0,ed5], [1, ed6]])]
    ]);
    this.k3edges = [[0,1], [0,2], [1,2]];
    this.k3nodes = [0,1,2];
    this.K3 = new this.Graph();
    this.K3.adj = this.K3.succ = this.K3.edge = this.k3adj;
    this.K3.pred = new jsnx.Map([
      [0, new jsnx.Map([[1,ed3], [2, ed5]])],
      [1, new jsnx.Map([[0,ed1], [2, ed6]])],
      [2, new jsnx.Map([[0,ed2], [1, ed4]])]
    ]);

    ed1 = {};
    ed2 = {};
    this.P3 = new this.Graph();
    this.P3.adj = new jsnx.Map([
      [0, new jsnx.Map([[1,ed1]])],
      [1, new jsnx.Map([[2,ed2]])],
      [2, new jsnx.Map()]
    ]);
    this.P3.succ = this.P3.adj;
    this.P3.pred = new jsnx.Map([
      [0, new jsnx.Map()],
      [1, new jsnx.Map([[0,ed1]])],
      [2, new jsnx.Map([[1,ed2]])]
    ]);

    this.K3.node = new jsnx.Map([[0,{}], [1, {}], [2, {}]]);
  },

  test_data_input: function() {
    var G = this.Graph(new jsnx.Map([[1,[2]], [2, [1]]]), {name: 'test'});
    assert.equal(G.name(), 'test');
    assert.deepEqual(
      h.sorted(G.adj.items()),
      [[1, new jsnx.Map([[2,{}]])], [2, new jsnx.Map([[1,{}]])]]
    );
    assert.deepEqual(
      h.sorted(G.succ.items()),
      [[1, new jsnx.Map([[2,{}]])], [2, new jsnx.Map([[1,{}]])]]
    );
    assert.deepEqual(
      h.sorted(G.pred.items()),
      [[1, new jsnx.Map([[2,{}]])], [2, new jsnx.Map([[1,{}]])]]
    );
  },

  test_add_edge: function() {
    var G = this.Graph();
    G.add_edge(0,1);
    assert.deepEqual(
      G.adj,
      new jsnx.Map({0: new jsnx.Map({1:{}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({0: new jsnx.Map({1:{}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({0: new jsnx.Map(), 1: new jsnx.Map({0:{}})})
    );

    G = this.Graph();
    G.add_edge.apply(G, [0,1]); // tuple unpacking
    assert.deepEqual(
      G.adj,
      new jsnx.Map({0: new jsnx.Map({1:{}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({0: new jsnx.Map({1:{}}), 1: new jsnx.Map()})
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({0: new jsnx.Map(), 1: new jsnx.Map({0:{}})})
    );
  },

  test_add_edges_from: function() {
    var G = this.Graph();
    G.add_edges_from([[0,1], [0,2, {data: 3}]], {data: 2});

    assert.deepEqual(
      G.adj,
      new jsnx.Map({
        0: new jsnx.Map({1: {data:2}, 2: {data: 3}}),
        1: new jsnx.Map(),
        2: new jsnx.Map()})
    );
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({1: {data:2}, 2: {data: 3}}),
        1: new jsnx.Map(),
        2: new jsnx.Map()})
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map(),
        1: new jsnx.Map({0: {data:2}}),
        2: new jsnx.Map({0: {data:3}})
      })
    );

    // too few in tuple
    assert.throws(function(){G.add_edges_from([[0]]);}, jsnx.NetworkXError);
    // too many in tuple
    assert.throws(
      function(){G.add_edges_from([[0,1,2,3]]);},
      jsnx.NetworkXError
    );
    // not a tuple
    assert.throws(function(){G.add_edges_from([0]);}, TypeError);
  },

  test_remove_edge: function() {
    var G = this.K3;
    G.remove_edge(0,1);
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({2:{}}),
        1: new jsnx.Map({0:{}, 2:{}}),
        2: new jsnx.Map({0:{}, 1:{}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1:{}, 2:{}}),
        1: new jsnx.Map({2:{}}),
        2: new jsnx.Map({0:{}, 1:{}})
      })
    );
    assert.throws(function(){G.remove_edge(-1, 0);}, jsnx.KeyError);
  },

  test_remove_edges_from: function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    assert.deepEqual(
      G.succ,
      new jsnx.Map({
        0: new jsnx.Map({2:{}}),
        1: new jsnx.Map({0:{}, 2:{}}),
        2: new jsnx.Map({0:{}, 1:{}})
      })
    );
    assert.deepEqual(
      G.pred,
      new jsnx.Map({
        0: new jsnx.Map({1:{}, 2:{}}),
        1: new jsnx.Map({2:{}}),
        2: new jsnx.Map({0:{}, 1:{}})
      })
    );
    assert.doesNotThrow(function(){G.remove_edges_from([[0,0]]);});
  }
});
