/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

function BaseGraphTester(name) {
    goog.base(this, name || "Tests for data-structure independent graph class features.");
}

goog.inherits(BaseGraphTester, BaseTestClass);


BaseGraphTester.prototype.xtest_contains = function() {
    "not supported";
    var G = this.K3;
    // x in G is not supported in JSNetworkX.
    expect(1 in G).toBeTruthy();
    expect(4 in G).toBeFalsy();
    expect('b' in G).toBeFalsy();
    expect([] in G).toBeFalsy(); // no exception for nonhashable
    expect({1:1} in G).toBeFalsy(); // no exception for nonhashbale
};

BaseGraphTester.prototype.test_order = function() {
    var G = this.K3;
    // assert_equal(len(G),3)
    expect(G.order()).toEqual(3);
    expect(G.number_of_nodes()).toEqual(3);
};

BaseGraphTester.prototype.test_nodes_iter = function() {
    var G = this.K3;

    expect(this.sorted(G.nodes_iter())).toEqual(this.k3nodes);
    expect(this.sorted(G.nodes_iter(true))).toEqual([['0', {}], ['1', {}], ['2',{}]]);
};

BaseGraphTester.prototype.test_nodes = function() {
    var G = this.K3;

    expect(this.sorted(G.nodes())).toEqual(this.k3nodes);
    expect(this.sorted(G.nodes(true))).toEqual([['0', {}], ['1', {}], ['2',{}]]);
};

BaseGraphTester.prototype.test_has_node = function() {
    var G = this.K3;
    expect(G.has_node(1)).toBeTruthy();
    expect(G.has_node(4)).toBeFalsy();
    expect(G.has_node([])).toBeFalsy(); // no exception for nonhashable
    expect(G.has_node({1: 1})).toBeFalsy(); // no exception for nonhashable
};

BaseGraphTester.prototype.test_has_edge = function() {
    var G = this.K3;
    expect(G.has_edge(0, 1)).toBeTruthy();
    expect(G.has_edge(0, -1)).toBeFalsy();
};

BaseGraphTester.prototype.test_neighbors = function() {
    var G = this.K3;

    expect(this.sorted(G.neighbors(0))).toEqual(['1','2']);
    expect(function() { G.neighbors(-1); }).toThrow('JSNetworkXError');
};

BaseGraphTester.prototype.test_neighbors_iter = function() {
    var G = this.K3;

    expect(this.sorted(G.neighbors_iter(0))).toEqual(['1','2']);
    expect(function() { G.neighbors_iter(-1); }).toThrow('JSNetworkXError');
};

BaseGraphTester.prototype.test_edges = function() {
    var G = this.K3;

    expect(this.sorted(G.edges())).toEqual([['0','1'], ['0','2'], ['1','2']]);
    expect(this.sorted(G.edges(0))).toEqual([['0','1'], ['0','2']]);
    expect(function() { G.edges(-1); }).toThrow('JSNetworkXError');
};

BaseGraphTester.prototype.test_edges_iter = function() {
    var G = this.K3;

    expect(this.sorted(G.edges_iter())).toEqual([['0','1'], ['0','2'], ['1','2']]);
    expect(this.sorted(G.edges_iter(0))).toEqual([['0','1'], ['0','2']]);
    expect(function() { jsnx.toArray(G.edges(-1)); }).toThrow('JSNetworkXError');
};

BaseGraphTester.prototype.test_adjacency_list = function() {
    var G = this.K3;
    expect(G.adjacency_list()).toEqual([['1','2'], ['0','2'], ['0','1']]);
};

BaseGraphTester.prototype.test_degree = function() {
    var G = this.K3;
    expect(goog.object.getValues(G.degree())).toEqual([2, 2, 2]);
    expect(G.degree()).toEqual({0:2,1:2,2:2});
    expect(G.degree(0)).toEqual(2);
    expect(G.degree([0])).toEqual({0:2});
    expect(function() { G.degree(-1);}).toThrow('JSNetworkXError');
};

