/*global assert*/
'use strict';

import {
  Graph,
  DiGraph,
  Map,
  convertNodeLabelsToIntegers
} from '../../../';

import {
  cycleGraph,
  grid2dGraph,
  pathGraph
} from '../../../generators';

import {
  hasPath,
  shortestPath,
  shortestPathLength
} from '../generic';

import {
  allPairsShortestPath,
  allPairsShortestPathLength,
  singleSourceShortestPath,
  singleSourceShortestPathLength
} from '../unweighted';

import {
  allPairsDijkstraPath,
  allPairsDijkstraPathLength,
  singleSourceDijkstraPath,
  singleSourceDijkstraPathLength
} from '../weighted';

function validateGridPath(r, c, s, t, p) {
  assert.isArray(p);
  assert.equal(p[0], s);
  assert.equal(p[p.length - 1], t);
  s = [Math.floor((s - 1) / c), (s - 1) % c];
  t = [Math.floor((t - 1) / c), (t - 1) % c];
  assert.equal(p.length, Math.abs(t[0] - s[0]) + Math.abs(t[1] - s[1]) + 1);
  p = p.map(u => [Math.floor((u - 1) / c), (u - 1) %c]);
  for (let u of p) {
    assert.ok(0 <= u[0] && u[0] < r);
    assert.ok(0 <= u[1] && u[1] < c);
  }
  for (let i = 0; i < p.length - 1; i++) {
    assert.deepEqual(
      [Math.abs(p[i+1][0] - p[i][0]), Math.abs(p[i+1][1] - p[i][1])].sort(),
      [0, 1]
    );
  }
}

