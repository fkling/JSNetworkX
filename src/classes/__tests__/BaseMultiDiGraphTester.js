/*global assert, utils*/
'use strict';

import BaseMultiGraphTester from './BaseMultiGraphTester';
import {MultiGraph, MultiDiGraph} from '../';
import {JSNetworkxError} from '../../exceptions';
import shared from './shared';

var Map = utils.Map;

function sorted(value) {
  return Array.from(value).sort();
}

var sharedMultiDigraph = {
  isShallow: function(H, G) {
    // graph
    assert.deepEqual(G.graph.foo, H.graph.foo);
    G.graph.foo.push(1);
    assert.deepEqual(G.graph.foo, H.graph.foo);
    // node
    assert.deepEqual(G.node.get(0).foo, H.node.get(0).foo);
    G.node.get(0).foo.push(1);
    assert.deepEqual(G.node.get(0).foo, H.node.get(0).foo);
    // edge
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
    G.get(1).get(2)[0].foo.push(1);
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
  },

  isDeep: function(H, G) {
    // graph
    assert.deepEqual(G.graph.foo, H.graph.foo);
    G.graph.foo.push(1);
    assert.notDeepEqual(G.graph.foo, H.graph.foo);
    // node
    assert.deepEqual(G.node.get(0).foo, H.node.get(0).foo);
    G.node.get(0).foo.push(1);
    assert.notDeepEqual(G.node.get(0).foo, H.node.get(0).foo);
    // edge
    assert.deepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
    G.get(1).get(2)[0].foo.push(1);
    assert.notDeepEqual(G.get(1).get(2)[0].foo, H.get(1).get(2)[0].foo);
  }
};