BaseGraphTester.prototype.test_weighted_degree = function() {
    var G = new this.Graph();
    G.add_edge(1,2,{weight: 2});
    G.add_edge(2,3,{weight: 3});

    expect(goog.object.getValues(G.degree(null, 'weight'))).toEqual([2,5,3]);
    expect(G.degree(null, 'weight')).toEqual({1:2, 2:5, 3:3});
    expect(G.degree(1, 'weight')).toEqual(2);
    expect(G.degree([1], 'weight')).toEqual({1:2});
};

BaseGraphTester.prototype.test_degree_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.degree_iter())).toEqual([['0',2], ['1',2], ['2',2]]);
    expect(jsnx.helper.objectFromKV(G.degree_iter())).toEqual({0:2, 1:2, 2:2});
    expect(jsnx.toArray(G.degree_iter(0))).toEqual([['0',2]]);
};

BaseGraphTester.prototype.test_size = function() {
    var G = this.K3;
    expect(G.size()).toEqual(3);
    expect(G.number_of_edges()).toEqual(3);
};

BaseGraphTester.prototype.test_add_star = function() {
    var G = this.K3.copy(),
    nlist = [12,13,14,15];
    G.add_star(nlist);
    expect(this.sorted(G.edges(nlist))).toEqual([['12','13'],['12','14'],['12','15']]);

    G = this.K3.copy();
    G.add_star(nlist, {weight: 2});
    expect(this.sorted(G.edges(nlist, true))).toEqual([['12','13',{weight: 2}], ['12','14',{weight: 2}], ['12','15',{weight: 2}]]);
};

BaseGraphTester.prototype.test_add_path = function() {
    var G = this.K3.copy(),
    nlist = [12,13,14,15];
    G.add_path(nlist);
    expect(this.sorted(G.edges(nlist))).toEqual([['12','13'], ['13','14'], ['14','15']]);

    G = this.K3.copy();
    G.add_path(nlist, {weight: 2.0});
    expect(this.sorted( G.edges(nlist, true))).toEqual([['12','13',{weight: 2}], ['13','14',{weight: 2}], ['14','15',{weight: 2}]]);
};

BaseGraphTester.prototype.test_add_cycle = function() {
    var G = this.K3.copy(),
    nlist = [12,13,14,15],
    oklist = [
        [['12','13'], ['12','15'], ['13','14'], ['14','15']],
        [['12','13'], ['13','14'], ['14', '15'], ['15','12']]
    ];
    G.add_cycle(nlist);
    expect(oklist).toContain(this.sorted(G.edges(nlist)));

    oklist = [ [['12','13',{'weight':1}],
        ['12','15',{'weight':1}],
        ['13','14',{'weight':1}],
        ['14','15',{'weight':1}]],

        [['12','13',{'weight':1}],
            ['13','14',{'weight':1}],
            ['14','15',{'weight':1}],
            ['15','12',{'weight':1}]] 
    ];
    G.add_cycle(nlist, {weight: 1});
    expect(oklist).toContain(this.sorted(G.edges(nlist, true)));
};

BaseGraphTester.prototype.test_nbunch_iter = function() {
    var G = this.K3;
    expect(jsnx.toArray(G.nbunch_iter())).toEqual(this.k3nodes); // all nodes
    expect(jsnx.toArray(G.nbunch_iter(0))).toEqual(['0']); // single node
    expect(jsnx.toArray(G.nbunch_iter([0,1]))).toEqual(['0','1']); // sequence
    // sequence with none in graph
    expect(jsnx.toArray(G.nbunch_iter([-1]))).toEqual([]);
    // string sequence with none in graph
    //expect(jsnx.toArray(G.nbunch_iter("foo"))).toEqual([]);
    // node not in graph doesn't get caught upon creation of iterator
    var bunch = G.nbunch_iter(-1);
    // but gets caught when iterator used
    expect(function() { jsnx.toArray(bunch);}).toThrow('JSNetworkXError');
    // unhashable doesn't get caught upon creaton of iterator
    //expect(function() { jsnx.toArray(bunch);}).toThrow();
};