export var testGenericPath = {
  beforeEach: function() {
   this.grid = convertNodeLabelsToIntegers(grid2dGraph(4, 4), 1, 'sorted');
   this.cycle = cycleGraph(7);
   this.directedCycle = cycleGraph(7, new DiGraph());
  },

  testShortestPath: function() {
    assert.deepEqual(
      shortestPath(this.cycle, {source: 0, target: 3}),
      [0, 1, 2, 3]
    );
    assert.deepEqual(
      shortestPath(this.cycle, {source: 0, target: 4}),
      [0, 6, 5, 4]
    );
    validateGridPath(
      4, 4, 1, 12,
      shortestPath(this.grid, {source: 1, target: 12})
    );
    assert.deepEqual(
      shortestPath(this.directedCycle, {source: 0, target: 3}),
      [0, 1, 2, 3]
    );

    // now with weights
    assert.deepEqual(
      shortestPath(this.cycle, {source: 0, target: 3, weight: 'weight'}),
      [0, 1, 2, 3]
    );
    assert.deepEqual(
      shortestPath(this.cycle, {source: 0, target: 4, weight: 'weight'}),
      [0, 6, 5, 4]
    );
    validateGridPath(
      4, 4, 1, 12,
      shortestPath(this.grid, {source: 1, target: 12, weight: 'weight'})
    );
    assert.deepEqual(
      shortestPath(
        this.directedCycle,
        {source: 0, target: 3, weight: 'weight'}
      ),
      [0, 1, 2, 3]
    );
  },

  testShortestPathTarget: function() {
    var paths = shortestPath(pathGraph(3), {target: 1});
    assert.deepEqual(paths, new Map([[0, [0, 1]], [1, [1]], [2, [2,1]]]));
  },

  testShortestPathLength: function() {
    assert.equal(
      shortestPathLength(this.cycle, {source: 0, target: 3}),
      3
    );
    assert.equal(
      shortestPathLength(this.grid, {source: 1, target: 12}),
      5
    );
    assert.equal(
      shortestPathLength(this.directedCycle, {source: 0, target: 4}),
      4
    );

    // now with weights
    assert.equal(
      shortestPathLength(this.cycle, {source: 0, target: 3, weight: 'weight'}),
      3
    );
    assert.equal(
      shortestPathLength(this.grid, {source: 1, target: 12, weight: 'weight'}),
      5
    );
    assert.equal(
      shortestPathLength(
        this.directedCycle,
        {source: 0, target: 4, weight: 'weight'}
      ),
      4
    );
  },

  testShortestPathLengthTarget: function() {
    var distances = shortestPathLength(pathGraph(3), {target: 1});
    assert.equal(distances.get(0), 1);
    assert.equal(distances.get(1), 0);
    assert.equal(distances.get(2), 1);
  },

  testSingleSourceShortestPath: function() {
    var paths = shortestPath(this.cycle, {source: 0});
    assert.deepEqual(paths.get(3), [0,1,2,3]);
    assert.deepEqual(paths, singleSourceShortestPath(this.cycle, 0));
    paths = shortestPath(this.grid, {source: 1});
    validateGridPath(4, 4, 1, 12, paths.get(12));

    // now with weights
    paths = shortestPath(this.cycle, {source: 0, weight: 'weight'});
    assert.deepEqual(paths.get(3), [0,1,2,3]);
    assert.deepEqual(paths, singleSourceDijkstraPath(this.cycle, {source: 0}));
    paths = shortestPath(this.grid, {source: 1, weight: 'weight'});
    validateGridPath(4, 4, 1, 12, paths.get(12));
  },

  testSingleSourceShortestPathLength: function() {
    var distances = shortestPathLength(this.cycle, {source: 0});
    assert.deepEqual(
      distances,
      new Map([[0,0], [1,1], [2,2], [3,3], [4,3], [5,2], [6,1]])
    );
    assert.deepEqual(distances, singleSourceShortestPathLength(this.cycle, 0));
    distances = shortestPathLength(this.grid, {source: 1});
    assert.equal(distances.get(16), 6);

    // now with weights
    distances = shortestPathLength(this.cycle, {source: 0, weight: 'weight'});
    assert.deepEqual(
      distances,
      new Map([[0,0], [1,1], [2,2], [3,3], [4,3], [5,2], [6,1]])
    );
    assert.deepEqual(
      distances,
      singleSourceDijkstraPathLength(this.cycle, {source: 0})
    );
    distances = shortestPathLength(this.grid, {source: 1, weight: 'weight'});
    assert.equal(distances.get(16), 6);
  },

  testAllPairsShortestPath: function() {
    var paths = shortestPath(this.cycle);
    assert.deepEqual(paths.get(0).get(3), [0,1,2,3]);
    assert.deepEqual(paths, allPairsShortestPath(this.cycle));
    paths = shortestPath(this.grid);
    validateGridPath(4, 4, 1, 12, paths.get(1).get(12));

    // now with weights
    paths = shortestPath(this.cycle, {weight: 'weight'});
    assert.deepEqual(paths.get(0).get(3), [0,1,2,3]);
    assert.deepEqual(paths, allPairsDijkstraPath(this.cycle));
    paths = shortestPath(this.grid, {weight: 'weight'});
    validateGridPath(4, 4, 1, 12, paths.get(1).get(12));
  },

  testAllPairsShortestPathLength: function() {
    var distances = shortestPathLength(this.cycle);
    assert.deepEqual(
      distances.get(0),
      new Map([[0,0], [1,1], [2,2], [3,3], [4,3], [5,2], [6,1]])
    );
    assert.deepEqual(distances, allPairsShortestPathLength(this.cycle));
    distances = shortestPathLength(this.grid);
    assert.equal(distances.get(1).get(16), 6);

    // now with weights
    distances = shortestPathLength(this.cycle, {weight: 'weight'});
    assert.deepEqual(
      distances.get(0),
      new Map([[0,0], [1,1], [2,2], [3,3], [4,3], [5,2], [6,1]])
    );
    assert.deepEqual(
      distances,
      allPairsDijkstraPathLength(this.cycle)
    );
    distances = shortestPathLength(this.grid, {weight: 'weight'});
    assert.equal(distances.get(1).get(16), 6);
  },

  // TODO testAverageShortestPath
  // TODO testWeightedAverageShortestPath
  // TODO testAverageShortestDisconnect

  testHasPath: function() {
    var G = new Graph();
    G.addPath([0, 1, 2]);
    G.addPath([3, 4]);
    assert.ok(hasPath(G, {source: 0, target: 2}));
    assert.notOk(hasPath(G, {source: 0, target: 4}));
  },
    //
  // TODO testAllShortestPaths
  // TODO testAllShortestPathsRaise
};
