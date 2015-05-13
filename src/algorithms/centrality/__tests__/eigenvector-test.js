/*global assert*/
'use strict';

import {eigenvectorCentrality} from '../eigenvector';

import {
  DiGraph,
  MultiGraph
} from '../../../classes';

import {
  completeGraph,
  pathGraph
} from '../../../generators';

export var testEigenvectorCentrality = {
  testK5() {
    let G = completeGraph(5);
    let result = eigenvectorCentrality(G);
    let v = Math.sqrt(1/5);

    for (let n of G) {
      assert.almostEqual(result.get(n), v);
    }

    let nstart = new Map();
    for (let n of G) {
      nstart.set(n, 1);
    }
    result = eigenvectorCentrality(G, {nstart});
    for (let n of G) {
      assert.almostEqual(result.get(n), v);
    }
  },

  // Doesn't converge, but the Python implementation doesn't either
  // (it uses numpy)
  /*
  testP3() {
    let G = pathGraph(3);
    let answer = new Map([[0, 0.5], [1, 0.7071], [2, 0.5]]);
    let result = eigenvectorCentrality(G);
    for (let n in G) {
      assert.almostEqual(result.get(n), answer.get(n), 4);
    }
  },

  testP3Unweighted() {

  },
  */

  testMaxIter() {
    assert.throws(
      () => eigenvectorCentrality(pathGraph(3), {maxIter: 0})
    );
  },
};

export var testEigenvectorCentralityDirected = {
  beforeEach() {
    let G = new DiGraph();
    let edges=[[1,2],[1,3],[2,4],[3,2],[3,5],[4,2],[4,5],[4,6],
               [5,6],[5,7],[5,8],[6,8],[7,1],[7,5],
               [7,8],[8,6],[8,7]];
    G.addEdgesFrom(edges, {weight: 2});
    this.G = G.reverse();
    this.G.evc = new Map([
      [1, 0.25368793],
      [2, 0.19576478],
      [3, 0.32817092],
      [4, 0.40430835],
      [5, 0.48199885],
      [6, 0.15724483],
      [7, 0.51346196],
      [8, 0.32475403]
    ]);

    let H = new DiGraph();
    edges=[[1,2],[1,3],[2,4],[3,2],[3,5],[4,2],[4,5],[4,6],
               [5,6],[5,7],[5,8],[6,8],[7,1],[7,5],
               [7,8],[8,6],[8,7]];
    H.addEdgesFrom(edges);
    this.H = H.reverse();
    this.H.evc = new Map([
      [1, 0.25368793],
      [2, 0.19576478],
      [3, 0.32817092],
      [4, 0.40430835],
      [5, 0.48199885],
      [6, 0.15724483],
      [7, 0.51346196],
      [8, 0.32475403]
    ]);
  },

  testEigenvectorCentralityWeighted() {
    let result = eigenvectorCentrality(this.G);
    for (let n of this.G) {
      assert.almostEqual(result.get(n), this.G.evc.get(n));
    }
  },

  testEigenvectorCentralityUnWeighted() {
    let result = eigenvectorCentrality(this.H);
    for (let n of this.H) {
      assert.almostEqual(result.get(n), this.H.evc.get(n));
    }
  },
};

export var testEigenvectorCentralityExceptions = {
  testMultigraph() {
    assert.throws(
      () => eigenvectorCentrality(new MultiGraph())
    );
  },

  testEmpty() {
    assert.throws(
      () => eigenvectorCentrality(new DiGraph())
    );
  }
};
