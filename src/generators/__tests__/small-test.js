/*global assert*/
'use strict';

import {couldBeIsomorphic as isIsomorphic} from '../../algorithms';

import {
  makeSmallGraph,
  bullGraph,
  krackhardtKiteGraph
} from '../small';

export var testGeneratorSmall = {
  testMakeSmallGraph: function() {
    var d = {
      type: 'adjacencylist',
      name: 'Bull Graph',
      n: 5,
      list: [[2, 3], [1, 3, 4], [1, 2, 5], [2], [3]]
    };
    var G = makeSmallGraph(d);
    assert.ok(isIsomorphic(G, bullGraph()));
  },

  testPropertiesNamedSmallGraphs: function() {
    var G = bullGraph();
    assert.equal(G.numberOfNodes(), 5);
    assert.equal(G.numberOfEdges(), 5);
    var d = Array.from(G.degree().values()).sort();
    assert.deepEqual(d, [1, 1, 2, 3, 3]);

    // TODO: expect(diameter(G)).toBe(3)
    // TODO: expect(radius(G)).toBe(2)

    // TODO: chvatal_graph
    // TODO: cubical_graph
    // TODO: desargues_graph
    // TODO: diamond_graph
    // TODO: dodecahedral_graph
    // TODO: frucht_graph
    // TODO: heawood_graph
    // TODO: house_graph
    // TODO: house_x_graph
    // TODO: icosahedral_graph
    // TODO: moebius_kantor_graph
    // TODO: octahedral_graph

    G = krackhardtKiteGraph();
    assert.equal(G.numberOfNodes(), 10);
    assert.equal(G.numberOfEdges(), 18);
    d = Array.from(G.degree().values()).sort();
    assert.deepEqual(d, [1, 2, 3, 3, 3, 4, 4, 5, 5, 6]);

    // TODO: pappus_graph
    // TODO: petersen_graph
    // TODO: sedgewick_maze_graph
    // TODO: tetrahedral_graph
    // TODO: truncated_cube_graph
    // TODO: truncated_tetrahedron_graph
    // TODO: tutte_graph
  }
};
