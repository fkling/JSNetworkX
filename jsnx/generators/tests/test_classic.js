/*jshint strict:false*/

function TestGeneratorClassic() {
    goog.base(this, 'TestGeneratorClassic');
}
goog.inherits(TestGeneratorClassic, BaseTestClass);

//TODO: test_balanced_tree
//TODO: test_balanced_tree_star
//TODO: test_full_rary_tree
//TODO: test_full_rary_tree_balanced
//TODO: test_full_rary_tree_path
//TODO: test_full_rary_tree_empty
//TODO: test_full_rary_tree_3_20
//TODO: test_barbell_graph

TestGeneratorClassic.prototype.test_complete_graph = function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    var g;
    jsnx.forEach([0,1,3,5], function(m) {
        g = jsnx.complete_graph(m);
        expect(jsnx.number_of_nodes(g)).toEqual(m);
        expect(jsnx.number_of_edges(g)).toEqual(Math.floor(m*(m-1) / 2));
    });

    var mg = jsnx.complete_graph(5, jsnx.MultiGraph());
    expect(mg.edges() == g.edges());
};


TestGeneratorClassic.prototype.test_complete_digraph = function() {
    // complete_graph(m) is a connected graph with
    // m nodes and  m*(m+1)/2 edges
    jsnx.forEach([0,1,3,5], function(m) {
        var g = jsnx.complete_graph(m, jsnx.DiGraph());
        expect(jsnx.number_of_nodes(g)).toEqual(m);
        expect(jsnx.number_of_edges(g)).toEqual(Math.floor(m*(m-1)));
    });
};

//TODO: test_complete_bipartite_graph
//TODO: test_circular_ladder_graph

TestGeneratorClassic.prototype.test_cycle_graph = function() {
    var G = jsnx.cycle_graph(4);
    expect(this.sorted(G.edges())).toEqual([['0','1'],['0','3'],['1','2'],['2','3']]);

    var mG = jsnx.cycle_graph(4, /*create_using=*/jsnx.MultiGraph());
    expect(this.sorted(mG.edges())).toEqual([['0','1'],['0','3'],['1','2'],['2','3']]);

    G = jsnx.cycle_graph(4, /*create_using=*/jsnx.DiGraph());
    expect(G.has_edge(2,1)).toEqual(false);
    expect(G.has_edge(1,2)).toEqual(true);
};

//TODO: test_dorogovtsev_goltsev_mendes_graph

TestGeneratorClassic.prototype.test_empty_graph = function() {
    var G = jsnx.empty_graph();
    expect(jsnx.number_of_nodes(G)).toEqual(0);
    G = jsnx.empty_graph(42);
    expect(jsnx.number_of_nodes(G)).toEqual(42);
    expect(jsnx.number_of_edges(G)).toEqual(0);
    expect(G.name()).toEqual('empty_graph(42)');

    // create empty digraph
    G = jsnx.empty_graph(42, jsnx.DiGraph(null, {name: 'duh'}));
    expect(jsnx.number_of_nodes(G)).toEqual(42);
    expect(jsnx.number_of_edges(G)).toEqual(0);
    expect(G.name()).toEqual('empty_graph(42)');
    expect(G instanceof jsnx.DiGraph);

    // create empty multigraph
    G = jsnx.empty_graph(42, jsnx.MultiGraph(null, {name: 'duh'}));
    expect(jsnx.number_of_nodes(G)).toEqual(42);
    expect(jsnx.number_of_edges(G)).toEqual(0);
    expect(G.name()).toEqual('empty_graph(42)');
    expect(G instanceof jsnx.MultiGraph);

    /* TODO:
    // create empty graph from another
    var pete = jsnx.petersen_graph();
    G = jsnx.empty_graph(42, pete);
    expect(jsnx.number_of_nodes(G)).toEqual(42);
    expect(jsnx.number_of_edges(G)).toEqual(0);
    expect(G.name()).toEqual('empty_graph(42)');
    expect(G instanceof jsnx.Graph);
    */
};

//TODO: test_grid_2d_graph
//TODO: test_grid_graph
//TODO: test_hypercube_graph
//TODO: test_ladder_grap    h
//TODO: test_lollipop_graph

TestGeneratorClassic.prototype.test_null_graph = function() {
    expect(jsnx.number_of_nodes(jsnx.null_graph())).toEqual(0);
};

//TODO: test_path_graph
//TODO: test_periodic_grid_2d_graph
//TODO: test_star_graph

TestGeneratorClassic.prototype.test_trivial_graph = function() {
    expect(jsnx.number_of_nodes(jsnx.trivial_graph())).toEqual(1);
};

//TODO: test_wheel_graph

(new TestGeneratorClassic()).run();
