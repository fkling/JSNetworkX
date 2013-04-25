/*jshint strict:false*/

var is_isomorphic = jsnx.could_be_isomorphic;

function TestGeneratorSmall() {
  goog.base(this, 'TestGeneratorSmall');
}
goog.inherits(TestGeneratorSmall, BaseTestClass);


TestGeneratorSmall.prototype.test_make_small_graph = function() {
  var d = ["adjacencylist",
    "Bull Graph",
    5,
    [[2,3],[1,3,4],[1,2,5],[2],[3]]
  ];
  var G = jsnx.generators.small.make_small_graph(d);
  expect(is_isomorphic(G, jsnx.bull_graph())).toBe(true);
};


TestGeneratorSmall.prototype.test_properties_named_small_graphs = function() {
  var G = jsnx.bull_graph();
  expect(G.number_of_nodes()).toBe(5);
  expect(G.number_of_edges()).toBe(5);
  var d = goog.object.getValues(/** @type {Object} */ (G.degree()));
  d.sort();
  expect(d).toEqual([1, 1, 2, 3, 3]);
  
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
  expect(G.number_of_nodes()).toBe(10);
  expect(G.number_of_edges()).toBe(18);
  d = goog.object.getValues(/** @type {Object} */ (G.degree()));
  d.sort();
  expect(d).toEqual([1, 2, 3, 3, 3, 4, 4, 5, 5, 6]);

  // TODO: pappus_graph
  // TODO: petersen_graph
  // TODO: sedgewick_maze_graph
  // TODO: tetrahedral_graph
  // TODO: truncated_cube_graph
  // TODO: truncated_tetrahedron_graph
  // TODO: tutte_graph
};

(new TestGeneratorSmall()).run();
