/*global BaseGraphTester:true, BaseAttrGraphTester:true, TestGraph:true, expect: true*/
/*jshint strict:false*/

function BaseDiGraphTester(name) {
    goog.base(this, name);
}
goog.mixin(BaseDiGraphTester.prototype, BaseAttrGraphTester.prototype);
goog.mixin(BaseDiGraphTester.prototype, TestGraph.prototype);

BaseDiGraphTester.prototype.test_has_successor = function() {
    var G = this.K3;
    expect(G.has_successor(0,1)).toBeTruthy();
    expect(G.has_successor(0,-1)).toBeFalsy();
};

BaseDiGraphTester.prototype.test_successors = function() {
    var G = this.K3;
    expect(this.sorted(G.successors(0))).toEqual(['1','2']);
    expect(function(){G.successors(-1);}).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_successors_iter = function() {
    var G = this.K3;
    expect(this.sorted(jsnx.toArray(G.successors_iter(0)))).toEqual(['1','2']);
    expect(function(){G.successors_iter(-1);}).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_has_predecessor = function() {
    var G = this.K3;
    expect(G.has_predecessor(0,1)).toBeTruthy();
    expect(G.has_predecessor(0,-1)).toBeFalsy();
};

BaseDiGraphTester.prototype.test_predecessors = function() {
    var G = this.K3;
    expect(this.sorted(G.predecessors(0))).toEqual(['1','2']);
    expect(function(){G.predecessors(-1);}).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_predecessors_iter = function() {
    var G = this.K3;
    expect(this.sorted(G.predecessors_iter(0))).toEqual(['1','2']);
    expect(function(){G.predecessors_iter(-1);}).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_edges = function() {
    var G = this.K3;
    expect(this.sorted(G.edges())).toEqual(
        [['0','1'], ['0','2'],['1','0'],['1','2'],['2','0'],['2','1']]
    );
    expect(this.sorted(G.edges(0))).toEqual([['0','1'], ['0','2']]);
    expect(function(){G.edges(-1);}).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_edges_iter = function() {
    var G = this.K3;
    expect(this.sorted(G.edges_iter())).toEqual(
        [['0','1'], ['0','2'],['1','0'],['1','2'],['2','0'],['2','1']]
    );
    expect(this.sorted(G.edges_iter(0))).toEqual([['0','1'], ['0','2']]);
};

BaseDiGraphTester.prototype.test_edges_data = function() {
    var G = this.K3;
    expect(this.sorted(G.edges(true))).toEqual(
        [['0','1',{}],['0','2',{}],['1','0',{}],['1','2',{}],['2','0',{}],['2','1',{}]]
    );
    expect(this.sorted(G.edges(0,true))).toEqual([['0','1',{}],['0','2',{}]]);
    expect(function(){ G.edges(-1); }).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_out_edges = function() {
    var G = this.K3;
    expect(this.sorted(G.out_edges())).toEqual(
        [['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']]
    );
    expect(this.sorted(G.out_edges(0))).toEqual([['0','1'],['0','2']]);
    expect(function(){ G.out_edges(-1); }).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_out_edges_iter = function() {
    var G = this.K3;
    expect(this.sorted(G.out_edges_iter())).toEqual(
        [['0','1'],['0','2'],['1','0'],['1','2'],['2','0'],['2','1']]
    );
    expect(this.sorted(G.out_edges_iter(0))).toEqual([['0','1'],['0','2']]);
}; 

BaseDiGraphTester.prototype.test_out_edges_dir = function() {
    var G = this.P3;
    expect(this.sorted(G.out_edges())).toEqual([['0','1'],['1','2']]);
    expect(this.sorted(G.out_edges(0))).toEqual([['0','1']]);
    expect(this.sorted(G.out_edges(2))).toEqual([]);
}; 

BaseDiGraphTester.prototype.test_out_edges_iter_dir = function() {
    var G = this.P3;
    expect(this.sorted(G.out_edges_iter())).toEqual([['0','1'],['1','2']]);
    expect(this.sorted(G.out_edges_iter(0))).toEqual([['0','1']]);
    expect(this.sorted(G.out_edges_iter(2))).toEqual([]);
}; 

BaseDiGraphTester.prototype.test_in_edges_dir = function() {
    var G = this.P3;
    expect(this.sorted(G.in_edges())).toEqual([['0','1'],['1','2']]);
    expect(this.sorted(G.in_edges(0))).toEqual([]);
    expect(this.sorted(G.in_edges(2))).toEqual([['1','2']]);
}; 

BaseDiGraphTester.prototype.test_in_edges_iter_dir = function() {
    var G = this.P3;
    expect(this.sorted(G.in_edges_iter())).toEqual([['0','1'],['1','2']]);
    expect(this.sorted(G.in_edges_iter(0))).toEqual([]);
    expect(this.sorted(G.in_edges_iter(2))).toEqual([['1','2']]);
};

BaseDiGraphTester.prototype.test_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.degree())).toEqual([4,4,4]);
    expect(G.degree()).toEqual({0:4,1:4,2:4});
    expect(G.degree(0)).toEqual(4);
    expect(G.degree([0])).toEqual({0:4});
    expect(function(){ G.degree(-1); }).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.degree_iter())).toEqual([['0',4],['1',4],['2',4]]);
    expect(jsnx.helper.objectFromKV(G.degree_iter())).toEqual({0:4,1:4,2:4});
    expect(jsnx.toArray(G.degree_iter(0))).toEqual([['0',4]]);
};

BaseDiGraphTester.prototype.test_in_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.in_degree())).toEqual([2,2,2]);
    expect(G.in_degree()).toEqual({0:2,1:2,2:2});
    expect(G.in_degree(0)).toEqual(2);
    expect(G.in_degree([0])).toEqual({0:2});
    expect(function(){ G.in_degree(-1); }).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_in_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.in_degree_iter())).toEqual([['0',2],['1',2],['2',2]]);
    expect(jsnx.helper.objectFromKV(G.in_degree_iter())).toEqual({0:2,1:2,2:2});
    expect(jsnx.toArray(G.in_degree_iter(0))).toEqual([['0',2]]);
};