BaseGraphTester.prototype.test_selfloop_degree = function() {
    var G = new this.Graph();
    G.add_edge(1,1);
    expect(goog.object.getValues(G.degree())).toEqual([2]);
    expect(G.degree()).toEqual({1:2});
    expect(G.degree(1)).toEqual(2);
    expect(G.degree([1])).toEqual({1:2});
    expect(G.degree([1], 'weight')).toEqual({1:2});
};

BaseGraphTester.prototype.test_selfloops = function() {
    var G = this.K3.copy();
    G.add_edge(0, 0);
    expect(G.nodes_with_selfloops()).toEqual(['0']);
    expect(G.selfloop_edges()).toEqual([['0','0']]);
    expect(G.number_of_selfloops()).toEqual(1);
    G.remove_edge(0,0);
    G.add_edge(0, 0);
    G.remove_edges_from([[0,0]]);
    G.add_edge(1,1);
    G.remove_node(1);
    G.add_edge(0,0);
    G.add_edge(1,1);
    G.remove_nodes_from([0,1]);
};

// ----------------------------------------------------------------------

function BaseAttrGraphTester(name) {
    goog.base(this, name || "Tests of graph class attribute features.");
}

goog.inherits(BaseAttrGraphTester, BaseGraphTester);

BaseAttrGraphTester.prototype.test_weighted_degree = function() {
    var G = new this.Graph();
    G.add_edge(1,2, {weight:2, other:3});
    G.add_edge(2,3, {weight:3, other:4});

    expect(goog.object.getValues(G.degree(null, 'weight'))).toEqual([2,5,3]);
    expect(G.degree(null, 'weight')).toEqual({1:2,2:5,3:3});
    expect(G.degree(1, 'weight')).toEqual(2);
    expect(G.degree([1], 'weight')).toEqual({1:2});
};

BaseAttrGraphTester.prototype.add_attributes = function(G) {
    G.graph['foo'] = [];
    G.node[0]['foo'] = [];
    G.remove_edge(1,2);
    var ll = [];
    G.add_edge(1,2, {foo: ll});
    G.add_edge(2,1, {foo: ll});
    // attr_dict must be object
    expect(function() { G.add_edge(0,1,[]);}).toThrow('JSNetworkXError');
};

BaseAttrGraphTester.prototype.test_name = function() {
    // data has to be set to null explicitly
    var G = new this.Graph(null, {name:''});
    expect(G.name()).toEqual('');
    G = new this.Graph(null, {name: 'test'});
    expect('' + G).toEqual('test');
    expect(G.name()).toEqual('test');
};

BaseAttrGraphTester.prototype.test_copy = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = G.copy();
    this.is_deepcopy(H, G);
    H = new G.constructor(G);
    this.is_shallow_copy(H, G);
};

BaseAttrGraphTester.prototype.test_copy_attr = function() {
    var G = new this.Graph(null, {foo:[]});
    G.add_node(0, {foo:[]});
    G.add_edge(1,2,{foo:[]});
    var H = G.copy();
    this.is_deepcopy(H, G);
    H = new G.constructor(G); // just copy
    this.is_shallow_copy(H, G);
};

BaseAttrGraphTester.prototype.is_deepcopy = function(H, G) {
    this.graphs_equal(H, G);
    this.different_attrdict(H, G);
    this.deep_copy_attrdict(H, G);
};

BaseAttrGraphTester.prototype.deep_copy_attrdict = function(H, G) {
    this.deepcopy_graph_attr(H, G);
    this.deepcopy_node_attr(H, G);
    this.deepcopy_edge_attr(H, G);
};

BaseAttrGraphTester.prototype.deepcopy_graph_attr = function(H, G) {
    expect(G.graph['foo']).toEqual(H.graph['foo']);
    G.graph['foo'].push(1);
    expect(G.graph['foo']).not.toEqual(H.graph['foo']);
};

BaseAttrGraphTester.prototype.deepcopy_node_attr = function(H, G) {
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
    G.node[0]['foo'].push(1);
    expect(G.node[0]['foo']).not.toEqual(H.node[0]['foo']);
};

