/*jshint node:true*/
"use strict";
var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');

module.exports = {
  add_attributes: function(G) {
    G.graph['foo'] = [];
    G.node.get(0)['foo'] = [];
    G.remove_edge(1,2);
    var ll = [];
    G.add_edge(1,2,{foo:ll});
    G.add_edge(2,1,{foo:ll});
    // must be dict
    assert.throws(
      function(){G.add_edge(0,1,[]);},
      jsnx.JSNetworkxError
    );
  },

  is_deepcopy: function(H, G) {
    this.graphs_equal(H, G);
    this.different_attrdict(H, G);
    this.deep_copy_attrdict(H, G);
  },

  deep_copy_attrdict: function(H, G) {
    this.deepcopy_graph_attr(H, G);
    this.deepcopy_node_attr(H, G);
    this.deepcopy_edge_attr(H, G);
  },

  deepcopy_graph_attr: function(H,G) {
    assert.deepEqual(G.graph['foo'], H.graph['foo']);
    G.graph['foo'].push(1);
    assert.notDeepEqual(G.graph['foo'], H.graph['foo']);
  },

  deepcopy_node_attr: function(H,G) {
    assert.deepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
    G.node.get(0)['foo'].push(1);
    assert.notDeepEqual(G.node.get(0)['foo'], H.node.get(0)['foo']);
  },

  deepcopy_edge_attr: function(H,G) {
    assert.deepEqual(G.get(1).get(2)['foo'], H.get(1).get(2)['foo']);
    G.get(1).get(2)['foo'].push(1);
    assert.notDeepEqual(G.get(1).get(2)['foo'], H.get(1).get(2)['foo']);
  },

  graphs_equal: function(H,G) {
    assert.deepEqual(G.adj,H.adj);
    assert.deepEqual(G.edge,H.edge);
    assert.deepEqual(G.node,H.node);
    assert.deepEqual(G.graph,H.graph);
    assert.deepEqual(G.name,H.name);
    if (!G.is_directed() && !H.is_directed()) {
      assert.strictEqual(H.adj.get(1).get(2), H.adj.get(2).get(1));
      assert.strictEqual(G.adj.get(1).get(2), G.adj.get(2).get(1));
    }
    else { // at least one is directed
      if (!G.is_directed()) {
        G.pred=G.adj;
        G.succ=G.adj;
      }
      if (!H.is_directed()) {
        H.pred=H.adj;
        H.succ=H.adj;
      }
      assert.deepEqual(G.pred,H.pred);
      assert.deepEqual(G.succ,H.succ);
      assert.strictEqual(H.succ.get(1).get(2), H.pred.get(2).get(1));
      assert.strictEqual(G.succ.get(1).get(2), G.pred.get(2).get(1));
    }
  },

  different_attrdict: function(H, G) {
    var old_foo = H.get(1).get(2)['foo'];
    H.add_edge(1,2,{foo:'baz'});
    assert.notDeepEqual(G.edge,H.edge);
    H.add_edge(1,2,{foo:old_foo});
    assert.deepEqual(G.edge,H.edge);
    old_foo = H.node.get(0)['foo'];
    H.node.get(0)['foo'] = 'baz';
    assert.notDeepEqual(G.node, H.node);
    H.node.get(0)['foo'] = old_foo;
    assert.deepEqual(G.node, H.node);
  },

  is_shallow_copy: function(H,G) {
      this.graphs_equal(H, G);
      this.different_attrdict(H, G);
      this.shallow_copy_attrdict(H, G );
  },

  shallow_copy_attrdict: function(H,G) {
    this.shallow_copy_graph_attr(H, G);
    this.shallow_copy_node_attr(H, G);
    this.shallow_copy_edge_attr(H, G);
  },

  shallow_copy_graph_attr: function(H,G) {
    assert.equal(G.graph['foo'], H.graph['foo']);
    G.graph['foo'].push(1);
    assert.deepEqual(G.graph['foo'],H.graph['foo']);
  },

  shallow_copy_node_attr: function(H,G) {
    assert.deepEqual(G.node.get(0)['foo'],H.node.get(0)['foo']);
    G.node.get(0)['foo'].push(1);
    assert.deepEqual(G.node.get(0)['foo'],H.node.get(0)['foo']);
  },

  shallow_copy_edge_attr: function(H,G) {
    assert.deepEqual(G.get(1).get(2)['foo'],H.get(1).get(2)['foo']);
    G.get(1).get(2)['foo'].push(1);
    assert.deepEqual(G.get(1).get(2)['foo'],H.get(1).get(2)['foo']);
  },

  same_attrdict: function(H, G) {
    var old_foo = H.get(1).get(2)['foo'];
    H.add_edge(1,2,{foo:'baz'});
    assert.deepEqual(G.edge,H.edge);
    H.add_edge(1,2,{foo:old_foo});
    assert.deepEqual(G.edge,H.edge);
    old_foo = H.node.get(0)['foo'];
    H.node.get(0)['foo'] = 'baz';
    assert.deepEqual(G.node,H.node);
    H.node.get(0)['foo'] = old_foo;
    assert.deepEqual(G.node,H.node);
  }
};