BaseDiGraphTester.prototype.test_in_degree_iter_weighted = function() {
    var G = this.K3;
    G.add_edge(0,1,{weight:0.3,other:1.2});

    expect(jsnx.toArray(G.in_degree_iter(null, 'weight'))).toEqual(
        [['0',2],['1',1.3],['2',2]]
    );
    expect(jsnx.helper.objectFromKV(G.in_degree_iter(null, 'weight'))).toEqual(
        {0:2,1:1.3,2:2}
    );
    expect(jsnx.toArray(G.in_degree_iter(1, 'weight'))).toEqual([['1',1.3]]);

    expect(jsnx.toArray(G.in_degree_iter(null, 'other'))).toEqual(
        [['0',2],['1',2.2],['2',2]]
    );
    expect(jsnx.helper.objectFromKV(G.in_degree_iter(null, 'other'))).toEqual(
        {0:2,1:2.2,2:2}
    );
    expect(jsnx.toArray(G.in_degree_iter(1, 'other'))).toEqual([['1',2.2]]);
};

BaseDiGraphTester.prototype.test_out_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.out_degree())).toEqual([2,2,2]);
    expect(G.out_degree()).toEqual({0:2,1:2,2:2});
    expect(G.out_degree(0)).toEqual(2);
    expect(G.out_degree([0])).toEqual({0:2});
    expect(function(){ G.out_degree(-1); }).toThrow('JSNetworkXError');
};

BaseDiGraphTester.prototype.test_out_degree_iter_weighted = function() {
    var G = this.K3;
    G.add_edge(0,1,{weight:0.3,other:1.2});

    expect(jsnx.toArray(G.out_degree_iter(null, 'weight'))).toEqual(
        [['0',1.3],['1',2],['2',2]]
    );
    expect(jsnx.helper.objectFromKV(G.out_degree_iter(null, 'weight'))).toEqual(
        {0:1.3,1:2,2:2}
    );
    expect(jsnx.toArray(G.out_degree_iter(0, 'weight'))).toEqual([['0',1.3]]);

    expect(jsnx.toArray(G.out_degree_iter(null, 'other'))).toEqual(
        [['0',2.2],['1',2],['2',2]]
    );
    expect(jsnx.helper.objectFromKV(G.out_degree_iter(null, 'other'))).toEqual(
        {0:2.2,1:2,2:2}
    );
    expect(jsnx.toArray(G.out_degree_iter(0, 'other'))).toEqual([['0',2.2]]);
};

BaseDiGraphTester.prototype.test_out_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.out_degree_iter())).toEqual([['0',2],['1',2],['2',2]]);
    expect(jsnx.helper.objectFromKV(G.out_degree_iter())).toEqual({0:2,1:2,2:2});
    expect(jsnx.toArray(G.out_degree_iter(0))).toEqual([['0',2]]);
};

BaseDiGraphTester.prototype.test_size = function() {
    var G = this.K3;
    expect(G.size()).toEqual(6);
    expect(G.number_of_edges()).toEqual(6);
};

BaseDiGraphTester.prototype.test_to_undirected_reciprocal = function() {
    var G = new this.Graph();
    G.add_edge(1,2);
    expect(G.to_undirected().has_edge(1,2)).toBeTruthy();
    expect(G.to_undirected(true).has_edge(1,2)).toBeFalsy();
    G.add_edge(2,1);
    expect(G.to_undirected(true).has_edge(1,2)).toBeTruthy();
};

BaseDiGraphTester.prototype.test_reverse_copy = function() {
    var G = new jsnx.DiGraph([[0,1],[1,2]]);
    var R =  G.reverse();
    expect(this.sorted(R.edges())).toEqual([['1','0'],['2','1']]);
    R.remove_edge(1,0);
    expect(this.sorted(R.edges())).toEqual([['2','1']]);
    expect(this.sorted(G.edges())).toEqual([['0','1'],['1','2']]);
};

