/* global assert*/
'use strict';

import {
  fastGnpRandomGraph,
  gnpRandomGraph,
  binomialGraph,
  erdosRenyiGraph
} from '../randomGraphs';

export var randomGraphs = {

  // TODO: smoke_test_random_graph
  // TODO: test_random_zero_regular_graph

  testGnp: function() {
    this.timeout(5000);
    var generators = [
      gnpRandomGraph,
      binomialGraph,
      erdosRenyiGraph,
      fastGnpRandomGraph
    ];
    for (var generator of generators) {
      var G = generator(10, -1.1);
      assert.equal(G.numberOfNodes(), 10);
      assert.equal(G.numberOfEdges(), 0);

      G = generator(10, 0.1);
      assert.equal(G.numberOfNodes(), 10);

      G = generator(10, 1.1);
      assert.equal(G.numberOfNodes(), 10);
      assert.equal(G.numberOfEdges(), 45);

      G = generator(10, -1.1, true);
      assert(G.isDirected());
      assert.equal(G.numberOfNodes(), 10);
      assert.equal(G.numberOfEdges(), 0);

      G = generator(10, 0.1, true);
      assert(G.isDirected());
      assert.equal(G.numberOfNodes(), 10);

      G = generator(10, 1.1, true);
      assert(G.isDirected());
      assert.equal(G.numberOfNodes(), 10);
      assert.equal(G.numberOfEdges(), 90);

      // assert that random graphs generate all edges for p close to 1
      var edges = 0;
      var runs = 100;
      for (var i = 0; i < runs; i++) {
        edges += generator(10, 0.99999, true).numberOfEdges();
      }
      assert.closeTo(edges / runs, 90, runs * 2 / 100, generator.name);
    }
  }

  // TODO: test_gnm
  // TODO: test_watts_strogatz_big_k
};