BaseAttrGraphTester.prototype.deepcopy_edge_attr = function(H, G) {
    expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
    G.get_node(1)[2]['foo'].push(1);
    expect(G.get_node(1)[2]['foo']).not.toEqual(H.get_node(1)[2]['foo']);
};

BaseAttrGraphTester.prototype.is_shallow_copy = function(H, G) {
    this.graphs_equal(H, G);
    this.different_attrdict(H, G);
    this.shallow_copy_attrdict(H, G);
};

BaseAttrGraphTester.prototype.shallow_copy_attrdict = function(H, G) {
    this.shallow_copy_graph_attr(H,H);
    this.shallow_copy_node_attr(H,H);
    this.shallow_copy_edge_attr(H,H);
};

BaseAttrGraphTester.prototype.shallow_copy_graph_attr = function(H, G) {
    expect(G.graph['foo']).toEqual(H.graph['foo']);
    G.graph['foo'].push(1);
    expect(G.graph['foo']).toEqual(H.graph['foo']);
};

BaseAttrGraphTester.prototype.shallow_copy_node_attr = function(H, G) {
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
    G.node[0]['foo'].push(1);
    expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
};

BaseAttrGraphTester.prototype.shallow_copy_edge_attr = function(H, G) {
    expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
    G.get_node(1)[2]['foo'].push(1);
    expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
};

BaseAttrGraphTester.prototype.same_attrdict = function(H, G) {
    var old_foo = H.get_node(1)[2]['foo'];
    H.add_edge(1,2, {foo: 'baz'});
    expect(G.edge).toEqual(H.edge);
    H.add_edge(1, 2, {foo: old_foo});
    expect(G.edge).toEqual(H.edge);
    old_foo = H.node[0]['foo'];
    H.node[0]['foo'] = 'baz';
    expect(G.node).toEqual(H.node);
    H.node[0]['foo'] = old_foo;
    expect(G.node).toEqual(H.node);
};

BaseAttrGraphTester.prototype.different_attrdict = function(H, G) {
    var old_foo = H.get_node(1)[2]['foo'];
    H.add_edge(1,2, {foo: 'baz'});
    expect(G.edge).not.toEqual(H.edge);
    H.add_edge(1, 2, {foo: old_foo});
    expect(G.edge).toEqual(H.edge);
    old_foo = H.node[0]['foo'];
    H.node[0]['foo'] = 'baz';
    expect(G.node).not.toEqual(H.node);
    H.node[0]['foo'] = old_foo;
    expect(G.node).toEqual(H.node);
};

BaseAttrGraphTester.prototype.graphs_equal = function(H, G) {
    expect(G.adj).toEqual(H.adj);
    expect(G.edge).toEqual(H.edge);
    expect(G.node).toEqual(H.node);
    expect(G.graph).toEqual(H.graph);
    expect(G.name()).toEqual(H.name());

    if(!G.is_directed() && !H.is_directed()) {
        expect(H.adj[1][2]).toBe(H.adj[2][1]);
        expect(G.adj[1][2]).toBe(G.adj[2][1]);
    }
    else { // at least one is directed
        if(!G.is_directed()) {
            G.pred = G.adj;
            G.succ = G.adj;
        }
        if(!H.is_directed()) {
            H.pred = H.adj;
            H.succ = H.adj;
        }

        expect(G.pred).toEqual(H.pred);
        expect(G.succ).toEqual(H.succ);
        expect(H.succ[1][2]).toBe(H.pred[2][1]);
        expect(G.succ[1][2]).toBe(G.pred[2][1]);
    }
};

BaseAttrGraphTester.prototype.test_graph_attr = function() {
    var G = this.K3;
    G.graph['foo'] = 'bar';
    expect(G.graph['foo']).toEqual('bar');
    delete G.graph['foo'];
    expect(G.graph).toEqual({});
    var H = new this.Graph(null, {foo: 'bar'});
    expect(H.graph['foo']).toEqual('bar');
};

