/*jshint strict:false, node:true*/
/*global utils, assert*/

var BaseAttrGraphTester = require('./BaseAttrGraphTester');
var Graph = require('../graph');
/*jshint ignore:start*/
var Map = utils.Map;
/*jshint ignore:end*/
var JSNetworkXError = require('../../exceptions/JSNetworkXError');
var KeyError = require('../../exceptions/KeyError');
var _ = require('lodash-node');

var sorted = function(iterator) {
  return utils.itertools.toArray(iterator).sort();
};

// Tests specific to dict-of-dict-of-dict graph data structure
exports.TestGraph = _.extend({}, BaseAttrGraphTester, {
  beforeEach: function() {
    var ed1 = {};
    var ed2 = {};
    var ed3 = {};
    this.Graph = Graph;
    // build dict-of-dict-of-dict K3
    this.k3adj = new Map([
      [0, new Map([[1, ed1], [2, ed2]])],
      [1, new Map([[0, ed1], [2, ed3]])],
      [2, new Map([[0, ed2], [1, ed3]])]
    ]);
    this.k3edges = [[0, 1], [0, 2], [1, 2]];
    this.k3nodes = [0, 1, 2];
    this.K3 = new this.Graph();

    this.K3.adj = this.K3.edge = this.k3adj;
    this.K3.node = new Map(
      [[0,{}], [1, {}], [2, {}]]
    );
  },

  test_data_input: function() {
    var G = new this.Graph(
      new Map([[1,[2]],[2,[1]]]),
      {name: "test"}
    );

    assert.deepEqual(
      sorted(G.adj.entries()),
      [[1, new Map([[2, {}]])], [2, new Map([[1,{}]])]]
    );
  },

  test_adjacency_iter: function() {
    var G = this.K3;

    assert.deepEqual(
      sorted(G.adjacency_iter()),
      [
        [0, new Map([[1,{}], [2,{}]])],
        [1, new Map([[0,{}], [2,{}]])],
        [2, new Map([[0,{}], [1,{}]])]
      ]
    );
  },

  test_getitem: function() {
    var G = this.K3;
    assert.deepEqual(G.get(0), new Map([[1,{}], [2,{}]]));
    assert.throws(function() { G.get('j'); }, KeyError);
    //  assert_raises((TypeError,networkx.NetworkXError), G.__getitem__, ['A'])
  },

  test_add_node: function() {
    var G = new this.Graph();
    G.add_node(0);
    assert.deepEqual(G.adj, new Map([[0, new Map()]]));
    // test add attributes
    G.add_node(1, {c: 'red'});
    G.add_node(2, {c: 'blue'});
    assert.throws(function() { G.add_node(4, []); }, JSNetworkXError);
    assert.throws(function() { G.add_node(4, 4); }, JSNetworkXError);
    assert.equal(G.node.get(1)['c'], 'red');
    assert.equal(G.node.get(2)['c'], 'blue');
    // test upding attributes
    G.add_node(1, {c: 'blue'});
    G.add_node(2, {c: 'red'});
    assert.equal(G.node.get(1)['c'], 'blue');
    assert.equal(G.node.get(2)['c'], 'red');
  },

  test_add_nodes_from: function() {
    var G = new this.Graph();
    G.add_nodes_from([0,1,2]);
    assert.deepEqual(
      G.adj,
      new Map([[0,new Map()], [1,new Map()], [2, new Map()]])
    );
    // test add attributes
    G.add_nodes_from([0,1,2], {c: 'red'});
    assert.equal(G.node.get(0)['c'], 'red');
    assert.equal(G.node.get(2)['c'], 'red');
    // test that attribute dicts are not the same
    assert.notEqual(G.node.get(0), G.node.get(1));
    // test updating attributes
    G.add_nodes_from([0,1,2], {c: 'blue'});
    assert.equal(G.node.get(0)['c'], 'blue');
    assert.equal(G.node.get(2)['c'], 'blue');
    assert.notEqual(G.node.get(0), G.node.get(1));

    // test tuple input
    var H = new this.Graph();
    H.add_nodes_from(G.nodes(true));
    assert.equal(H.node.get(0)['c'], 'blue');
    assert.equal(H.node.get(2)['c'], 'blue');
    assert.notEqual(H.node.get(0), H.node.get(1));
    // specific overrides general
    H.add_nodes_from([0, [1, {c: 'green'}], [3, {c: 'cyan'}]], {c: 'red'});
    assert.equal(H.node.get(0)['c'], 'red');
    assert.equal(H.node.get(1)['c'], 'green');
    assert.equal(H.node.get(2)['c'], 'blue');
    assert.equal(H.node.get(3)['c'], 'cyan');
  },

  test_remove_node: function() {
    var G = this.K3;
    G.remove_node(0);
    assert.deepEqual(
      G.adj,
      new Map([[1,new Map([[2,{}]])],[2,new Map([[1,{}]])]])
    );
    assert.throws(function() { G.remove_node(-1);}, JSNetworkXError);
  },

  test_remove_nodes_from: function() {
    var G = this.K3;
    G.remove_nodes_from([0,1]);
    assert.deepEqual(G.adj, new Map([[2, new Map()]]));
    assert.doesNotThrow(function() {G.remove_nodes_from([-1]);}); // silent fail
  },

  test_add_edge: function() {
    var G = new this.Graph();
    G.add_edge(0,1);
    assert.deepEqual(
      G.adj,
      new Map([[0, new Map([[1,{}]])], [1,new Map([[0,{}]])]])
    );
    G = new this.Graph();
    G.add_edge.apply(G, [0,1]); //  G.add_edge(*(0,1))
    assert.deepEqual(
      G.adj,
      new Map([[0, new Map([[1,{}]])], [1,new Map([[0,{}]])]])
    );
  },

  test_add_edges_from: function() {
    var G = new this.Graph();
    G.add_edges_from([[0,1],[0,2,{weight:3}]]);
    assert.deepEqual(
      G.adj,
      new Map([
        [0, new Map([[1,{}],[2,{weight:3}]])],
        [1, new Map([[0,{}]])],
        [2, new Map([[0,{weight:3}]])]
      ])
    );
    G.add_edges_from([[0,1],[0,2,{weight:3}],[1,2,{data:4}]], {data:2});
    assert.deepEqual(
      G.adj,
      new Map([
        [0, new Map([[1,{data:2}],[2,{data:2, weight:3}]])],
        [1, new Map([[0,{data:2}], [2, {data:4}]])],
        [2, new Map([[0,{weight:3, data:2}], [1,{data: 4}]])]
      ])
    );
    assert.throws(function() { G.add_edges_from([[0]]); }, JSNetworkXError);
    assert.throws(
      function() { G.add_edges_from([[0,1,2,3]]); },
      JSNetworkXError
    ); // too many in tuple

    // not a tuple
    assert.throws(function() { G.add_edges_from([0]); }, TypeError);
  },

  test_remove_edge: function() {
    var G = this.K3;
    G.remove_edge(0,1);
    assert.deepEqual(
      G.adj,
      new Map([
        [0,new Map([[2,{}]])],
        [1,new Map([[2,{}]])],
        [2,new Map([[0,{}], [1,{}]])]
      ])
    );
    assert.throws(function() { G.remove_edge(-1,0); }, JSNetworkXError);
  },

  test_remove_edges_from: function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    assert.deepEqual(
      G.adj,
      new Map([
        [0, new Map([[2,{}]])],
        [1, new Map([[2,{}]])],
        [2, new Map([[0,{}],[1,{}]])]
      ])
    );
    assert.doesNotThrow(function() {G.remove_edges_from([[0,0]]);}); // silent fail
  },

  test_clear: function() {
    var G = this.K3;
    G.clear();
    assert.deepEqual(G.adj, new Map());
  },

  test_edges_data: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edges(true)),
      [[0,1,{}], [0,2,{}], [1,2,{}]]
    );
    assert.deepEqual(
      sorted(G.edges(0, true)),
      [[0,1,{}], [0,2,{}]]
    );
    assert.throws(function() { G.edges(-1); }, JSNetworkXError);
  },

  test_get_edge_data: function() {
    var G = this.K3;
    assert.deepEqual(G.get_edge_data(0,1), {});
    assert.equal(G.get_edge_data(10,20), null);
    assert.equal(G.get_edge_data(-1,0), null);
    assert.equal(G.get_edge_data(-1,0,1), 1);
  }
});
