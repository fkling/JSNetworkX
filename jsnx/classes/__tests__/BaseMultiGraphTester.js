/*global assert, utils*/
'use strict';
import BaseAttrGraphTester from './BaseAttrGraphTester';
import shared from './shared';

import {MultiGraph, MultiDiGraph} from '../';

var Map = utils.Map;

var sharedMulti = {
  deepcopyEdgeAttr: function(H, G) {
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
    G.get(1).get(2)[0].foo.push(1);
    assert.notDeepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
  },

  shallowCopyEdgeAttr: function(H, G) {
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
    G.get(1).get(2)[0].foo.push(1);
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
  },

  sameAttrdict: function(H, G) {
    // same attrdict in the edgedata
    var oldFoo = H.get(1).get(2)[0].foo;
    H.addEdge(1,2,0,{foo: 'baz'});
    assert.deepEqual(G.edge, H.edge);
    H.addEdge(1,2,0,{foo: oldFoo});
    assert.deepEqual(G.edge, H.edge);
    // but not same edgedata dict
    H.addEdge(1,2,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);

    oldFoo = H.node.get(0).foo;
    H.node.get(0).foo = 'baz';
    assert.deepEqual(G.node, H.node);
    H.node.get(0).foo = oldFoo;
    assert.deepEqual(G.node, H.node);
  },

  differentAttrdict: function(H, G) {
    // used by graphEqualButDifferent
    var oldFoo = H.get(1).get(2)[0].foo;
    H.addEdge(1,2,0,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);
    H.addEdge(1,2,0,{foo: oldFoo});
    assert.deepEqual(G.edge, H.edge);

    var HH = H.copy();
    H.addEdge(1,2,{foo: 'baz'});
    assert.notDeepEqual(G.edge, H.edge);
    H = HH;

    oldFoo = H.node.get(0).foo;
    H.node.get(0).foo = 'baz';
    assert.notDeepEqual(G.node, H.node);
    H.node.get(0).foo = oldFoo;
    assert.deepEqual(G.node, H.node);
  }
};

var origShared;
export default Object.assign({}, BaseAttrGraphTester, {
  before: function() {
    // override multigraph methods
    origShared = Object.assign({}, shared);
    Object.assign(shared, sharedMulti);
  },

  after: function() {
    // restore original shared
    Object.assign(shared, origShared);
  },

  testHasEdge: function() {
    var G = this.K3;
    assert.equal(G.hasEdge(0, 1), true);
    assert.equal(G.hasEdge(0, -1), false);
    assert.equal(G.hasEdge(0, 1, 0), true);
    assert.equal(G.hasEdge(0, 1, 1), false);
  },

  testGetEdgeData: function() {
    var G = this.K3;
    assert.deepEqual(G.getEdgeData(0,1), {0: {}});
    assert.deepEqual(G.get(0).get(1), {0: {}});
    assert.deepEqual(G.get(0).get(1)[0], {});
    assert.equal(G.getEdgeData(10, 20), null);
    assert.deepEqual(G.getEdgeData(0, 1, 0), {});
  },

  testAdjacencyIter: function() {
    var G = this.K3;
    assert.deepEqual(
      Array.from(G.adjacencyIter()),
      [
        [0, new Map({1: {0: {}}, 2: {0: {}}})],
        [1, new Map({0: {0: {}}, 2: {0: {}}})],
        [2, new Map({0: {0: {}}, 1: {0: {}}})]
      ]
    );
  },

  testToUndirected: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = new MultiGraph(G);
    shared.isShallowCopy(H, G);
    H = G.toUndirected();
    shared.isDeepcopy(H, G);
  },

  testToDirected: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = new MultiDiGraph(G);
    shared.isShallowCopy(H, G);
    H = G.toDirected();
    shared.isDeepcopy(H, G);
  },

  testSelfloops: function() {
    var G = this.K3;
    G.addEdge(0, 0);
    assert.deepEqual(G.nodesWithSelfloops(), [0]);
    assert.deepEqual(G.selfloopEdges(), [[0,0]]);
    assert.deepEqual(G.selfloopEdges(true), [[0,0,{}]]);
    assert.equal(G.numberOfSelfloops(), 1);
  },

  testSelfloops2: function() {
    var G = this.K3;
    G.addEdge(0, 0);
    G.addEdge(0, 0);
    G.addEdge(0, 0, 'parallel edge');
    G.removeEdge(0, 0, 'parallel edge');
    assert.equal(G.numberOfEdges(0, 0), 2);
    G.removeEdge(0, 0);
    assert.equal(G.numberOfEdges(0, 0), 1);
  },

  testEdgeAttr4: function() {
    var G = new this.Graph();
    G.addEdge(1, 2, 0, {data: 7, spam: 'bar', bar: 'foo'});
    assert.deepEqual(G.edges(true), [[1,2,{data: 7, spam: 'bar', bar: 'foo'}]]);
    // OK to set data like this
    G.get(1).get(2)[0].data = 10;
    assert.deepEqual(
      G.edges(true),
      [[1,2,{data: 10, spam: 'bar', bar: 'foo'}]]
    );
    G.edge.get(1).get(2)[0].data = 20;
    assert.deepEqual(
      G.edges(true),
      [[1,2,{data: 20, spam: 'bar', bar: 'foo'}]]
    );
    G.edge.get(1).get(2)[0].listdata = [20, 200];
    G.edge.get(1).get(2)[0].weight = 20;
    assert.deepEqual(
      G.edges(true),
      [[
        1,
        2,
        {data: 20, spam: 'bar', bar: 'foo', listdata: [20, 200], weight: 20}
      ]]
    );
  }
});
