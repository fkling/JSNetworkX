/*global assert, utils*/
'use strict';

import {convertNodeLabelsToIntegers} from '../../../relabel';
import {
  cycleGraph,
  grid2dGraph,
  pathGraph
} from '../../../generators';
import {DiGraph} from '../../../classes';

var Map = utils.Map;
var zipSequence = utils.zipSequence;

import {
  allPairsShortestPath,
  allPairsShortestPathLength,
  bidirectionalShortestPath,
  predecessor,
  singleSourceShortestPath,
  singleSourceShortestPathLength
} from '../unweighted';

function validateGridPath(r, c, s, t, p) {
  assert.ok(Array.isArray(p));
  assert.equal(p[0], s);
  assert.equal(p[p.length - 1], t);
  s = [Math.floor((s - 1) / c), (s - 1) % c];
  t = [Math.floor((t - 1) / c), (t - 1) % c];
  assert.equal(p.length, Math.abs(t[0] - s[0]) + Math.abs(t[1] - s[1]) + 1);
  var u;
  p = [for (u of p) [Math.floor((u - 1) / c), (u - 1) % c]];
  for (let u of p) {
    assert.ok(0 <= u[0] && u[0] < r);
    assert.ok(0 <= u[1] && u[1] < c);
  }
  for (let [u,v] of zipSequence(p.slice(0, p.length - 1), p.slice(1))) {
    assert.isOneOf(
      [Math.abs(v[0] - u[0]), Math.abs(v[1] - u[1])],
      [[0,1], [1,0]]
    );
  }
}

export var testUnweightedPath = {

  beforeEach: function() {
    this.grid = convertNodeLabelsToIntegers(grid2dGraph(4,4), 1, 'sorted');
    this.cycle = cycleGraph(7);
    this.directedCycle = cycleGraph(7, new DiGraph());
  },

  testBidirectionalShortestPath: function() {
    assert.deepEqual(bidirectionalShortestPath(this.cycle, 0, 3), [0,1,2,3]);
    assert.deepEqual(bidirectionalShortestPath(this.cycle, 0, 4), [0,6,5,4]);
    validateGridPath(4, 4, 1, 12, bidirectionalShortestPath(this.grid, 1, 12));
    assert.deepEqual(
      bidirectionalShortestPath(this.directedCycle, 0, 3),
      [0,1,2,3]
    );
  },

  //TODO: test_shortest_path_length

  testSingleSourceShortestPath: function() {
    var p = singleSourceShortestPath(this.cycle, 0);
    assert.deepEqual(p.get(3), [0,1,2,3]);
    p = singleSourceShortestPath(this.cycle, 0, 0);
    assert.deepEqual(p, new Map({0: [0]}));
  },

  testSingleSourceShortestPathLength: function() {
    assert.deepEqual(
      singleSourceShortestPathLength(this.cycle, 0),
      new Map({0: 0,1: 1,2: 2,3: 3,4: 3,5: 2,6: 1})
    );
  },


  testAllPairsShortestPath: function() {
    var p = allPairsShortestPath(this.cycle);
    assert.deepEqual(p.get(0).get(3), [0,1,2,3]);
    p = allPairsShortestPath(this.grid);
    validateGridPath(4, 4, 1, 12, p.get(1).get(12));
  },

  testAllPairsShortestPathLength: function() {
    var l = allPairsShortestPathLength(this.cycle);
    assert.deepEqual(
      l.get(0),
      new Map({0: 0,1: 1,2: 2,3: 3,4: 3,5: 2,6: 1})
    );
    l = allPairsShortestPathLength(this.grid);
    assert.deepEqual(l.get(1).get(16), 6);
  },

  testPredecessor: function() {
    var G = pathGraph(4);
    assert.deepEqual(
      predecessor(G, 0),
      new Map({0: [],1: [0],2: [1],3: [2]})
    );
    assert.deepEqual(predecessor(G, 0, {target: 3}), [2]);
    G = grid2dGraph(2, 2);
    assert.deepEqual(
      Array.from(predecessor(G, [0,0])).sort(),
      [[[0,0], []], [[0,1], [[0,0]]], [[1,0], [[0,0]]], [[1,1], [[1,0], [0,1]]]]
    );
  },

  testPredecessorCutoff: function() {
    var G = pathGraph(4);
    assert.notInclude(predecessor(G, 0, {target: 3}), 4);
  },

  testPredecessorTarget: function() {
    var G = pathGraph(4);
    assert.deepEqual(predecessor(G, 0, {target: 3}), [2]);
    assert.deepEqual(predecessor(G, 0, {target: 3, cutoff: 2}), []);
    assert.deepEqual(predecessor(G, 0, {target: 3, returnSeen: 2}), [[2], 3]);
    assert.deepEqual(
      predecessor(G, 0, {target: 3, cutoff: 2, returnSeen: 2}),
      [[], -1]
    );
  }

};
