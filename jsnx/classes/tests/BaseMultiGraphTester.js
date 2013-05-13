/*jshint strict:false, node:true*/

var BaseAttrGraphTester = require('./BaseAttrGraphTester');
var assert = require('assert');
var h = require('../../../mocha/helper');
var shared = require('./shared');
var jsnx = require('../../../jsnetworkx-test');


var shared_multi = {
  deepcopy_edge_attr: function(H, G) {
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
    G.get(1).get(2)[0]['foo'].push(1);
    assert.notDeepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
  },

  shallow_copy_edge_attr: function(H, G) {
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
    G.get(1).get(2)[0]['foo'].push(1);
    assert.deepEqual(G.get(1).get(2)[0]['foo'], H.get(1).get(2)[0]['foo']);
  },

  same_attrdict: function(H, G) {
    // same attrdict in the edgedata
    var old_foo = H.get(1).get(2)[0]['foo'];
    H.add_edge(1,2,0,{foo: 'baz'});
    assert.deepEqual(G.edge, H.edge);
    H.add_edge(1,2,0,{foo: old_foo});
    assert.deepEqual(G.edge, H.edge);
    // but not same edgedata dict
    H.add_edge(1,2,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);

    old_foo = H.node.get(0)['foo'];
    H.node.get(0)['foo'] = 'baz';
    assert.deepEqual(G.node, H.node);
    H.node.get(0)['foo'] = old_foo;
    assert.deepEqual(G.node, H.node);
  },

  different_attrdict: function(H, G) {
    // used by graph_equal_but_different
    var old_foo = H.get(1).get(2)[0]['foo'];
    H.add_edge(1,2,0,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);
    H.add_edge(1,2,0,{foo: old_foo});
    assert.deepEqual(G.edge, H.edge);

    var HH = H.copy(); 
    H.add_edge(1,2,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);
    H = HH;

    old_foo = H.node.get(0)['foo'];
    H.node.get(0)['foo'] = 'baz';
    assert.notDeepEqual(G.node, H.node);
    H.node.get(0)['foo'] = old_foo;
    assert.deepEqual(G.node, H.node);
  }
};

var orig_shared;
var BaseMultiGraphTester = h.extend({}, BaseAttrGraphTester, {
  before: function() {
    // override multigraph methods
    orig_shared = h.extend({}, shared);
    h.extend(shared, shared_multi);
  },

  after: function() {
    // restore original shared
    h.extend(shared, orig_shared);
  },

  test_has_edge: function() {
    var G = this.K3;
    assert.equal(G.has_edge(0, 1), true);
    assert.equal(G.has_edge(0, -1), false);
    assert.equal(G.has_edge(0, 1, 0), true);
    assert.equal(G.has_edge(0, 1, 1), false);
  },

  test_get_edge_data: function() {
    var G = this.K3;
    assert.deepEqual(G.get_edge_data(0,1), {0:{}});
    assert.deepEqual(G.get(0).get(1), {0:{}});
    assert.deepEqual(G.get(0).get(1)[0], {});
    assert.equal(G.get_edge_data(10, 20), null);
    assert.deepEqual(G.get_edge_data(0, 1, 0), {});
  },

  test_adjacency_iter: function() {
    var G = this.K3;
    assert.deepEqual(
      h.sorted(G.adjacency_iter()),
      [
        [0, new jsnx.Map({1: {0:{}}, 2: {0:{}}})],
        [1, new jsnx.Map({0: {0:{}}, 2: {0:{}}})],
        [2, new jsnx.Map({0: {0:{}}, 1: {0:{}}})]
      ]
    );
  },

  test_to_undirected: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = jsnx.MultiGraph(G);
    shared.is_shallow_copy(H, G);
    H = G.to_undirected();
    shared.is_deepcopy(H, G);
  },

  test_to_directed: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = jsnx.MultiDiGraph(G);
    shared.is_shallow_copy(H, G);
    H = G.to_directed();
    shared.is_deepcopy(H, G);
  },

  test_selfloops: function() {
    var G = this.K3;
    G.add_edge(0, 0);
    assert.deepEqual(G.nodes_with_selfloops(), [0]);
    assert.deepEqual(G.selfloop_edges(), [[0,0]]);
    assert.deepEqual(G.selfloop_edges(true), [[0,0,{}]]);
    assert.equal(G.number_of_selfloops(), 1);
  },

  test_selfloops2: function() {
    var G = this.K3;
    G.add_edge(0, 0);
    G.add_edge(0, 0);
    G.add_edge(0, 0, 'parallel edge');
    G.remove_edge(0, 0, 'parallel edge');
    assert.equal(G.number_of_edges(0, 0), 2);
    G.remove_edge(0, 0);
    assert.equal(G.number_of_edges(0, 0), 1);
  },

  test_edge_attr4: function() {
    var G = this.Graph();
    G.add_edge(1, 2, 0, {data: 7, spam: 'bar', bar: 'foo'});
    assert.deepEqual(G.edges(true), [[1,2,{data: 7, spam: 'bar', bar: 'foo'}]]);
    // OK to set data like this
    G.get(1).get(2)[0]['data'] = 10;
    assert.deepEqual(G.edges(true), [[1,2,{data: 10, spam: 'bar', bar: 'foo'}]]);
    G.edge.get(1).get(2)[0]['data'] = 20;
    assert.deepEqual(G.edges(true), [[1,2,{data: 20, spam: 'bar', bar: 'foo'}]]);
    G.edge.get(1).get(2)[0]['listdata'] = [20, 200];
    G.edge.get(1).get(2)[0]['weight'] = 20;
    assert.deepEqual(
      G.edges(true),
      [[1,2,{data:20, spam:'bar', bar:'foo', listdata:[20, 200], weight:20}]]
    );
  }
});

module.exports = BaseMultiGraphTester;
