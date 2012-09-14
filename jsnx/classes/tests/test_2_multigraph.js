/*global BaseGraphTester:true, BaseAttrGraphTester:true, TestGraph:true, expect: true*/
/*jshint strict:false*/

function BaseMultiGraphTester(name) {
    goog.base(this, name);
}
goog.mixin(BaseMultiGraphTester.prototype, BaseAttrGraphTester.prototype);
goog.mixin(BaseMultiGraphTester.prototype, TestGraph.prototype);

BaseMultiGraphTester.prototype.test_has_edge = function() {
    var G = this.K3;
    expect(G.has_edge(0,1)).toEqual(true);
    expect(G.has_edge(0,-1)).toEqual(false);
    expect(G.has_edge(0,1,0)).toEqual(true);
    expect(G.has_edge(0,1,1)).toEqual(false);
};


BaseMultiGraphTester.prototype.test_get_edge_data = function() {
    var G = this.K3;
    expect(G.get_edge_data(0,1)).toEqual({0:{}});
    expect(G.get_node(0)[1]).toEqual({0:{}});
    expect(G.get_node(0)[1][0]).toEqual({});
    expect(G.get_edge_data(10,20)).toEqual(null);
    expect(G.get_edge_data(0,1,0)).toEqual({});
};


BaseMultiGraphTester.prototype.test_adjacency_iter = function() {
    var G = this.K3;
    expect(jsnx.helper.objectFromKV(G.adjacency_iter())).toEqual(
        {0: {1: {0:{}}, 2: {0:{}}},
         1: {0: {0:{}}, 2: {0:{}}},
         2: {0: {0:{}}, 1: {0:{}}}}
    );
};


BaseMultiGraphTester.prototype.deepcopy_edge_attr = function(H, G) {
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
    G.get_node(1)[2][0]['foo'].push(1);
    expect(G.get_node(1)[2][0]['foo']).not.toEqual(H.get_node(1)[2][0]['foo']);
};


BaseMultiGraphTester.prototype.shallow_copy_edge_attr = function(H, G) {
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
    G.get_node(1)[2][0]['foo'].push(1);
    expect(G.get_node(1)[2][0]['foo']).toEqual(H.get_node(1)[2][0]['foo']);
};


BaseMultiGraphTester.prototype.same_attrdict = function(H, G) {
    // same attrdict in the edgedata
    var old_foo = H.get_node(1)[2][0]['foo'];
    H.add_edge(1,2,0,{foo: 'baz'});
    expect(G.edge).toEqual(H.edge);
    H.add_edge(1,2,0, {foo: old_foo});
    expect(G.edge).toEqual(H.edge);
    // but not same edgedata dict
    H.add_edge(1,2, {foo: 'baz'});
    expect(G.edge).not.toEqual(H.edge);
};


BaseMultiGraphTester.prototype.different_attrdict = function(H, G) {
    // used by graph_equal_but_different
    var old_foo = H.get_node(1)[2][0]['foo'];
    H.add_edge(1,2,0,{foo: 'baz'});
    expect(G.edge).not.toEqual(H.edge);
    H.add_edge(1,2,0, {foo: old_foo});
    expect(G.edge).toEqual(H.edge);
    var HH = H.copy();
    H.add_edge(1,2,{foo:'baz'});
    expect(G.edge).not.toEqual(H.edge);
    H = HH;
    old_foo = H.node[0]['foo'];
    H.node[0]['foo'] = 'baz';
    expect(G.node).not.toEqual(H.node);
    H.node[0]['foo'] = old_foo;
    expect(G.node).toEqual(H.node);
};


BaseMultiGraphTester.prototype.test_to_undirected = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = jsnx.MultiGraph(G);
    this.is_shallow_copy(H, G);
    H = G.to_undirected();
    this.is_deepcopy(H,G);
};


BaseMultiGraphTester.prototype.test_to_directed = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = jsnx.MultiDiGraph(G);
    this.is_shallow_copy(H,G);
    H = G.to_directed();
    this.is_deepcopy(H,G);
};


BaseMultiGraphTester.prototype.test_selfloops2 = function() {
    var G = this.K3;
    G.add_edge(0,0);
    G.add_edge(0,0);
    G.add_edge(0,0,'parallel edge');
    G.remove_edge(0,0,'parallel edge');
    expect(G.number_of_edges(0,0)).toEqual(2);
    G.remove_edge(0,0);
    expect(G.number_of_edges(0,0)).toEqual(1);
};


BaseMultiGraphTester.prototype.test_edge_attr4 = function() {
    var G = this.Graph();
    G.add_edge(1,2,0, {data: 7, spam: 'bar', bar: 'foo'});
    expect(G.edges(true)).toEqual(
        [['1','2',{data:7,spam:'bar',bar:'foo'}]]
    );
    G.get_node(1)[2][0]['data'] = 10; // ok to set data like this
    expect(G.edges(true)).toEqual(
        [['1','2',{data:10,spam:'bar',bar:'foo'}]]
    );
    G.edge[1][2][0]['data'] = 20; // another spelling, "edge"
    expect(G.edges(true)).toEqual(
        [['1','2',{data:20,spam:'bar',bar:'foo'}]]
    );
    G.edge[1][2][0]['listdata'] = [20,200];
    G.edge[1][2][0]['weight'] = 20;
    expect(G.edges(true)).toEqual(
        [['1','2',{data:20,spam:'bar',
                            bar:'foo',listdata:[20,200],weight:20}]]
    );
};
    

