/*global assert*/
'use strict';

import {maximalMatching, maxWeightMatching, weightedBlossomEdmonds} from '../matching';
import {Graph, MultiGraph} from '../../classes';
import {
/*jshint ignore:start*/
  Map,
  Set,
/*jshint ignore:end*/
  genRange,
  fillArray,
} from '../../_internals';

const algorithms = [
  weightedBlossomEdmonds(true, true, true),
  weightedBlossomEdmonds(false, false, false),
  weightedBlossomEdmonds(),
  function (edges,maxCardinality) {
    const optWeight = "HUHR3UIsihd";
    const G = new MultiGraph();
    // fixes problem caused by nodes without edges
    // (only needed for these tests)
    let N = 0;
    for (let [u,v] of edges) N = Math.max(N,u+1,v+1);
    for (let i of genRange(N)) G.addNode(i);
    // end of fix
    G.addWeightedEdgesFrom(edges, optWeight);
    const matching = maxWeightMatching(G, maxCardinality, optWeight);
    const mate = fillArray(G.order(), -1);
    for (let [u, v] of matching) mate[u] = v;
    return mate;
  },
];

export var matching = {

  test00_simpletest: function() {
    const G = new Graph([[1e6,1],[1,Infinity],[1e6,"abcd"]]);
    const matching = maxWeightMatching(G);
    assert.deepEqual(matching.get(1), Infinity, "1");
    assert.deepEqual(matching.get(Infinity), 1, "Infinity");
    assert.deepEqual(matching.get(1e6), "abcd", "1e6");
    assert.deepEqual(matching.get("abcd"), 1e6, "'abcd'");
  },
  test10_empty: function() {
    // empty input graph
    for (let alg of algorithms)
    assert.deepEqual(alg([]), []);
  },
  test11_singleedge: function() {
    // single edge
    for (let alg of algorithms)
    assert.deepEqual(alg([ [0,1,1] ]), [1, 0]);
  },

  test12: function() {
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,10], [2,3,11] ]), [ -1, -1, 3, 2 ]);
  },

  test13: function() {
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,5], [2,3,11], [3,4,5] ]), [ -1, -1, 3, 2, -1 ]);
  },

  test14_maxcard: function() {
    // maximum cardinality
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,5], [2,3,11], [3,4,5] ], true), [ -1, 2, 1, 4, 3 ]);
  },

  test15_float: function() {
    // floating point weigths
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,Math.PI], [2,3,Math.E], [1,3,3.0], [1,4,Math.sqrt(2.0)] ]), [ -1, 4, 3, 2, 1 ]);
  },

  test16_negative: function() {
    // negative weights
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,2], [1,3,-2], [2,3,1], [2,4,-1], [3,4,-6] ], false), [ -1, 2, 1, -1, -1 ]);
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,2], [1,3,-2], [2,3,1], [2,4,-1], [3,4,-6] ], true), [ -1, 3, 4, 1, 2 ]);
  },

  test20_sblossom: function() {
    // create S-blossom and use it for augmentation
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,8], [1,3,9], [2,3,10], [3,4,7] ]), [ -1, 2, 1, 4, 3 ]);
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,8], [1,3,9], [2,3,10], [3,4,7], [1,6,5], [4,5,6] ]), [ -1, 6, 3, 2, 5, 4, 1 ]);
  },

  test21_tblossom: function() {
    // create S-blossom, relabel as T-blossom, use for augmentation
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,9], [1,3,8], [2,3,10], [1,4,5], [4,5,4], [1,6,3] ]), [ -1, 6, 3, 2, 5, 4, 1 ]);
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,9], [1,3,8], [2,3,10], [1,4,5], [4,5,3], [1,6,4] ]), [ -1, 6, 3, 2, 5, 4, 1 ]);
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,9], [1,3,8], [2,3,10], [1,4,5], [4,5,3], [3,6,4] ]), [ -1, 2, 1, 6, 5, 4, 3 ]);
  },

  test22_s_nest: function() {
    // create nested S-blossom, use for augmentation
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,9], [1,3,9], [2,3,10], [2,4,8], [3,5,8], [4,5,10], [5,6,6] ]), [ -1, 3, 4, 1, 2, 6, 5 ]);
  },

  test23_s_relabel_nest: function() {
    // create S-blossom, relabel as S, include in nested S-blossom
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,10], [1,7,10], [2,3,12], [3,4,20], [3,5,20], [4,5,25], [5,6,10], [6,7,10], [7,8,8] ]), [ -1, 2, 1, 4, 3, 6, 5, 8, 7 ]);
  },

  test24_s_nest_expand: function() {
    // create nested S-blossom, augment, expand recursively
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,8], [1,3,8], [2,3,10], [2,4,12], [3,5,12], [4,5,14], [4,6,12], [5,7,12], [6,7,14], [7,8,12] ]), [ -1, 2, 1, 5, 6, 3, 4, 8, 7 ]);
  },

  test25_s_t_expand: function() {
    // create S-blossom, relabel as T, expand
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,23], [1,5,22], [1,6,15], [2,3,25], [3,4,22], [4,5,25], [4,8,14], [5,7,13] ]), [ -1, 6, 3, 2, 8, 7, 1, 5, 4 ]);
  },

  test26_s_nest_t_expand: function() {
    // create nested S-blossom, relabel as T, expand
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,19], [1,3,20], [1,8,8], [2,3,25], [2,4,18], [3,5,18], [4,5,13], [4,7,7], [5,6,7] ]), [ -1, 8, 3, 2, 7, 6, 5, 4, 1 ]);
  },

  test30_tnasty_expand: function() {
    // create blossom, relabel as T in more than one way, expand, augment
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,45], [1,5,45], [2,3,50], [3,4,45], [4,5,50], [1,6,30], [3,9,35], [4,8,35], [5,7,26], [9,10,5] ]), [ -1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9 ]);
  },

  test31_tnasty2_expand: function() {
    // again but slightly different
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,45], [1,5,45], [2,3,50], [3,4,45], [4,5,50], [1,6,30], [3,9,35], [4,8,26], [5,7,40], [9,10,5] ]), [ -1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9 ]);
  },

  test32_t_expand_leastslack: function() {
    // create blossom, relabel as T, expand such that a new least-slack S-to-free edge is produced, augment
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,45], [1,5,45], [2,3,50], [3,4,45], [4,5,50], [1,6,30], [3,9,35], [4,8,28], [5,7,26], [9,10,5] ]), [ -1, 6, 3, 2, 8, 7, 1, 5, 4, 10, 9 ]);
  },

  test33_nest_tnasty_expand: function() {
    // create nested blossom, relabel as T in more than one way, expand outer blossom such that inner blossom ends up on an augmenting path
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,45], [1,7,45], [2,3,50], [3,4,45], [4,5,95], [4,6,94], [5,6,94], [6,7,50], [1,8,30], [3,11,35], [5,9,36], [7,10,26], [11,12,5] ]), [ -1, 8, 3, 2, 6, 9, 4, 10, 1, 5, 7, 12, 11 ]);
  },

  test34_nest_relabel_expand: function() {
    // create nested S-blossom, relabel as S, expand recursively
    for (let alg of algorithms)
    assert.deepEqual(alg([ [1,2,40], [1,3,40], [2,3,60], [2,4,55], [3,5,55], [4,5,50], [1,8,15], [5,7,30], [7,6,10], [8,10,10], [4,9,30] ]), [ -1, 2, 1, 5, 9, 3, 7, 6, 10, 4, 8 ]);
  },

  maximalMatching_1: function() {
    let graph = new Graph();
    graph.addEdge(0, 1);
    graph.addEdge(0, 2);
    graph.addEdge(0, 3);
    graph.addEdge(0, 4);
    graph.addEdge(0, 5);
    graph.addEdge(1, 2);
    let matching = maximalMatching(graph);

    let vset = new Set();
    vset.update(...matching);

    for (let [u, v] of graph.edgesIter()) {
        assert.ok(vset.has(u) || vset.has(v), "not a proper matching!");
    }

    assert.equal(1, matching.size, "matching not length 1!");
  },

  maximalMatching_2: function() {
    let graph = new Graph();
    graph.addEdge(1, 2);
    graph.addEdge(1, 5);
    graph.addEdge(2, 3);
    graph.addEdge(2, 5);
    graph.addEdge(3, 4);
    graph.addEdge(3, 6);
    graph.addEdge(5, 6);

    let matching = maximalMatching(graph);

    let vset = new Set();
    vset.update(...matching);

    for (let [u, v] of graph.edgesIter()) {
        assert.ok(vset.has(u) || vset.has(v), "not a proper matching!");
    }
  },

  test_maximal_matching_ordering: function() {
    // check edge ordering
    let G = new Graph();
    G.addNodesFrom([100,200,300]);
    G.addEdgesFrom([[100,200],[100,300]]);
    matching = maximalMatching(G);
    assert.equal(matching.size, 1);
    G = new Graph();
    G.addNodesFrom([200,100,300]);
    G.addEdgesFrom([[100,200],[100,300]]);
    matching = maximalMatching(G);
    assert.equal(matching.size, 1);
    G = new Graph();
    G.addNodesFrom([300,200,100]);
    G.addEdgesFrom([[100,200],[100,300]]);
    matching = maximalMatching(G);
    assert.equal(matching.size, 1);
  },

} ;
