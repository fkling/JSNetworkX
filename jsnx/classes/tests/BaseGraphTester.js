/*jshint strict:false, node:true*/

var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');
var h = require('../../../mocha/helper');


// Tests for data-structure independent graph class features.
var BaseGraphTester = {
  test_order: function() {
    var G = this.K3;
    // assert_equal(len(G), 3)
    assert.equal(G.order(), 3);
    assert.equal(G.number_of_nodes(), 3);
  },

  test_nodes_iter: function() {
    var G = this.K3;

    assert.deepEqual(h.sorted(G.nodes_iter()), this.k3nodes);
    assert.deepEqual(h.sorted(G.nodes_iter(true)), [[0,{}],[1,{}],[2,{}]]);
  },

  test_nodes: function() {
    var G = this.K3;

    assert.deepEqual(G.nodes().sort(), this.k3nodes);
    assert.deepEqual( G.nodes(true).sort(), [[0,{}],[1,{}],[2,{}]]);
  },

  test_has_node: function() {
    var G = this.K3;

    assert.ok(G.has_node(1));
    assert.ok(!G.has_node(4));
    assert.ok(!G.has_node([])); // no exception for nonhashable
    // objects are "hashable"
    // assert.ok(!G.has_node({1: 1})); // no exception for nonhashable
  },

  test_has_edge: function() {
    var G = this.K3;

    assert.ok(G.has_edge(0, 1));
    assert.ok(!G.has_edge(0, -1));
  },

  test_neighbours: function() {
    var G = this.K3;

    assert.deepEqual(G.neighbors(0).sort(), [1,2]);
    assert.throws(
      function() { G.neighbors(-1); },
      jsnx.JSNetworkxError
    );
  },

  test_neighbours_iter: function() {
    var G = this.K3;

    assert.deepEqual(h.sorted(G.neighbors_iter(0)), [1,2]);
    assert.throws(
      function() { G.neighbors_iter(-1); },
      jsnx.JSNetworkxError
    );
  },

  test_edges: function() {
    var G = this.K3;

    assert.deepEqual(h.sorted(G.edges()), [[0,1],[0,2],[1,2]]);
    assert.deepEqual(h.sorted(G.edges(0)), [[0,1],[0,2]]);
    assert.throws(
      function() { G.edges(-1); },
      jsnx.JSNetworkxError
    );
  },

  test_edges_iter: function() {
    var G = this.K3;

    assert.deepEqual(h.sorted(G.edges_iter()), [[0,1],[0,2],[1,2]]);
    assert.deepEqual(h.sorted(G.edges_iter(0)), [[0,1],[0,2]]);
    assert.throws(
      function() { h.sorted(G.edges_iter(-1)); },
      jsnx.JSNetworkxError
    );
  },

  test_adjacency_list: function() {
    var G = this.K3;
    assert.deepEqual(G.adjacency_list(), [[1,2],[0,2],[0,1]]);
  },

  test_degree: function() {
    var G = this.K3;

    assert.deepEqual(G.degree().values(), [2,2,2]);
    assert.deepEqual(G.degree(), new jsnx.Map([[0,2],[1,2],[2,2]]));
    assert.equal(G.degree(0), 2);
    assert.deepEqual(G.degree([0]), new jsnx.Map([[0,2]]));
    assert.throws(
      function() { G.degree(-1); },
      jsnx.JSNetworkxError
    );
  },

  test_weighted_degree: function() {
    var G = new this.Graph();
    G.add_edge(1,2,{weight: 2});
    G.add_edge(2,3,{weight: 3});

    assert.deepEqual(G.degree(null, 'weight').values(), [2,5,3]);
    assert.deepEqual(G.degree(null, 'weight'), new jsnx.Map([[1,2],[2,5],[3,3]]));
    assert.equal(G.degree(1, 'weight'), 2);
    assert.deepEqual(G.degree([1], 'weight'), new jsnx.Map([[1,2]]));
  },

  test_degree_iter: function() {
    var G = this.K3;

    assert.deepEqual(jsnx.toArray(G.degree_iter()), [[0,2],[1,2],[2,2]]);
    assert.deepEqual(
      new jsnx.Map(G.degree_iter()),
      new jsnx.Map([[0,2],[1,2],[2,2]])
    );
    assert.deepEqual(jsnx.toArray(G.degree_iter(0)), [[0,2]]);
  },

  test_size: function() {
    var G = this.K3;
    assert.equal(G.size(), 3);
    assert.equal(G.number_of_edges(), 3);
  },

  test_add_star: function() {
    var G = this.K3.copy();
    var nlist = [12,13,14,15];
    G.add_star(nlist);
    assert.deepEqual(h.sorted(G.edges(nlist)), [[12,13], [12,14], [12,15]]);
    G = this.K3.copy();
    G.add_star(nlist, {weight: 2});
    assert.deepEqual(
      h.sorted(G.edges(nlist, true)),
      [[12,13,{weight: 2}],[12,14,{weight:2}],[12,15,{weight:2}]]
    );
  },

  test_add_path: function() {
    var G = this.K3.copy();
    var nlist = [12,13,14,15];
    G.add_path(nlist);
    assert.deepEqual(h.sorted(G.edges(nlist)), [[12,13], [13,14], [14,15]]);
    G = this.K3.copy();
    G.add_path(nlist, {weight: 2});
    assert.deepEqual(
      h.sorted(G.edges(nlist, true)),
      [[12,13,{weight: 2}],[13,14,{weight:2}],[14,15,{weight:2}]]
    );
  },

  test_add_cycle: function() {
    var G = this.K3.copy();
    var nlist = [12,13,14,15];
    var oklists = [
        [[12,13], [12,15], [13,14], [14,15]],
        [[12,13], [13,14], [14, 15], [15,12]]
    ];
    G.add_cycle(nlist);
    assert.isOneOf(h.sorted(G.edges(nlist)), oklists);

    G = this.K3.copy();
    oklists = [ 
      [
        [12,13,{weight:1}],
        [12,15,{weight:1}],
        [13,14,{weight:1}],
        [14,15,{weight:1}]
      ],
      [
        [12,13,{weight:1}],
        [13,14,{weight:1}],
        [14,15,{weight:1}],
        [15,12,{weight:1}]
      ]
    ];
    G.add_cycle(nlist, {weight: 1});
    assert.isOneOf(h.sorted(G.edges(nlist, true)), oklists);
  },

  test_nbunch_iter: function() {
    var G = this.K3;
    assert.deepEqual(jsnx.toArray(G.nbunch_iter()), this.k3nodes); // all nodes
    assert.deepEqual(jsnx.toArray(G.nbunch_iter(0)), [0]); // single nodes
    assert.deepEqual(jsnx.toArray(G.nbunch_iter([0,1])), [0, 1]); // sequence
    // sequence with none in graph
    assert.deepEqual(jsnx.toArray(G.nbunch_iter([-1])), []);
    // string sequence with none in graph
    //assert.deepEqual(jsnx.toArray(G.nbunch_iter("foo")), []);
    // node not in graph doesn't get caught upon creation of iterator
    var bunch = G.nbunch_iter(-1);
    // but gets caught when iterator used
    assert.throws(function() { jsnx.toArray(bunch);}, jsnx.JSNetworkXError);
    // unhashable doesn't get caught upon creaton of iterator
    bunch = G.nbunch_iter([0,1,2,[]]);
    // there are no unhashable values
    // but gets caught when iterator hits the unhashable
    // assert.throws(function() { jsnx.toArray(bunch);}, jsnx.JSNetworkXError);
  },

  test_selfloop_degree: function() {
    var G = new this.Graph();
    G.add_edge(1,1);
    assert.deepEqual(G.degree().values(), [2]);
    assert.deepEqual(G.degree(), new jsnx.Map([[1,2]]));
    assert.equal(G.degree(1), 2);
    assert.deepEqual(G.degree([1]), new jsnx.Map([[1,2]]));
    assert.deepEqual(G.degree([1], 'weight'), new jsnx.Map([[1,2]]));
  },

  test_selfloops: function() {
    var G = this.K3.copy();
    G.add_edge(0, 0);
    assert.deepEqual(G.nodes_with_selfloops(), [0]);
    assert.deepEqual(G.selfloop_edges(), [[0,0]]);
    assert.equal(G.number_of_selfloops(), 1);
    G.remove_edge(0,0);
    G.add_edge(0, 0);
    G.remove_edges_from([[0,0]]);
    G.add_edge(1,1);
    G.remove_node(1);
    G.add_edge(0,0);
    G.add_edge(1,1);
    G.remove_nodes_from([0,1]);
  }
};

module.exports = BaseGraphTester;
