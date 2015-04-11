/*global assert, utils*/
'use strict';

var Map = utils.Map;

import {Graph} from '../../classes';

import {
  completeGraph,
  cycleGraph,
  pathGraph
} from '../../generators';


import {
  triangles,
  clustering,
  transitivity,
  squareClustering,
  averageClustering,
} from '../cluster';

export var testTriangles = {

  testEmpty: function() {
    var G = new Graph();
    assert.deepEqual(Array.from(triangles(G).values()), []);
  },

  testPath: function() {
    var G = pathGraph(10);
    assert.deepEqual(Array.from(triangles(G).values()), [0,0,0,0,0,0,0,0,0,0]);
    assert.deepEqual(
      triangles(G),
      new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = cubical_graph();
    assert.deepEqual(triangles(G).values(), [0,0,0,0,0,0,0,0]);
    assert.equal(triangles(G, 1), 0);
    assert.deepEqual(triangles(G, [1,2]).values(), [0,0]);
    assert.equal(triangles(G, 1), 0);
    assert.deepEqual(triangles(G, [1,2]), new Map({1: 0, 2: 0}));
  },
*/

  testK5: function() {
    var G = completeGraph(5);
    assert.deepEqual(Array.from(triangles(G).values()), [6,6,6,6,6]);
    assert.equal(
      Array.from(triangles(G).values()).reduce(function(v, p) {
        return p + v;
      }, 0) / 3,
      10
    );
    assert.equal(triangles(G, 1), 6);
    G.removeEdge(1,2);
    assert.deepEqual(Array.from(triangles(G).values()), [5,3,3,5,5]);
    assert.deepEqual(triangles(G, 1), 3);
  }
};


export var testWeightedClustering = {

  testClustering: function() {
    var G = new Graph();
    assert.deepEqual(Array.from(clustering(G, null, 'weight').values()), []);
    assert.deepEqual(clustering(G), new Map());
  },

  testPath: function() {
    var G = pathGraph(10);
    assert.deepEqual(
      Array.from(clustering(G, null, 'weight').values()),
      [0,0,0,0,0,0,0,0,0,0]
    );
    assert.deepEqual(
      clustering(G, null, 'weight'),
      new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = cubical_graph();
    assert.deepEqual(
      clustering(G, null, 'weight').values(),
      [0,0,0,0,0,0,0,0]
    );
    assert.Equal(clustering(G, 1), 0);
    assert.deepEqual(clustering(G, [1,2], 'weight').values(), [0,0]);
    assert.equal(clustering(G, 1, 'weight'), 0);
    assert.deepEqual(clustering(G, [1,2], 'weight')).toEqual({1: 0, 2: 0});
  },
  */

  testK5: function() {
    var G = completeGraph(5);
    assert.deepEqual(
      Array.from(clustering(G, null, 'weight').values()),
      [1,1,1,1,1]
    );
    assert.equal(averageClustering(G, null, 'weight'), 1);
    G.removeEdge(1,2);
    assert.deepEqual(
      Array.from(clustering(G, null, 'weight').values()),
      [5/6,1,1,5/6,5/6]
    );
    assert.deepEqual(
      clustering(G, [1,4], 'weight'),
      new Map({1: 1, 4: 0.8333333333333334})
    );
  }
};


export var testClustering = {

  testClustering: function() {
    var G = new Graph();
    assert.deepEqual(Array.from(clustering(G).values()), []);
    assert.deepEqual(clustering(G), new Map());
  },

  testPath: function() {
    var G = pathGraph(10);
    assert.deepEqual(Array.from(clustering(G).values()), [0,0,0,0,0,0,0,0,0,0]);
    assert.deepEqual(
      clustering(G),
      new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = cubical_graph();
    assert.ddepEqual(clustering(G), [0,0,0,0,0,0,0,0]);
    assert.equal(clustering(G, 1)).toBe(0);
    assert.deepEqual(clustering(G, [1,2]).values(), [0,0]);
    assert.equal(clustering(G, 1), 0);
    assert.deepEqual(clustering(G, [1,2]), new Map({1: 0, 2: 0}));
  },
*/

  testK5: function() {
    var G = completeGraph(5);
    assert.deepEqual(Array.from(clustering(G).values()), [1,1,1,1,1]);
    assert.equal(averageClustering(G), 1);
    G.removeEdge(1,2);
    assert.deepEqual(Array.from(clustering(G).values()), [5/6,1,1,5/6,5/6]);
    assert.deepEqual(
      clustering(G, [1,4]),
      new Map({1: 1, 4: 0.8333333333333334})
    );
  },

  testAverageClustering: function() {
    var G = cycleGraph(3);
    G.addEdge(2,3);
    assert.equal(averageClustering(G),(1+1+1/3)/4);
    assert.equal(averageClustering(G, null, null, true), (1+1+1/3)/4);
    assert.equal(averageClustering(G, null, null, false), (1+1+1/3)/3);
  }
};


export var testTransitivity = {

  testTransitivity: function() {
    var G = new Graph();
    assert.equal(transitivity(G), 0);
  },

  testPath: function() {
    var G = pathGraph(10);
    assert.equal(transitivity(G), 0);
  },

  // TODO:
  /*
  test_cubical: function() {
    var G = cubical_graph();
    assert.equal(transitivity(G), 0);
  },
  */

  testK5: function() {
    var G = completeGraph(5);
    assert.equal(transitivity(G), 1);
    G.removeEdge(1,2);
    assert.equal(transitivity(G), 0.875);
  }
};


export var testSquareClustering = {

  testClustering: function() {
    var G = new Graph();
    assert.deepEqual(Array.from(squareClustering(G).values()), []);
    assert.deepEqual(squareClustering(G), new Map());
  },

  testPath: function() {
    var G = pathGraph(10);
    assert.deepEqual(
      Array.from(squareClustering(G).values()),
      [0,0,0,0,0,0,0,0,0,0]
    );
    assert.deepEqual(
      squareClustering(G),
      new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0})
    );
  },

  // TODO
  /*
  test_cubical: function() {
    var G = cubical_graph();
    assert.deepEqual(
      square_clustering(G).values(),
      [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]
    );
    assert.deepEqual(square_clustering(G, [1,2]).values(), [0.5,0.5]);
    assert.equal(square_clustering(G, 1), 0.5);
    assert.deepEqual(
      square_clustering(G, [1,2]),
      new Map({1: 0.5, 2: 0.5})
    );
  },
  */

  testK5: function() {
    var G = completeGraph(5);
    assert.deepEqual(Array.from(squareClustering(G).values()), [1,1,1,1,1]);
  },

  //TODO: test_bipartite_k5

  // Test C4 for figure 1 Lind et al (2005)
  testLindSquareClustering: function() {
    var G = new Graph([[1,2],[1,3],[1,6],[1,7],[2,4],[2,5],
                      [3,4],[3,5],[6,7],[7,8],[6,8],[7,9],
                      [7,10],[6,11],[6,12],[2,13],[2,14],[3,15],[3,16]]);
    var G1 = G.subgraph([1,2,3,4,5,13,14,15,16]);
    var G2 = G.subgraph([1,6,7,8,9,10,11,12]);

    assert.equal(squareClustering(G, 1), 3/75);
    assert.equal(squareClustering(G1, 1), 2/6);
    assert.equal(squareClustering(G2, 1), 1/5);
  }
};
