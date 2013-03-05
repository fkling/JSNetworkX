/*global BaseMultiGraphTester:true, BaseAttrGraphTester:true, 
  TestGraph:true, TestMultiGraph:true, expect: true*/
/*jshint strict:false*/

function BaseMultiDiGraphTester(name) {
    goog.base(this, name);
}
goog.inherits(BaseMultiDiGraphTester, BaseMultiGraphTester);

BaseMultiDiGraphTester.prototype.test_edges = function() {
    var G = this.K3;
    expect(this.sorted(G.edges())).toEqual([
        ['0', '1'], ['0', '2'], ['1', '0'], ['1', '2'], ['2', '0'], ['2', '1']
    ]);
    expect(this.sorted(G.edges(0))).toEqual([
        ['0', '1'], ['0', '2']
    ]);
    expect(function() { G.edges(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_edges_data = function() {
    var G = this.K3;
    expect(this.sorted(G.edges(true))).toEqual([
        ['0','1',{}], ['0','2',{}], ['1','0',{}], 
        ['1','2',{}], ['2','0',{}], ['2','1',{}]
    ]);
    expect(this.sorted(G.edges(0, true))).toEqual([
        ['0','1',{}], ['0', '2',{}]
    ]);
    expect(function() { G.neighbors(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_edges_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.edges_iter()))).toEqual([
        ['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(jsnx.toArray(G.edges_iter(0)))).toEqual([
        ['0','1'], ['0','2']
    ]);
    G.add_edge(0,1);
    expect(this.sorted(jsnx.toArray(G.edges_iter()))).toEqual([
        ['0','1'],['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);

};


BaseMultiDiGraphTester.prototype.test_out_edges = function() {
    var G = this.K3;
    expect(this.sorted(G.out_edges())).toEqual([
        ['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(G.out_edges(0))).toEqual([
        ['0','1'], ['0','2']
    ]);
    expect(function() { G.out_edges(-1); }).toThrow('JSNetworkXError');
    expect(this.sorted(G.out_edges(0,false,true))).toEqual([
        ['0','1','0'],['0','2','0']
    ]);

};


BaseMultiDiGraphTester.prototype.test_out_edges_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.out_edges_iter()))).toEqual([
        ['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(jsnx.toArray(G.out_edges(0)))).toEqual([
        ['0','1'], ['0','2']
    ]);
    G.add_edge(0,1,2);
    expect(function() { G.out_edges(-1); }).toThrow('JSNetworkXError');
    expect(this.sorted(jsnx.toArray(G.out_edges_iter()))).toEqual([
        ['0','1'],['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);

};


BaseMultiDiGraphTester.prototype.test_in_edges = function() {
    var G = this.K3;
    expect(this.sorted(G.in_edges())).toEqual([
        ['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(G.in_edges(0))).toEqual([
        ['1','0'], ['2','0']
    ]);
    expect(function() { G.in_edges(-1); }).toThrow('JSNetworkXError');
    G.add_edge(0,1,2);
    expect(this.sorted(jsnx.toArray(G.out_edges_iter()))).toEqual([
        ['0','1'],['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(G.in_edges(0,false,true))).toEqual([
        ['1','0','0'],['2','0','0']
    ]);

};


BaseMultiDiGraphTester.prototype.test_in_edges_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.in_edges_iter()))).toEqual([
        ['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(jsnx.toArray(G.in_edges(0)))).toEqual([
        ['1','0'], ['2','0']
    ]);
    G.add_edge(0,1,2);
    expect(this.sorted(jsnx.toArray(G.in_edges_iter()))).toEqual([
        ['0','1'],['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']
    ]);
    expect(this.sorted(jsnx.toArray(G.in_edges_iter(true)))).toEqual([
        ['0','1',{}], ['0','1',{}], ['0','2',{}], ['1','0',{}], 
        ['1','2',{}], ['2','0',{}], ['2','1',{}]
    ]);
};


BaseMultiDiGraphTester.prototype.is_shallow = function(H, G) {
    // graph
    expect(G.graph['foo']).toEqual(H.graph['foo']);
    G.graph['foo'].push(1);
    expect(G.graph['foo']).toEqual(H.graph['foo']);
    // node
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
    G.node[0]['foo'].push(1);
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
    //edge
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
    G.get_node(1)[2][0]['foo'].push(1);
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
};


BaseMultiDiGraphTester.prototype.is_deep = function(H, G) {
    // graph
    expect(G.graph['foo']).toEqual(H.graph['foo']);
    G.graph['foo'].push(1);
    expect(G.graph['foo']).not.toEqual(H.graph['foo']);
    // node
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
    G.node[0]['foo'].push(1);
    expect(G.node[0]['foo']).not.toEqual(H.node[0]['foo']);
    //edge
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
    G.get_node(1)[2][0]['foo'].push(1);
    expect(G.get_node(1)[2][0]['foo']).not.toEqual(H.get_node(1)[2][0]['foo']);
};


BaseMultiDiGraphTester.prototype.test_to_undirected = function() {
    // MultiDiGraph -> MultiGraph changes number of edges so it is
    // not a copy operation... use is_shallow, not is_shallow_copy
    var G = this.K3;
    this.add_attributes(G);
    var H = jsnx.MultiGraph(G);
    this.is_shallow(H, G);
    H = G.to_undirected();
    this.is_deep(H,G);
};


BaseMultiDiGraphTester.prototype.test_has_successor = function() {
    var G = this.K3;
    expect(G.has_successor(0,1)).toEqual(true);
    expect(G.has_successor(0,-1)).toEqual(false);
};


BaseMultiDiGraphTester.prototype.test_successors = function() {
    var G = this.K3;
    expect(this.sorted(G.successors(0))).toEqual(['1','2']);
    expect(function() { G.successors(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_successors_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.successors_iter(0)))).toEqual(['1','2']);
    expect(function() { G.successors_iter(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_has_predecessor = function() {
    var G = this.K3;
    expect(G.has_predecessor(0,1)).toEqual(true);
    expect(G.has_predecessor(0,-1)).toEqual(false);
};


BaseMultiDiGraphTester.prototype.test_predecessors = function() {
    var G = this.K3;
    expect(this.sorted(G.predecessors(0))).toEqual(['1','2']);
    expect(function() { G.predecessors(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_predecessors_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.predecessors_iter(0)))).toEqual(['1','2']);
    expect(function() { G.predecessors_iter(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.degree())).toEqual([4,4,4]);
    expect(G.degree()).toEqual({0:4,1:4,2:4});
    expect(G.degree(0)).toEqual(4);
    expect(G.degree([0])).toEqual({0:4});
    expect(function() { G.degree(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.degree_iter())).toEqual([['0',4],['1',4],['2',4]]);
    expect(jsnx.helper.objectFromKV(G.degree_iter())).toEqual({0:4,1:4,2:4});
    expect(jsnx.toArray(G.degree_iter(0))).toEqual([['0',4]]);
    G.add_edge(0,1,{weight:0.3, other: 1.2});
    expect(jsnx.toArray(G.degree_iter(null, 'weight'))).toEqual([
        ['0',4.3], ['1', 4.3], ['2',4]
    ]); 
    expect(jsnx.toArray(G.degree_iter(null, 'other'))).toEqual([
        ['0',5.2], ['1',5.2], ['2',4]
    ]);
};


BaseMultiDiGraphTester.prototype.test_in_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.in_degree())).toEqual([2,2,2]);
    expect(G.in_degree()).toEqual({0:2,1:2,2:2});
    expect(G.in_degree(0)).toEqual(2);
    expect(G.in_degree([0])).toEqual({0:2});
    expect(function() { G.in_degree(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_in_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.in_degree_iter())).toEqual([['0',2],['1',2],['2',2]]);
    expect(jsnx.helper.objectFromKV(G.in_degree_iter())).toEqual({0:2,1:2,2:2});
    expect(jsnx.toArray(G.in_degree_iter(0))).toEqual([['0',2]]);
    expect(jsnx.toArray(G.in_degree_iter(0, 'weight'))).toEqual([
        ['0',2]
    ]); 
};


BaseMultiDiGraphTester.prototype.test_out_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.out_degree())).toEqual([2,2,2]);
    expect(G.out_degree()).toEqual({0:2,1:2,2:2});
    expect(G.out_degree(0)).toEqual(2);
    expect(G.out_degree([0])).toEqual({0:2});
    expect(function() { G.out_degree(-1); }).toThrow('JSNetworkXError');
};


BaseMultiDiGraphTester.prototype.test_out_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.out_degree_iter())).toEqual([['0',2],['1',2],['2',2]]);
    expect(jsnx.helper.objectFromKV(G.out_degree_iter())).toEqual({0:2,1:2,2:2});
    expect(jsnx.toArray(G.out_degree_iter(0))).toEqual([['0',2]]);
    expect(jsnx.toArray(G.out_degree_iter(0, 'weight'))).toEqual([
        ['0',2]
    ]); 
};


BaseMultiDiGraphTester.prototype.test_size = function() {
    var G = this.K3;
    expect(G.size()).toEqual(6);
    expect(G.number_of_edges()).toEqual(6);
    G.add_edge(0,1, {weight:0.3, other:1.2});
    expect(G.size('weight')).toEqual(6.3);
    expect(G.size('other')).toEqual(7.2);
};


BaseMultiDiGraphTester.prototype.test_to_undirected_reciprocal = function() {
    var G = this.Graph();
    G.add_edge(1,2);
    expect(G.to_undirected().has_edge(1,2)).toEqual(true);
    expect(G.to_undirected(true).has_edge(1,2)).toEqual(false);
    G.add_edge(2,1);
    expect(G.to_undirected(true).has_edge(1,2)).toEqual(true);
};


BaseMultiDiGraphTester.prototype.test_reverse_copy = function() {
    var G = jsnx.MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse();
    expect(this.sorted(R.edges())).toEqual([['1','0'],['1','0']]);
    R.remove_edge(1,0);
    expect(this.sorted(R.edges())).toEqual([['1','0']]);
    expect(this.sorted(G.edges())).toEqual([['0','1'],['0','1']]);
};
   

BaseMultiDiGraphTester.prototype.test_reverse_nocopy = function() {
    var G = jsnx.MultiDiGraph([[0,1],[0,1]]);
    var R = G.reverse(false);
    expect(this.sorted(R.edges())).toEqual([['1','0'],['1','0']]);
    R.remove_edge(1,0);
    expect(this.sorted(R.edges())).toEqual([['1','0']]);
    expect(this.sorted(G.edges())).toEqual([['1','0']]);
};
     


function TestMultiDiGraph() {
    goog.base(this, 'TestMultiDiGraph');
}
goog.inherits(TestMultiDiGraph, BaseMultiDiGraphTester);
jsnx.helper.mixin(TestMultiDiGraph.prototype, TestMultiGraph.prototype);



TestMultiDiGraph.prototype.setUp = function() {
    var self = this;
    this.Graph = jsnx.MultiDiGraph;
    // build K3
    this.k3edges = [['0','1'],['0','2'],['1','2']];
    this.k3nodes = ['0', '1', '2'];
    this.K3 = this.Graph();
    this.K3.adj = {0:{},1:{},2:{}};
    this.K3.succ = self.K3.adj;
    this.K3.pred = {0:{},1:{},2:{}};

    goog.array.forEach(this.k3nodes, function(u, i, arr) {
        goog.array.forEach(arr, function(v) {
            if(u !== v) {
                var d = {0:{}};
                self.K3.succ[u][v] = d;
                self.K3.pred[v][u] = d;
            }
        });
    });
    this.K3.adj = this.K3.succ;
    this.K3.edge = this.K3.adj;
    this.K3.node = {};
    this.K3.node[0] = {};
    this.K3.node[1] = {};
    this.K3.node[2] = {};
};


TestMultiDiGraph.prototype.test_add_edge = function() {
    var G = this.Graph();
    G.add_edge(0,1);
    expect(G.adj).toEqual({0: {1:{0:{}}}, 1: {}});
    expect(G.succ).toEqual({0: {1:{0:{}}}, 1: {}});
    expect(G.pred).toEqual({1: {0:{0:{}}}, 0: {}});
    G = this.Graph();
    G.add_edge.apply(G, [0,1]);
    expect(G.adj).toEqual({0: {1:{0:{}}}, 1: {}});
    expect(G.succ).toEqual({0: {1:{0:{}}}, 1: {}});
    expect(G.pred).toEqual({1: {0:{0:{}}}, 0: {}});
};

TestMultiDiGraph.prototype.test_add_edges_from = function() {
    var G = this.Graph();
    G.add_edges_from([[0,1],[0,1,{weight:3}]]);
    expect(G.adj).toEqual({0: {1: { 0:{}, 1:{weight: 3}}}, 1:{}});
    expect(G.succ).toEqual({0: {1: { 0:{}, 1:{weight: 3}}}, 1:{}});
    expect(G.pred).toEqual({1: {0: { 0:{}, 1:{weight: 3}}}, 0:{}});

    G.add_edges_from([[0,1],[0,1,{weight: 3}]], {weight: 2});
    expect(G.adj).toEqual({0: {1: { 0:{}, 
                                    1:{weight: 3}, 
                                    2:{weight: 2}, 
                                    3: {weight: 3}}},
                           1: {}});

    expect(G.pred).toEqual({0:{}, 1: {0:{0:{},1:{weight:3},
                                         2: {weight: 2},
                                         3: {weight:3}}}});
    // too few in tuple
    expect(function(){ G.add_edges_from([[0]]);}).toThrow('JSNetworkXError');
    // too many in tuple
    expect(function(){ G.add_edges_from([[0,1,2,3,4]]); }).toThrow('JSNetworkXError');
    // not a tuple
    expect(function(){ G.add_edges_from([0]); }).toThrow('TypeError');
};


TestMultiDiGraph.prototype.test_remove_edge = function() {
    var G = this.K3;
    G.remove_edge(0,1);
    expect(G.succ).toEqual({0: {2: {0: {}}},
                            1: {0: {0: {}},2:{0:{}}},
                            2: {0: {0: {}},1:{0: {}}}});
    expect(G.pred).toEqual({0: {1: {0: {}},2:{0:{}}},
                            1: {2: {0: {}}},
                            2: {0: {0: {}},1:{0: {}}}});
    expect(function(){ G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
    expect(function(){ G.remove_edge(0,2,1); }).toThrow('JSNetworkXError');
};


TestMultiDiGraph.prototype.remove_multiedge = function() {
    var G = this.K3;
    G.add_edge(0,1,'parallel edge');
    G.remove_edge(0,1,'parallel edge');
    expect(G.adj, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {0: {0:{}}, 2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});

    expect(G.succ, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {0: {0:{}}, 2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});

    expect(G.pred, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {0: {0:{}}, 2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});
    G.remove_edge(0,1);
    expect(G.succ, {0: {2: {0:{}}},
                    1: {0: {0:{}}, 2: {0:{}}},
                    2: {0: {0:{}}, 1: {0:{}}}});

    expect(G.pred, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});
    expect(function(){ G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
};


TestMultiDiGraph.prototype.test_remove_edges_from = function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    expect(G.succ, {0: {2: {0:{}}},
                    1: {0: {0:{}}, 2: {0:{}}},
                    2: {0: {0:{}}, 1: {0:{}}}});

    expect(G.pred, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});
    G.remove_edges_from([[0,0]]); // silent fail
};




(new TestMultiDiGraph()).run();
