/*global assert, utils*/
'use strict';

import BaseGraphTester from './BaseGraphTester';
import DiGraph from '../DiGraph';
var Map = utils.Map;
import JSNetworkXError from '../../exceptions/JSNetworkXError';

import _ from 'lodash';

// Tests specific to dict-of-dict-of-dict graph data structure
export default _.extend({}, BaseGraphTester, {
  testHasSuccessor: function() {
    var G = this.K3;
    assert.ok(G.hasSuccessor(0, 1));
    assert.ok(!G.hasSuccessor(0, -1));
  },

  testSuccessors: function() {
    var G = this.K3;
    assert.deepEqual(G.successors(0), [1,2]);
    assert.throws(() => G.successors(-1), JSNetworkXError);
  },

  testSuccessorsIter: function() {
    var G = this.K3;
    assert.deepEqual(
      Array.from(G.successorsIter(0)),
      [1,2]
    );
    assert.throws(() => G.successorsIter(-1), JSNetworkXError);
  },

  testHasPredecessor: function() {
    var G = this.K3;
    assert.ok(G.hasPredecessor(0,1));
    assert.ok(!G.hasPredecessor(0,-1));
  },

  testPredecessors: function() {
    var G = this.K3;
    assert.deepEqual(
      G.predecessors(0),
      [1,2]
    );
    assert.throws(() => G.predecessors(-1), JSNetworkXError);
  },

  testPredecessorsIter: function() {
    var G = this.K3;
    assert.deepEqual(
      Array.from(G.predecessorsIter(0)),
      [1,2]
    );
    assert.throws(() => G.predecessorsIter(-1), JSNetworkXError);
  },

  testEdges: function() {
    var G = this.K3;
    assert.deepEqual(
      G.edges(),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      G.edges(0),
      [[0,1], [0,2]]
    );
    assert.throws(() => G.edges(-1), JSNetworkXError);
  },

  testEdgesIter: function() {
    var G = this.K3;
    assert.deepEqual(
      Array.from(G.edgesIter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      Array.from(G.edgesIter(0)),
      [[0,1], [0,2]]
    );
  },

  testEdgesData: function() {
    var G = this.K3;
    assert.deepEqual(
      G.edges(true),
      [[0,1,{}], [0,2,{}], [1,0,{}], [1,2,{}], [2,0,{}], [2,1,{}]]
    );
    assert.deepEqual(
      G.edges(0, true),
      [[0,1,{}], [0,2,{}]]
    );
    assert.throws(() => G.edges(-1), JSNetworkXError);
  },

  testOutEdges: function() {
    var G = this.K3;
    assert.deepEqual(
      G.outEdges(),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      G.outEdges(0),
      [[0,1], [0,2]]
    );
    assert.throws(() => G.edges(-1), JSNetworkXError);
  },

  testOutEdgesIter: function() {
    var G = this.K3;
    assert.deepEqual(
      Array.from(G.outEdgesIter()),
      [[0,1], [0,2], [1,0], [1,2], [2,0], [2,1]]
    );
    assert.deepEqual(
      Array.from(G.outEdgesIter(0)),
      [[0,1], [0,2]]
    );
  },

  testOutEdgesDir: function() {
    var G = this.P3;
    assert.deepEqual(G.outEdges(), [[0,1], [1,2]]);
    assert.deepEqual(G.outEdges(0), [[0,1]]);
    assert.deepEqual(G.outEdges(2), []);
  },

  testOutEdgesIterDir: function() {
    var G = this.P3;
    assert.deepEqual(Array.from(G.outEdgesIter()), [[0,1], [1,2]]);
    assert.deepEqual(Array.from(G.outEdgesIter(0)), [[0,1]]);
    assert.deepEqual(Array.from(G.outEdgesIter(2)), []);
  },

  testInEdgesDir: function() {
    var G = this.P3;
    assert.deepEqual(G.inEdges(), [[0,1], [1,2]]);
    assert.deepEqual(G.inEdges(0), []);
    assert.deepEqual(G.inEdges(2), [[1,2]]);
  },

  testInEdgesIterDir: function() {
    var G = this.P3;
    assert.deepEqual(Array.from(G.inEdgesIter()), [[0,1], [1,2]]);
    assert.deepEqual(Array.from(G.inEdgesIter(0)), []);
    assert.deepEqual(Array.from(G.inEdgesIter(2)), [[1,2]]);
  },

  testDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.degree().values()), [4,4,4]);
    assert.deepEqual(G.degree(), new Map([[0,4], [1,4], [2,4]]));
    assert.strictEqual(G.degree(0), 4);
    assert.deepEqual(G.degree([0]), new Map([[0,4]]));
    assert.throws(() => G.degree(-1), JSNetworkXError);
  },

  testDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.degreeIter()), [[0,4], [1,4], [2,4]]);
    assert.deepEqual(
      new Map(G.degreeIter()),
      new Map([[0,4], [1,4], [2,4]])
    );
    assert.deepEqual(Array.from(G.degreeIter(0)), [[0,4]]);
  },

  testInDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.inDegree().values()), [2,2,2]);
    assert.deepEqual(G.inDegree(), new Map([[0,2], [1,2], [2,2]]));
    assert.strictEqual(G.inDegree(0), 2);
    assert.deepEqual(G.inDegree([0]), new Map([[0,2]]));
    assert.throws(() => G.inDegree(-1), JSNetworkXError);
  },

  testInDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.inDegreeIter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new Map(G.inDegreeIter()),
      new Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(Array.from(G.inDegreeIter(0)), [[0,2]]);
  },

  testInDegreeIterWeighted: function() {
    var G = this.K3;
    G.addEdge(0,1,{weight: 0.3, other: 1.2});
    assert.deepEqual(
      Array.from(G.inDegreeIter(null, 'weight')),
      [[0,2], [1,1.3], [2,2]]
    );
    assert.deepEqual(
      new Map(G.inDegreeIter(null, 'weight')),
      new Map([[0,2], [1,1.3], [2,2]])
    );
    assert.deepEqual(
      Array.from(G.inDegreeIter(1, 'weight')),
      [[1,1.3]]
    );
    assert.deepEqual(
      Array.from(G.inDegreeIter(null, 'other')),
      [[0,2], [1,2.2], [2,2]]
    );
    assert.deepEqual(
      new Map(G.inDegreeIter(null, 'other')),
      new Map([[0,2], [1,2.2], [2,2]])
    );
    assert.deepEqual(
      Array.from(G.inDegreeIter(1, 'other')),
      [[1,2.2]]
    );
  },

  testOutDegree: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.outDegree().values()), [2,2,2]);
    assert.deepEqual(G.outDegree(), new Map([[0,2], [1,2], [2,2]]));
    assert.strictEqual(G.outDegree(0), 2);
    assert.deepEqual(G.outDegree([0]), new Map([[0,2]]));
    assert.throws(() => G.outDegree(-1), JSNetworkXError);
  },

  testOutDegreeIter: function() {
    var G = this.K3;
    assert.deepEqual(Array.from(G.outDegreeIter()), [[0,2], [1,2], [2,2]]);
    assert.deepEqual(
      new Map(G.outDegreeIter()),
      new Map([[0,2], [1,2], [2,2]])
    );
    assert.deepEqual(Array.from(G.outDegreeIter(0)), [[0,2]]);
  },

  testOutDegreeIterWeighted: function() {
    var G = this.K3;
    G.addEdge(0,1,{weight: 0.3, other: 1.2});
    assert.deepEqual(
      Array.from(G.outDegreeIter(null, 'weight')),
      [[0,1.3], [1,2], [2,2]]
    );
    assert.deepEqual(
      new Map(G.outDegreeIter(null, 'weight')),
      new Map([[0,1.3], [1,2], [2,2]])
    );
    assert.deepEqual(
      Array.from(G.outDegreeIter(0, 'weight')),
      [[0,1.3]]
    );
    assert.deepEqual(
      Array.from(G.outDegreeIter(null, 'other')),
      [[0,2.2], [1,2], [2,2]]
    );
    assert.deepEqual(
      new Map(G.outDegreeIter(null, 'other')),
      new Map([[0,2.2], [1,2], [2,2]])
    );
    assert.deepEqual(
      Array.from(G.outDegreeIter(0, 'other')),
      [[0,2.2]]
    );
  },

  testSize: function() {
    var G = this.K3;
    assert.strictEqual(G.size(), 6);
    assert.strictEqual(G.numberOfEdges(), 6);
  },

  testToUndirectedReciprocal: function() {
    var G = new this.Graph();
    G.addEdge(1,2);
    assert.ok(G.toUndirected().hasEdge(1,2));
    assert.ok(!G.toUndirected(true).hasEdge(1,2));
    G.addEdge(2,1);
    assert.ok(G.toUndirected(true).hasEdge(1,2));
  },

  testReverseCopy: function() {
    var G = new DiGraph([[0,1],[1,2]]);
    var R = G.reverse();
    assert.deepEqual(R.edges(), [[1,0], [2,1]]);
    R.removeEdge(1,0);
    assert.deepEqual(R.edges(), [[2,1]]);
    assert.deepEqual(G.edges(), [[0,1], [1,2]]);
  },

  testReverseNocopy: function() {
    var G = new DiGraph([[0,1],[1,2]]);
    var R = G.reverse(false);
    assert.deepEqual(R.edges(), [[1,0], [2,1]]);
    R.removeEdge(1,0);
    assert.deepEqual(R.edges(), [[2,1]]);
    assert.deepEqual(G.edges(), [[2,1]]);
  }
});