BaseDiGraphTester.prototype.test_reverse_nocopy = function() {
    var G = new jsnx.DiGraph([[0,1],[1,2]]);
    var R =  G.reverse(false);
    expect(this.sorted(R.edges())).toEqual([['1','0'],['2','1']]);
    R.remove_edge(1,0);
    expect(this.sorted(R.edges())).toEqual([['2','1']]);
    expect(this.sorted(G.edges())).toEqual([['2','1']]);
};


function BaseAttrDiGraphTester(name) {
    goog.base(this, name);
}

goog.inherits(BaseAttrDiGraphTester, BaseDiGraphTester);


function TestDiGraph() {
    goog.base(this, 'Tests specific to dict-of-dict-of-dict digraph data structure');
}

goog.inherits(TestDiGraph, BaseAttrDiGraphTester);

TestDiGraph.prototype.setUp = function() {
    this.Graph = jsnx.DiGraph;
    // build dict-of-dict-of-dict K3
    var ed1 = {}, ed2 = {}, ed3 = {}, ed4 = {}, ed5 = {}, ed6 = {};
    this.k3adj = {0: {1: ed1, 2: ed2}, 1: {0: ed3, 2: ed4}, 2: {0: ed5, 1: ed6}};
    this.k3edges = [['0', '1'], ['0', '2'], ['1', '2']];
    this.k3nodes = ['0', '1', '2'];
    this.K3 = new this.Graph();
    this.K3.adj = this.K3.succ = this.K3.edge = this.k3adj;
    this.K3.pred = {0: {1: ed3, 2: ed5}, 1: {0: ed1, 2: ed6}, 2: {0: ed2, 1:ed4}};

    ed1 = {}; ed2 = {};
    this.P3 = new this.Graph();
    this.P3.adj = {0: {1: ed1}, 1: {2: ed2}, 2: {}};
    this.P3.succ = this.P3.adj;
    this.P3.pred = {0: {}, 1: {0: ed1}, 2: {1: ed2}};
    this.K3.node = {};
    this.K3.node[0] = {};
    this.K3.node[1] = {};
    this.K3.node[2] = {};
};

TestDiGraph.prototype.test_data_input = function() {
    var G = new this.Graph({1:[2], 2:[1]}, {name: 'test'});
    expect(G.name()).toEqual('test');
    expect(this.sorted(jsnx.helper.items(G.adj))).toEqual([['1', {2: {}}], ['2', {1: {}}]]);
    expect(this.sorted(jsnx.helper.items(G.succ))).toEqual([['1', {2: {}}], ['2', {1: {}}]]);
    expect(this.sorted(jsnx.helper.items(G.pred))).toEqual([['1', {2: {}}], ['2', {1: {}}]]);
};

TestDiGraph.prototype.test_add_edge = function() {
    var G = new this.Graph();
    G.add_edge(0,1);
    expect(G.adj).toEqual({0: {1: {}}, 1: {}});
    expect(G.succ).toEqual({0: {1: {}}, 1: {}});
    expect(G.pred).toEqual({0: {}, 1: {0:{}}});

    G = new this.Graph();
    G.add_edge.apply(G, [0,1]); // G.add_edge(*(0,1))
    expect(G.adj).toEqual({0: {1: {}}, 1: {}});
    expect(G.succ).toEqual({0: {1: {}}, 1: {}});
    expect(G.pred).toEqual({0: {}, 1: {0:{}}});
};

TestDiGraph.prototype.test_add_edges_from = function() {
    var G = new this.Graph();
    G.add_edges_from([[0,1], [0,2,{data:3}]], {data: 2});
    expect(G.adj).toEqual({0: {1: {'data':2}, 2: {'data':3}}, 1: {}, 2: {}});
    expect(G.succ).toEqual({0: {1: {'data':2}, 2: {'data':3}}, 1: {}, 2: {}});
    expect(G.pred).toEqual({0: {}, 1: {0: {'data':2}}, 2: {0: {'data':3}}});

    // too few in tuple
    expect(function(){ G.add_edges_from([[0]]);}).toThrow('JSNetworkXError');
    // too many in tuple
    expect(function(){ G.add_edges_from([[0,1,2,3]]);}).toThrow('JSNetworkXError');
    // not a tuple
    expect(function(){ G.add_edges_from([0]);}).toThrow('TypeError');
};

TestDiGraph.prototype.test_remove_edge = function() {
    var G = this.K3;
    G.remove_edge(0,1);
    expect(G.succ).toEqual({0:{2:{}},1:{0:{},2:{}},2:{0:{},1:{}}});
    expect(G.pred).toEqual({0:{1:{}, 2:{}}, 1:{2:{}}, 2:{0:{},1:{}}});
    expect(function(){ G.remove_edge(-1, 0);}).toThrow('JSNetworkXError');
};

TestDiGraph.prototype.test_remove_edges_from = function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    expect(G.succ).toEqual({0:{2:{}},1:{0:{},2:{}},2:{0:{},1:{}}});
    expect(G.pred).toEqual({0:{1:{}, 2:{}}, 1:{2:{}}, 2:{0:{},1:{}}});
    G.remove_edges_from([[0,0]]); // silent fail
};

// run tests
var testDiGraph = new TestDiGraph();
testDiGraph.run();
