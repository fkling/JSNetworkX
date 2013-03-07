/*jshint strict:false*/

var is_isomorphic = jsnx.could_be_isomorphic;

function TestGeneratorClassic() {
    goog.base(this, 'TestGeneratorClassic');
}
goog.inherits(TestGeneratorClassic, BaseTestClass);

TestGeneratorClassic.prototype.test_balanced_tree = function() {
  goog.array.forEach([[2,2],[3,3],[6,2]], function(d) {
    var r = d[0];
    var h = d[1];
    var t = jsnx.balanced_tree(r, h);
    var order = t.order();
    expect(order).toBe((Math.pow(r, h+1) - 1) / (r - 1));
    // TODO: Implement is_connected
    // expect(jsnx.is_connected(t)).toBe(true);
    expect(t.size() === order - 1);
    var dh = jsnx.degree_histogram(t);
    expect(dh[0]).toBe(0); // no nodes of 0
    expect(dh[1]).toBe(Math.pow(r,h)); // nodes of degree 1 are leaves
    expect(dh[r]).toBe(1); // root is degree r
    expect(dh[r+1]).toBe(order - Math.pow(r, h) - 1); // everyone else is degree r+1
    expect(dh.length).toBe(r+2);
  });
};
//TODO: test_balanced_tree_star

TestGeneratorClassic.prototype.test_full_rary_tree = function() {
  var r = 2;
  var n = 9;
  var t = jsnx.full_rary_tree(r,n);
  expect(t.order()).toBe(n);
  //TODO: Implement is_connected
  // expect(jsnx.is_connected(t)).toBe(true);
  var dh = jsnx.degree_histogram(t);
  expect(dh[0]).toBe(0); // no nodes of 0
  expect(dh[1]).toBe(5); // nodes of degree 1 are leaves
  expect(dh[r]).toBe(1); // root is degree r
  expect(dh[r+1]).toBe(9-5-1); // everyone else is degree r+1
  expect(dh.length).toBe(r+2);
};

TestGeneratorClassic.prototype.test_rary_tree_balanced = function() {
  var t = jsnx.full_rary_tree(2,15);
  var th = jsnx.balanced_tree(2,3);
  expect(is_isomorphic(t, th)).toBe(true);
};

TestGeneratorClassic.prototype.test_rary_tree_path = function() {
  var t = jsnx.full_rary_tree(1,10);
  expect(is_isomorphic(t, jsnx.path_graph(10))).toBe(true);
};

TestGeneratorClassic.prototype.test_rary_tree_empty = function() {
  var t = jsnx.full_rary_tree(0,10);
  expect(is_isomorphic(t, jsnx.empty_graph(10))).toBe(true);
  t = jsnx.full_rary_tree(3,0);
  expect(is_isomorphic(t, jsnx.empty_graph(0))).toBe(true);
};

TestGeneratorClassic.prototype.test_rary_tree_3_20 = function() {
  var t = jsnx.full_rary_tree(3,20);
  expect(t.order()).toBe(20);
};

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

    /* TODO: peterson_graph
    // create empty graph from another
    var pete = jsnx.petersen_graph();
    G = jsnx.empty_graph(42, pete);
    expect(jsnx.number_of_nodes(G)).toEqual(42);
    expect(jsnx.number_of_edges(G)).toEqual(0);
    expect(G.name()).toEqual('empty_graph(42)');
    expect(G instanceof jsnx.Graph);
    */
};

TestGeneratorClassic.prototype.test_grid_2d_graph = function() {
  var n = 5;
  var m = 6;

  var G = jsnx.grid_2d_graph(n,m);
  expect(jsnx.number_of_nodes(G)).toBe(n*m);
  expect(jsnx.degree_histogram(G)).toEqual([0,0,4,2*(n+m)-8,(n-2)*(m-2)]);
  var DG = jsnx.grid_2d_graph(n, m, false, jsnx.DiGraph());
  expect(DG.succ).toEqual(G.adj);
  expect(DG.pred).toEqual(G.adj);
  var MG = jsnx.grid_2d_graph(n, m, false, jsnx.MultiGraph());
  expect(MG.edges()).toEqual(G.edges());
};

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