BaseAttrGraphTester.prototype.test_node_attr = function() {
    var G = this.K3;
    G.add_node(1, {foo: 'bar'});
    expect(G.nodes()).toEqual(['0', '1', '2']);
    expect(G.nodes(true)).toEqual([['0',{}],['1',{'foo':'bar'}],['2',{}]]);
    G.node[1]['foo'] = 'baz';
    expect(G.nodes(true)).toEqual([['0',{}],['1',{'foo':'baz'}],['2',{}]]);
};

BaseAttrGraphTester.prototype.test_node_attr2 = function() {
    var G = this.K3,
    a = {foo: 'bar'};
    G.add_node(3, a);
    expect(G.nodes()).toEqual(['0', '1', '2', '3']);
    expect(G.nodes(true)).toEqual([['0',{}],['1',{}],['2',{}],['3', {foo: 'bar'}]]);
};

BaseAttrGraphTester.prototype.test_edge_attr = function() {
    var G = new this.Graph();
    G.add_edge(1,2, {foo: 'bar'});
    expect(G.edges(true)).toEqual([['1','2', {foo: 'bar'}]]);
};

BaseAttrGraphTester.prototype.test_edge_attr2 = function() {
    var G = new this.Graph();
    G.add_edges_from([[1,2],[3,4]],{foo: 'bar'});
    expect(G.edges(true)).toEqual([['1','2', {foo: 'bar'}],['3','4', {foo: 'bar'}]]);
};

BaseAttrGraphTester.prototype.test_edge_attr3 = function() {
    var G = new this.Graph();
    G.add_edges_from([[1,2, {weight: 32}], [3,4,{weight: 64}]], {foo: 'foo'});
    expect(G.edges(true)).toEqual([['1','2',{foo: 'foo', weight: 32}],
                                  ['3','4',{foo: 'foo', weight: 64}]]);
                                  G.remove_edges_from([[1,2], [3,4]]);
                                  G.add_edge(1,2,{data: 7, spam: 'bar', bar: 'foo'});
                                  expect(G.edges(true)).toEqual([['1','2',{data: 7, spam: 'bar', bar: 'foo'}]]);
};

BaseAttrGraphTester.prototype.test_edge_attr4 = function() {
    var G = new this.Graph();
    G.add_edge(1,2, {data:7, spam: 'bar', bar: 'foo'});
    expect(G.edges(true)).toEqual([['1','2',{data: 7, spam: 'bar', bar: 'foo'}]]);

    G.get_node(1)[2]['data'] = 10; // OK to set data like this
    expect(G.edges(true)).toEqual([['1','2',{data: 10, spam: 'bar', bar: 'foo'}]]);

    G.edge[1][2]['data'] = 20; // another spelling, 'edge'
    expect(G.edges(true)).toEqual([['1','2',{data: 20, spam: 'bar', bar: 'foo'}]]);
    G.edge[1][2]['listdata'] = [20,200];
    G.edge[1][2]['weight'] = 20;
    expect(G.edges(true)).toEqual([['1','2',{
        data: 20, 
        spam: 'bar', 
        bar: 'foo',
        listdata: [20,200],
        weight: 20
    }]]);
};

BaseAttrGraphTester.prototype.test_attr_dict_not_dict = function() {
    // attr_dict must be dict
    var G = new this.Graph();
    var edges = [[1,2]];
    expect(function() { G.add_edges_from(edges,[]); }).toThrow('JSNetworkXError');
};

BaseAttrGraphTester.prototype.test_to_undirected = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = new jsnx.Graph(G);
    this.is_shallow_copy(H, G);
    H = G.to_undirected();
    this.is_deepcopy(H,G);
};

BaseAttrGraphTester.prototype.test_to_directed = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = new jsnx.DiGraph(G);
    this.is_shallow_copy(H, G);
    H = G.to_directed();
    this.is_deepcopy(H, G);
};

BaseAttrGraphTester.prototype.test_subgraph = function() {
    var G = this.K3;
    this.add_attributes(G);
    var H = G.subgraph([0,1,2,5]);
    H.name(G.name());
    this.graphs_equal(H, G);
    this.same_attrdict(H, G);
    this.shallow_copy_attrdict(H, G);

    H = G.subgraph(0);
    expect(H.adj).toEqual({0:{}});
    H = G.subgraph([]);
    expect(H.adj).toEqual({});
    expect(G.adj).not.toEqual({});
};