function TestMultiGraph() {
    goog.base(this, 'TestMultiGraph');
}

goog.inherits(TestMultiGraph, BaseMultiGraphTester);

TestMultiGraph.prototype.setUp = function() {
    this.Graph = jsnx.MultiGraph;
    // build K3
    var ed1 = {0:{}},
        ed2 = {0:{}},
        ed3 = {0:{}};

    this.k3adj = {
        0:{1:ed1, 2:ed2},
        1:{0:ed1, 2:ed3},
        2:{0:ed2, 1:ed3}
    };
    this.k3edges = [['0','1'],['0','2'],['1','2']];
    this.k3nodes = ['0', '1', '2'];
    this.K3 = this.Graph();
    this.K3.adj = this.K3.edge = this.k3adj;
    this.K3.node = {};
    this.K3.node[0] = {};
    this.K3.node[1] = {};
    this.K3.node[2] = {};
};


TestMultiGraph.prototype.test_data_input = function() {
    var G = this.Graph({1:[2], 2:[1]}, {name: 'test'});
    expect(G.name()).toEqual('test');
    expect(this.sorted(jsnx.toArray(jsnx.helper.iteritems(G.adj)))).toEqual(
        [['1', {2: {0:{}}}], ['2',{1:{0:{}}}]]
    );
};


TestMultiGraph.prototype.test_getitem = function() {
    var G = this.K3;
    expect(G.get_node(0)).toEqual({1:{0:{}}, 2:{0:{}}});
    expect(function(){ G.get_node('j'); }).toThrow('KeyError');
    expect(function(){ G.get_node(['A']); }).toThrow('KeyError');
    
};


TestMultiGraph.prototype.test_remove_node = function() {
    var G = this.K3;
    G.remove_node(0);
    expect(G.adj).toEqual({1:{2:{0:{}}},2:{1:{0:{}}}});
    expect(function(){ G.remove_node(-1); }).toThrow('JSNetworkXError');
};


TestMultiGraph.prototype.test_add_edge = function() {
    var G = this.Graph();
    G.add_edge(0,1);
    expect(G.adj).toEqual({0: {1:{0:{}}}, 1: {0:{0:{}}}});
    G = this.Graph();
    G.add_edge.apply(G, [0,1]);
    expect(G.adj).toEqual({0: {1:{0:{}}}, 1: {0:{0:{}}}});
};


TestMultiGraph.prototype.test_add_edge_conflicting_key = function() {
    var G = this.Graph();
    G.add_edge(0,1,1);
    G.add_edge(0,1);
    expect(G.number_of_edges()).toEqual(2);
    G = this.Graph();
    G.add_edges_from([[0,1,1,{}]]);
    G.add_edges_from([[0,1]]);
    expect(G.number_of_edges()).toEqual(2);
};


TestMultiGraph.prototype.test_add_edges_from = function() {
    var G = this.Graph();
    G.add_edges_from([[0,1],[0,1,{weight:3}]]);
    expect(G.adj).toEqual({0: {1: { 0:{}, 1:{weight: 3} } },
                           1: {0: { 0:{}, 1: {weight: 3} } }});
    G.add_edges_from([[0,1],[0,1,{weight: 3}]], {weight: 2});
    expect(G.adj).toEqual({0: {1: { 0:{}, 1:{weight: 3}, 2:{weight: 2}, 3: {weight: 3}} },
                           1: {0: { 0:{}, 1: {weight: 3}, 2:{weight: 2}, 3: {weight: 3} } }});

    // too few in tuple
    expect(function(){ G.add_edges_from([[0]]);}).toThrow('JSNetworkXError');
    // too many in tuple
    expect(function(){ G.add_edges_from([[0,1,2,3,4]]); }).toThrow('JSNetworkXError');
    // not a tuple
    expect(function(){ G.add_edges_from([0]); }).toThrow('TypeError');
};


TestMultiGraph.prototype.test_remove_edge = function() {
    var G = this.K3;
    G.remove_edge(0,1);
    expect(G.adj).toEqual({0: {2: {0: {}}},
                            1: {2: {0: {}}},
                            2: {0: {0: {}},
                                1: {0: {}}}});
    expect(function(){ G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
    expect(function(){ G.remove_edge(0,2,1); }).toThrow('JSNetworkXError');
};


TestMultiGraph.prototype.test_remove_edges_from = function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    expect(G.adj).toEqual({0:{2:{0:{}}},1:{2:{0:{}}},2:{0:{0:{}},1:{0:{}}}});
    G.remove_edges_from([[0,0]]); // silent fail
};


TestMultiGraph.prototype.remove_multiedge = function() {
    var G = this.K3;
    G.add_edge(0,1,'parallel edge');
    G.remove_edge(0,1,'parallel edge');
    expect(G.adj, {0: {1: {0:{}}, 2: {0:{}}},
                           1: {0: {0:{}}, 2: {0:{}}},
                           2: {0: {0:{}}, 1: {0:{}}}});
    G.remove_edge(0,1);
    expect(G.adj).toEqual({0:{2:{0:{}}},1:{2:{0:{}}},2:{0:{0:{}},1:{0:{}}}});
    expect(function(){ G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
};


(new TestMultiGraph()).run();
