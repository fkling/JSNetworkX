/*global assert, utils*/
'use strict';

import {Graph, DiGraph} from '../../../classes';

import {
  balancedTree,
  completeGraph,
  cycleGraph,
  florentineFamiliesGraph,
  krackhardtKiteGraph,
  pathGraph
} from '../../../generators';

import {
  betweennessCentrality,
  edgeBetweennessCentrality
} from '../betweenness';

var Map = utils.Map;

function weightedG() {
  var G = new Graph();
  G.addEdge(0, 1, {weight: 3});
  G.addEdge(0, 2, {weight: 2});
  G.addEdge(0, 3, {weight: 6});
  G.addEdge(0, 4, {weight: 4});
  G.addEdge(1, 3, {weight: 5});
  G.addEdge(1, 5, {weight: 5});
  G.addEdge(2, 4, {weight: 1});
  G.addEdge(3, 4, {weight: 2});
  G.addEdge(3, 5, {weight: 1});
  G.addEdge(4, 5, {weight: 4});
  return G;
}

export var testBetweennessCentrality = {
  testk5: function() {
    var G = completeGraph(5);
    var bAnswer = new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testk5Endpoints: function() {
    var G = completeGraph(5);
    var bAnswer = new Map({0: 4, 1: 4, 2: 4, 3: 4, 4: 4});
    var b = betweennessCentrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    assert.deepEqual(b, bAnswer);
  },

  testP3Normalized: function() {
    var G = pathGraph(3);
    var bAnswer = new Map({0: 0, 1: 1, 2: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, bAnswer);
  },

  testP3: function() {
    var G = pathGraph(3);
    var bAnswer = new Map({0: 0, 1: 1, 2: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testP3Endpoints: function() {
    var G = pathGraph(3);
    var bAnswer = new Map({0: 2, 1: 3, 2: 2});
    var b = betweennessCentrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    assert.deepEqual(b, bAnswer);
  },

  testKrackhardtKiteGraph: function() {
    var G = krackhardtKiteGraph();
    var bAnswer = new Map({0: 1.667,1: 1.667,2: 0.000,3: 7.333,4: 0.000,
                    5: 16.667,6: 16.667,7: 28.000,8: 16.000,9: 0.000});
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k) / 2));
  },

  testKrackhardtKiteGraphNormalized: function() {
    var G = krackhardtKiteGraph();
    var bAnswer = new Map({0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000});
    var b = betweennessCentrality(G, {weight: null, normalized: true});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testFlorentineFamiliesGraph: function() {
    var G = florentineFamiliesGraph();
    var b = betweennessCentrality(G, {weight: null, normalized: true});
    var bAnswer = new Map({
      /* eslint-disable key-spacing */
      'Acciaiuoli':    0.000,
      'Albizzi':       0.212,
      'Barbadori':     0.093,
      'Bischeri':      0.104,
      'Castellani':    0.055,
      'Ginori':        0.000,
      'Guadagni':      0.255,
      'Lamberteschi':  0.000,
      'Medici':        0.522,
      'Pazzi':         0.000,
      'Peruzzi':       0.022,
      'Ridolfi':       0.114,
      'Salviati':      0.143,
      'Strozzi':       0.103,
      'Tornabuoni':    0.092
      /* eslint-enable key-spacing */
    });
    G.nodes().forEach(v => assert.almostEqual(b.get(v), bAnswer.get(v)));
  },

  testLadderGraph: function() {
    var G = new Graph();
    G.addEdgesFrom([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var bAnswer = new Map({
      0: 1.667,
      1: 1.667,
      2: 6.667,
      3: 6.667,
      4: 1.667,
      5: 1.667
    });
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k) / 2));
  },

  testDisconnectedPath: function() {
    var G = new Graph();
    G.addPath([0, 1, 2]);
    G.addPath([3, 4, 5, 6]);
    var bAnswer = new Map({0: 0, 1: 1, 2: 0, 3: 0, 4: 2, 5: 2, 6: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testDisconnectedPathEndpoints: function() {
    var G = new Graph();
    G.addPath([0, 1, 2]);
    G.addPath([3, 4, 5, 6]);
    var bAnswer = new Map({0: 2, 1: 3, 2: 2, 3: 3, 4: 5, 5: 5, 6: 3});
    var b = betweennessCentrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testDirectedPath: function() {
    var G = new DiGraph();
    G.addPath([0, 1, 2]);
    var bAnswer = new Map({0: 0.0, 1: 1, 2: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testDirectedPathNormalized: function() {
    var G = new DiGraph();
    G.addPath([0, 1, 2]);
    var bAnswer = new Map({0: 0, 1: 0.5, 2: 0});
    var b = betweennessCentrality(G, {weight: null, normalized: true});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  }
};

export var testWeightedBetweennessCentrality = {

  testK5: function() {
    var G = completeGraph(5);
    var bAnswer = new Map({0: 0, 1: 0, 2: 0, 3: 0, 4: 0});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testP3Normalized: function() {
    var G = pathGraph(3);
    var bAnswer = new Map({0: 0, 1: 1, 2: 0});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: true});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testP3: function() {
    var G = pathGraph(3);
    var bAnswer = new Map({0: 0, 1: 1, 2: 0});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testKrackhardtKiteGraph: function() {
    var G = krackhardtKiteGraph();
    var bAnswer = new Map({
      0: 1.667,
      1: 1.667,
      2: 0.000,
      3: 7.333,
      4: 0.000,
      5: 16.667,
      6: 16.667,
      7: 28.000,
      8: 16.000,
      9: 0.000
    });
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k) / 2));
  },

  testKrackhardtKiteGraphNormalized: function() {
    var G = krackhardtKiteGraph();
    var bAnswer = new Map({0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: true});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testFlorentineFamiliesGraph: function() {
    var G = florentineFamiliesGraph();
    var bAnswer = new Map({
      /* eslint-disable key-spacing */
      'Acciaiuoli':    0.000,
      'Albizzi':       0.212,
      'Barbadori':     0.093,
      'Bischeri':      0.104,
      'Castellani':    0.055,
      'Ginori':        0.000,
      'Guadagni':      0.255,
      'Lamberteschi':  0.000,
      'Medici':        0.522,
      'Pazzi':         0.000,
      'Peruzzi':       0.022,
      'Ridolfi':       0.114,
      'Salviati':      0.143,
      'Strozzi':       0.103,
      'Tornabuoni':    0.092
      /* eslint-enable key-spacing */
    });
    var b = betweennessCentrality(G, {weight: 'weight', normalized: true});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testLadderGraph: function() {
    var G = new Graph();
    G.addEdgesFrom([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var bAnswer = new Map({
      0: 1.667,
      1: 1.667,
      2: 6.667,
      3: 6.667,
      4: 1.667,
      5: 1.667
    });
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k) / 2));
  },

  testG: function() {
    var G = weightedG();
    var bAnswer = new Map({0: 2, 1: 0, 2: 4, 3: 3, 4: 4, 5: 0});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testG2: function() {
    var G = new DiGraph();
    G.addWeightedEdgesFrom([
      ['s', 'u', 10], ['s', 'x', 5],
      ['u', 'v', 1], ['u', 'x', 2],
      ['v', 'y', 1], ['x', 'u', 3],
      ['x', 'v', 5], ['x', 'y', 2],
      ['y', 's', 7], ['y', 'v', 6]
    ]);
    var bAnswer = new Map({'y': 5, 'x': 5, 's': 4, 'u': 2, 'v': 2});
    var b = betweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  }
};

export var testEdgeBetweennessCentrality = {

  testk5: function() {
    var G = completeGraph(5);
    var edge;
    var bAnswer = new Map((for (edge of G.edges()) [edge, 1]));
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testNormalizedK5: function() {
    var G = completeGraph(5);
    var edge;
    var bAnswer = new Map((for (edge of G.edges()) [edge, 1/10]));
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, bAnswer);
  },

  testC4: function() {
    var G = cycleGraph(4);
    var edge;
    var bAnswer = new Map((for (edge of G.edges()) [edge, 2/6]));
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, bAnswer);
  },

  testP4: function() {
    var G = pathGraph(4);
    var bAnswer = new Map([
      [[0,1], 3],
      [[1,2], 4],
      [[2,3], 3]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testNormalizedP4: function() {
    var G = pathGraph(4);
    var bAnswer = new Map([
      [[0,1], 3/6],
      [[1,2], 4/6],
      [[2,3], 3/6]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, bAnswer);
  },

  testBalancedTree: function() {
    var G = balancedTree(2, 2);
    var bAnswer = new Map([
      [[0,1], 12],
      [[0,2], 12],
      [[1,3], 6],
      [[1,4], 6],
      [[2,5], 6],
      [[2,6], 6]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, bAnswer);
  }
};

export var testWeightedEdgeBetweennessCentrality = {

  testK5: function() {
    var G = completeGraph(5);
    var edge;
    var bAnswer = new Map((for (edge of G.edges()) [edge, 1]));
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testC4: function() {
    var G = cycleGraph(4);
    var edge;
    var bAnswer = new Map((for (edge of G.edges()) [edge, 2]));
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testP4: function() {
    var G = pathGraph(4);
    var bAnswer = new Map([
      [[0,1], 3],
      [[1,2], 4],
      [[2,3], 3]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testBalancedTree: function() {
    var G = balancedTree(2, 2);
    var bAnswer = new Map([
      [[0,1], 12],
      [[0,2], 12],
      [[1,3], 6],
      [[1,4], 6],
      [[2,5], 6],
      [[2,6], 6]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, bAnswer);
  },

  testWeightedGraph: function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3],
                 [0, 4, 2], [1, 2, 4], [1, 3, 1],
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = new Graph();
    G.addWeightedEdgesFrom(eList);
    var bAnswer = new Map([
      [[0,1], 0],
      [[0,2], 1],
      [[0,3], 2],
      [[0,4], 1],
      [[1,2], 2],
      [[1,3], 3.5],
      [[1,4], 1.5],
      [[2,4], 1],
      [[3,4], 0.5]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: false});
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)));
  },

  testNormalizedWeightedGraph: function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3],
                 [0, 4, 2], [1, 2, 4], [1, 3, 1],
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = new Graph();
    G.addWeightedEdgesFrom(eList);
    var bAnswer = new Map([
      [[0,1], 0],
      [[0,2], 1],
      [[0,3], 2],
      [[0,4], 1],
      [[1,2], 2],
      [[1,3], 3.5],
      [[1,4], 1.5],
      [[2,4], 1],
      [[3,4], 0.5]
    ]);
    var b = edgeBetweennessCentrality(G, {weight: 'weight', normalized: true});
    var norm = G.order() * (G.order() - 1) / 2;
    b.forEach((v, k) => assert.almostEqual(v, bAnswer.get(k)/norm));
  }
};