BaseAttrGraphTester.prototype.test_selfloop_attr = function() {
    var G = this.K3.copy();
    G.add_edge(0,0);
    G.add_edge(1,1, {weight: 2});
    expect(G.selfloop_edges(true)).toEqual([['0','0',{}], ['1','1',{weight:2}]]);
};

// ----------------------------------------------------------------------

function TestGraph(name) {
    goog.base(this, name || "Tests specific to dict-of-dict-of-dict graph data structure");
}

goog.inherits(TestGraph, BaseAttrGraphTester);

TestGraph.prototype.setUp = function() {
    var ed1 = {},
        ed2 = {},
        ed3 = {};
    this.Graph = jsnx.Graph;
    // build dict-of-dict-of-dict K3
    this.k3adj = {
            0: { 1: ed1, 2: ed2 },
            1: { 0: ed1, 2: ed3 },
            2: { 0: ed2, 1: ed3 }
        };
    this.k3edges = [['0', '1'], ['0', '2'], ['1', '2']];
    this.k3nodes = ['0', '1', '2'];
    this.K3 = new this.Graph();

    this.K3.adj = this.K3.edge = this.k3adj;
    this.K3.node = {};
    this.K3.node[0] = {};
    this.K3.node[1] = {};
    this.K3.node[2] = {};
};

TestGraph.prototype.test_data_input = function() {
    var G = new this.Graph({1:[2],2:[1]}, {
        name: "test"
    });

    expect(this.sorted(jsnx.helper.items(G.adj))).toEqual([['1', {'2': {}}], ['2', {'1': {}}]]);
};

TestGraph.prototype.test_adjancency_iter = function() {
    var G = this.K3;

    expect(jsnx.toArray(G.adjacency_iter())).toEqual([
            ['0', {1: {}, 2: {}}], 
            ['1', {0: {}, 2: {}}], 
            ['2', {0: {}, 1: {}}]]);
};

TestGraph.prototype.test_getitem = function() {
    var G = this.K3;
    expect(G.get_node(0)).toEqual({1: {}, 2: {}});
    expect(function() { G.get_node('j'); }).toThrow('KeyError');
    //  assert_raises((TypeError,networkx.NetworkXError), G.__getitem__, ['A'])
};

TestGraph.prototype.test_add_node = function() {
    var G = new this.Graph();
    G.add_node(0);
    expect(G.adj).toEqual({0:{}});
    // test add attributes
    G.add_node(1, {c: 'red'});
    G.add_node(2, {c: 'blue'});
    expect(function() { G.add_node(4, []); }).toThrow('JSNetworkXError');
    expect(function() { G.add_node(4, 4); }).toThrow('JSNetworkXError');
    expect(G.node[1]['c']).toEqual('red');
    expect(G.node[2]['c']).toEqual('blue');
    // test upding attributes
    G.add_node(1, {c: 'blue'});
    G.add_node(2, {c: 'red'});
    expect(G.node[1]['c']).toEqual('blue');
    expect(G.node[2]['c']).toEqual('red');
};

TestGraph.prototype.test_add_nodes_from = function() {
    var G = new this.Graph();
    G.add_nodes_from([0,1,2]);
    expect(G.adj).toEqual({0:{},1:{},2:{}});
    // test add attributes
    G.add_nodes_from([0,1,2], {c: 'red'});
    expect(G.node[0]['c']).toEqual('red');
    expect(G.node[2]['c']).toEqual('red');
    // test that attribute dicts are not the same
    expect(G.node[0]).not.toBe(G.node[1]);
    // test updating attributes
    G.add_nodes_from([0,1,2], {c: 'blue'});
    expect(G.node[0]['c']).toEqual('blue');
    expect(G.node[2]['c']).toEqual('blue');
    expect(G.node[0]).not.toBe(G.node[1]);

    // test tuple input
    var H = new this.Graph();
    H.add_nodes_from(G.nodes(true));
    expect(H.node[0]['c']).toEqual('blue');
    expect(H.node[2]['c']).toEqual('blue');
    expect(H.node[0]).not.toBe(H.node[1]);
    // specific overrides general
    H.add_nodes_from([0, [1, {c: 'green'}], [3, {c: 'cyan'}]], {c: 'red'});
    expect(H.node[0]['c']).toEqual('red');
    expect(H.node[1]['c']).toEqual('green');
    expect(H.node[2]['c']).toEqual('blue');
    expect(H.node[3]['c']).toEqual('cyan');
};