export default Object.assign({}, BaseMultiGraphTester, {
  testEdges: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.edges(0)),[[0,1], [0,2]]);
    assert.throws(() => G.edges(-1), JSNetworkxError);
  },

  testEdgesData: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edges(true)),
      [[0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
    assert.deepEqual(sorted(G.edges(0, true)),[[0,1,{}], [0,2,{}]]);
    assert.throws(() => G.neighbors(-1), JSNetworkxError);
  },

  testEdgesIter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.edgesIter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.edgesIter(0)),[[0,1], [0,2]]);
    G.addEdge(0, 1);
    assert.deepEqual(
      sorted(G.edgesIter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
  },

  testOutEdges: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.outEdges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.outEdges(0)),[[0,1], [0,2]]);
    assert.throws(() => G.outEdges(-1), JSNetworkxError);
    assert.deepEqual(sorted(G.outEdges(0, false, true)),[[0,1,0], [0,2,0]]);
  },

  testOutEdgesIter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.outEdgesIter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.outEdgesIter(0)),[[0,1], [0,2]]);
    G.addEdge(0, 1, 2);
    assert.deepEqual(
      sorted(G.edgesIter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
  },

  testInEdges: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.inEdges()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.inEdges(0)),[[1,0], [2,0]]);
    G.addEdge(0, 1, 2);
    assert.deepEqual(
      sorted(G.inEdges()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      sorted(G.inEdges(0, false, true)),
      [[1,0,0], [2,0,0]]
    );
  },

  testInEdgesIter: function() {
    var G = this.K3;
    assert.deepEqual(
      sorted(G.inEdgesIter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(sorted(G.inEdgesIter(0)),[[1,0], [2,0]]);
    G.addEdge(0, 1, 2);
    assert.deepEqual(
      sorted(G.inEdgesIter()),
      [[0,1], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      sorted(G.inEdges(true)),
      [[0,1,{}], [0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
  },

  testToUndirected: function() {
    // MultiDiGraph -> MultiGraph changes number of edges so it is
    // not a copy operation... use isShallow, not isShallowCopy
    var G = this.K3;
    shared.addAttributes(G);
    var H = new MultiGraph(G);
    sharedMultiDigraph.isShallow(H, G);
    H = G.toUndirected();
    sharedMultiDigraph.isDeep(H, G);
  },

  testHasSuccessor: function() {
    var G = this.K3;
    assert.equal(G.hasSuccessor(0, 1), true);
    assert.equal(G.hasSuccessor(0, -1), false);
  },

  testSuccessors: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.successors(0)), [1,2]);
    assert.throws(() => G.successors(-1), JSNetworkxError);
  },

  testSuccessorsIter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.successorsIter(0)), [1,2]);
    assert.throws(() => G.successorsIter(-1), JSNetworkxError);
  },

  testHasPredecessor: function() {
    var G = this.K3;
    assert.equal(G.hasPredecessor(0, 1), true);
    assert.equal(G.hasPredecessor(0, -1), false);
  },

  testPredecessors: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.predecessors(0)), [1,2]);
    assert.throws(() => G.predecessors(-1), JSNetworkxError);
  },

  testPredecessorsIter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.predecessorsIter(0)), [1,2]);
    assert.throws(() => G.predecessorsIter(-1), JSNetworkxError);
  },

  testDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.degree().values()), [4,4,4]);
    assert.deepEqual(G.degree(), new Map({0: 4, 1: 4, 2: 4}));
    assert.equal(G.degree(0), 4);
    assert.deepEqual(G.degree([0]), new Map({0: 4}));
    assert.throws(() => G.degree(-1), JSNetworkxError);
  },

  testDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.degreeIter()), [[0,4], [1,4], [2,4]]);
    assert.deepEqual(
      new Map(G.degreeIter()),
      new Map([[0,4], [1,4], [2,4]])
    );
    assert.deepEqual(sorted(G.degreeIter(0)), [[0,4]]);
    G.addEdge(0,1,{weight: 0.3, other: 1.2});
    assert.deepEqual(
      sorted(G.degreeIter(null, 'weight')),
      [[0,4.3], [1,4.3], [2,4]]
    );
    assert.deepEqual(
      sorted(G.degreeIter(null, 'other')),
      [[0,5.2], [1,5.2], [2,4]]
    );
  },

  testInDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.inDegree().values()), [2,2,2]);
    assert.deepEqual(G.inDegree(), new Map({0: 2, 1: 2, 2: 2}));
    assert.equal(G.inDegree(0), 2);
    assert.deepEqual(G.inDegree([0]), new Map({0: 2}));
    assert.throws(() => G.inDegree(-1), JSNetworkxError);
  },

  testInDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.inDegreeIter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new Map(G.inDegreeIter()),
      new Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(sorted(G.inDegreeIter(0)), [[0,2]]);
    assert.deepEqual(sorted(G.inDegreeIter(0, 'weight')), [[0,2]]);
  },

  testOutDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.outDegree().values()), [2,2,2]);
    assert.deepEqual(G.outDegree(), new Map({0: 2, 1: 2, 2: 2}));
    assert.equal(G.outDegree(0), 2);
    assert.deepEqual(G.outDegree([0]), new Map({0: 2}));
    assert.throws(() => G.outDegree(-1), JSNetworkxError);
  },

  testOutDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(sorted(G.outDegreeIter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new Map(G.outDegreeIter()),
      new Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(sorted(G.outDegreeIter(0)), [[0,2]]);
    assert.deepEqual(sorted(G.outDegreeIter(0, 'weight')), [[0,2]]);
  },

  testSize: function() {
    var G = this.K3;
    assert.equal(G.size(), 6);
    assert.equal(G.numberOfEdges(), 6);
    G.addEdge(0, 1, {weight: 0.3, other: 1.2});
    assert.equal(G.size('weight'), 6.3);
    assert.equal(G.size('other'), 7.2);
  },

  testToUndirectedReciprocal: function() {
    var G = new this.Graph();
    G.addEdge(1,2);
    assert.equal(G.toUndirected().hasEdge(1,2), true);
    assert.equal(G.toUndirected(true).hasEdge(1,2), false);
    G.addEdge(2,1);
    assert.equal(G.toUndirected(true).hasEdge(1,2), true);
  },

  testReverseCopy: function() {
    var G = new MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse();
    assert.deepEqual(sorted(R.edges()),[[1,0],[1,0]]);
    R.removeEdge(1,0);
    assert.deepEqual(sorted(R.edges()),[[1,0]]);
    assert.deepEqual(sorted(G.edges()),[[0,1],[0,1]]);
  },

  testReverseNocopy: function() {
    var G = new MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse(false);
    assert.deepEqual(sorted(R.edges()),[[1,0],[1,0]]);
    R.removeEdge(1,0);
    assert.deepEqual(sorted(R.edges()),[[1,0]]);
    assert.deepEqual(sorted(G.edges()),[[1,0]]);
  }
});
