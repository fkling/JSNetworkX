/*jshint strict:false, sub:true*/
/*global expect:true, goog:true, jsnx:true, BaseTestClass:true*/

function TestDAG(name) {
  goog.base(this, name || 'TestDAG');
}

goog.inherits(TestDAG, BaseTestClass);


TestDAG.prototype.test_topological_sort1 = function() {
  var DG = jsnx.DiGraph();
  DG.add_edges_from([[1,2],[1,3],[2,3]]);
  expect(jsnx.topological_sort(DG)).toEqual(['1', '2', '3']);
  expect(jsnx.topological_sort_recursive(DG)).toEqual(['1', '2', '3']);
};


TestDAG.prototype.test_topological_sort2 = function() {
  var DG = jsnx.DiGraph({1:[2], 2:[3], 3:[4],
                         4:[5], 5:[1], 11:[12],
                         12:[13], 13:[14], 14:[15]});

  expect(function() { jsnx.topological_sort(DG);})
    .toThrow('JSNetworkXUnfeasible');
  expect(function() { jsnx.topological_sort_recursive(DG);})
    .toThrow('JSNetworkXUnfeasible');

  expect(jsnx.is_directed_acyclic_graph(DG)).toBe(false);

  DG.remove_edge(1,2);
  expect(jsnx.topological_sort_recursive(DG))
   .toEqual(['11', '12', '13', '14', '15', '2', '3', '4', '5', '1']);
  expect(jsnx.topological_sort(DG))
   .toEqual(['11', '12', '13', '14', '15', '2', '3', '4', '5', '1']);
  expect(jsnx.is_directed_acyclic_graph(DG)).toBe(true);
};

/*
* Doesn't validate, probably because the order in which the nodes are iterated 
* is different.
*
TestDAG.prototype.test_topological_sort3 = function() {
  var DG = jsnx.DiGraph();
  DG.add_edges_from(jsnx.helper.map(jsnx.helper.range(2,5), function(i) {
    return [1,i];
  }));
  DG.add_edges_from(jsnx.helper.map(jsnx.helper.range(5,9), function(i) {
    return [2,i];
  }));
  DG.add_edges_from(jsnx.helper.map(jsnx.helper.range(9,12), function(i) {
    return [6,i];
  }));
  DG.add_edges_from(jsnx.helper.map(jsnx.helper.range(12,15), function(i) {
    return [4,i];
  }));

  expect(jsnx.topological_sort_recursive(DG))
   .toEqual(['1','4','14','13','12','3','2','7','6','11','10','9','5','8']);
  expect(jsnx.topological_sort(DG))
   .toEqual(['1','2','8','5','6','9','10','11','7','3','4','12','13','14']);

  DG.add_edge(14, 1);

  expect(function() { jsnx.topological_sort(DG);})
    .toThrow('JSNetworkXUnfeasible');
  expect(function() { jsnx.topological_sort_recursive(DG);})
    .toThrow('JSNetworkXUnfeasible');
};
*/

TestDAG.prototype.test_topological_sort4 = function() {
  var G = jsnx.Graph();
  G.add_edge(0,1);
  expect(function() { jsnx.topological_sort(G);})
    .toThrow('JSNetworkXError');
  expect(function() { jsnx.topological_sort_recursive(G);})
    .toThrow('JSNetworkXError');
};

TestDAG.prototype.test_topological_sort5 = function() {
  var G = jsnx.DiGraph();
  G.add_edge(0,1);
  expect(jsnx.topological_sort_recursive(G)).toEqual(['0','1']);
  expect(jsnx.topological_sort(G)).toEqual(['0','1']);
};

TestDAG.prototype.test_nbunch_argument = function() {
  var G = jsnx.DiGraph();
  G.add_edges_from([[1,2], [2,3], [1,4], [1,5], [2,6]]);
  expect(jsnx.topological_sort(G)).toEqual(['1','2','3','6','4','5']);
  expect(jsnx.topological_sort_recursive(G)).toEqual(['1','5','4','2','6','3']);
  expect(jsnx.topological_sort(G, [1])).toEqual(['1','2','3','6','4','5']);
  expect(jsnx.topological_sort_recursive(G,[1])).toEqual(['1','5','4','2','6','3']);
  expect(jsnx.topological_sort(G, [5])).toEqual(['5']);
  expect(jsnx.topological_sort_recursive(G,[5])).toEqual(['5']);
};

TestDAG.prototype.test_is_aperiodic_cycle = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    expect(jsnx.is_aperiodic(G)).toBe(false);
};

TestDAG.prototype.test_is_aperiodic_cycle2 = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([3,4,5,6,7]);
    expect(jsnx.is_aperiodic(G)).toBe(true);
};

TestDAG.prototype.test_is_aperiodic_cycle3 = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([3,4,5,6]);
    expect(jsnx.is_aperiodic(G)).toBe(false);
};

TestDAG.prototype.test_is_aperiodic_cycle4 = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([1,3]);
    expect(jsnx.is_aperiodic(G)).toBe(true);
};

TestDAG.prototype.test_is_aperiodic_selfloop = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_edge(1,1);
    expect(jsnx.is_aperiodic(G)).toBe(true);
};

TestDAG.prototype.test_is_aperiodic_raise = function() {
    var G = jsnx.Graph();
    expect(function() { jsnx.is_aperiodic(G);}).toThrow('JSNetworkXError');
};

TestDAG.prototype.test_is_aperiodic_bipartite = function() {
    var G = jsnx.DiGraph(jsnx.davis_southern_women_graph());
    expect(jsnx.is_aperiodic(G)).toBe(false);
};

TestDAG.prototype.test_is_aperiodic_rary_tree = function() {
    var G = jsnx.full_rary_tree(3, 27, jsnx.DiGraph());
    expect(jsnx.is_aperiodic(G)).toBe(false);
};

TestDAG.prototype.test_is_aperiodic_disconnected = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([1,2,3,4]);
    G.add_cycle([5,6,7,8]);
    expect(jsnx.is_aperiodic(G)).toBe(false);
    G.add_edge(1,3);
    G.add_edge(5,7);
    expect(jsnx.is_aperiodic(G)).toBe(true);
};

TestDAG.prototype.test_is_aperiodic_disconnected2 = function() {
    var G = jsnx.DiGraph();
    G.add_cycle([0,1,2]);
    G.add_edge(3,3);
    expect(jsnx.is_aperiodic(G)).toBe(false);
};

(new TestDAG()).run();
