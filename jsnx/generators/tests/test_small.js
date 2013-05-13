/*jshint strict:false, node:true*/


var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');
var is_isomorphic = jsnx.could_be_isomorphic;

exports.TestGeneratorSmall = {
  test_make_small_graph: function() {
    var d = [
      "adjacencylist",
      "Bull Graph",
      5,
      [[2,3],[1,3,4],[1,2,5],[2],[3]]
    ];
    var G = jsnx.generators.small.make_small_graph(d);
    assert.equal(is_isomorphic(G, jsnx.bull_graph()), true);
  },

  test_properties_named_small_graphs: function() {
    var G = jsnx.bull_graph();
    assert.equal(G.number_of_nodes(), 5);
    assert.equal(G.number_of_edges(), 5);
    var d = G.degree().values().sort();
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

    G = jsnx.krackhardt_kite_graph();
    assert.equal(G.number_of_nodes(), 10);
    assert.equal(G.number_of_edges(), 18);
    d = G.degree().values().sort();
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