TestGraph.prototype.test_remove_node = function() {
    var G = this.K3;
    G.remove_node(0);
    expect(G.adj).toEqual({1:{2:{}},2:{1:{}}});
    expect(function() { G.remove_node(-1);}).toThrow('JSNetworkXError');
};

TestGraph.prototype.test_remove_nodes_from = function() {
    var G = this.K3;
    G.remove_nodes_from([0,1]);
    expect(G.adj).toEqual({2:{}});
    G.remove_nodes_from([-1]); // silent fail
};

TestGraph.prototype.test_add_edge = function() {
    var G = new this.Graph();
    G.add_edge(0,1);
    expect(G.adj, {0: {1: {}}, 1: {0: {}}});
    G = new this.Graph();
    G.add_edge.apply(G, [0,1]); //  G.add_edge(*(0,1))
    expect(G.adj, {0: {1: {}}, 1: {0: {}}});
};

TestGraph.prototype.test_add_edges_from = function() {
    var G = new this.Graph();
    G.add_edges_from([[0,1],[0,2,{weight:3}]]);
    expect(G.adj).toEqual({0: {1:{}, 2:{'weight':3}}, 1: {0:{}}, 
        2:{0:{'weight':3}}});
    G = new this.Graph();
    G.add_edges_from([[0,1],[0,2,{weight:3}],[1,2,{data:4}]], {data:2});
    expect(G.adj).toEqual({
        0: {1:{'data':2}, 2:{'weight':3,'data':2}}, 
        1: {0:{'data':2}, 2:{'data':4}}, 
        2: {0:{'weight':3,'data':2}, 1:{'data':4}} 
    });
    expect(function() { G.add_edges_from([[0]]); })
        .toThrow('JSNetworkXError'); // too few in tuple
    expect(function() { G.add_edges_from([[0,1,2,3]]); })
        .toThrow('JSNetworkXError'); // too many in tuple
    expect(function() { G.add_edges_from([0]); }).toThrow('TypeError'); // not a tuple
};

TestGraph.prototype.test_remove_edge = function() {
    var G = this.K3;
    G.remove_edge(0,1);
    expect(G.adj).toEqual({0:{2:{}},1:{2:{}},2:{0:{},1:{}}});
    expect(function() { G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
};

TestGraph.prototype.test_remove_edges_from = function() {
    var G = this.K3;
    G.remove_edges_from([[0,1]]);
    expect(G.adj).toEqual({0:{2:{}},1:{2:{}},2:{0:{},1:{}}});
    G.remove_edges_from([[0,0]]); // silent fail
};

TestGraph.prototype.test_clear = function() {
    var G = this.K3;
    G.clear();
    expect(G.adj).toEqual({});
};

TestGraph.prototype.test_edges_data = function() {
    var G = this.K3;
    expect(this.sorted(G.edges(true))).toEqual([['0','1',{}],['0','2',{}],['1','2',{}]]);
    expect(this.sorted( G.edges(0, true))).toEqual([['0','1',{}],['0','2',{}]]);
    expect(function() { G.edges(-1); }).toThrow('JSNetworkXError');
};

TestGraph.prototype.test_get_edge_data = function() {
    var G = this.K3;
    expect(G.get_edge_data(0,1)).toEqual({});
    expect(G.get_edge_data(10,20)).toBeNull();
    expect(G.get_edge_data(-1,0)).toBeNull();
    expect(G.get_edge_data(-1,0,1)).toEqual(1);
};

// run tests
var testGraph = new TestGraph();
testGraph.run();
