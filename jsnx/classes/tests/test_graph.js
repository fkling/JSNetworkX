/*jshint newcap:false, sub:true */
/*global describe:true, it:true, xit:true, beforeEach:true, expect:true, goog: true, jsnx:true*/
"use strict";

function baseGraphTester(Graph, setup) {

    describe('Tests for data-structure independent graph class features.', function() {
        var options;

        beforeEach(function() {
            options = setup();
        });

        xit('contains (not supported)', function() {
            var G = options.K3;
            // x in G is not supported in JSNetworkX.
            expect(1 in G).toBeTruthy();
            expect(4 in G).toBeFalsy();
            expect('b' in G).toBeFalsy();
            expect([] in G).toBeFalsy(); // no exception for nonhashable
            expect({1:1} in G).toBeFalsy(); // no exception for nonhashbale
        });

        it('order', function() {
            var G = options.K3;
            // assert_equal(len(G),3)
            expect(G.order()).toEqual(3);
            expect(G.number_of_nodes()).toEqual(3);
        });

        it('nodes_iter', function() {
            var G = options.K3,
                nodes = goog.iter.toArray(G.nodes_iter()),
                nodesd = goog.iter.toArray(G.nodes_iter(true));

            nodes.sort();
            nodesd.sort();

            expect(nodes).toEqual(options.k3nodes);
            expect(nodesd).toEqual([['0', {}], ['1', {}], ['2',{}]]);
        });

        it('nodes', function() {
            var G = options.K3,
                nodes = G.nodes(),
                nodesd = G.nodes(true);

            nodes.sort();
            nodesd.sort();

            expect(nodes).toEqual(options.k3nodes);
            expect(nodesd).toEqual([['0', {}], ['1', {}], ['2',{}]]);
        });

        it('has_node', function() {
            var G = options.K3;
            expect(G.has_node(1)).toBeTruthy();
            expect(G.has_node(4)).toBeFalsy();
            expect(G.has_node([])).toBeFalsy(); // no exception for nonhashable
            expect(G.has_node({1: 1})).toBeFalsy(); // no exception for nonhashable
        });

        it('has_edge', function() {
            var G = options.K3;
            expect(G.has_edge(0, 1)).toBeTruthy();
            expect(G.has_edge(0, -1)).toBeFalsy();
        });

        it('neighbors', function() {
            var G = options.K3,
                neighbors = G.neighbors(0);
            neighbors.sort();

            expect(neighbors).toEqual(['1','2']);
            expect(function() { G.neighbors(-1); }).toThrow('JSNetworkXError');
        });

        it('neighbors_iter', function() {
            var G = options.K3,
                neighbors = goog.iter.toArray(G.neighbors(0));
            neighbors.sort();

            expect(neighbors).toEqual(['1','2']);
            expect(function() { G.neighbors(-1); }).toThrow('JSNetworkXError');
        });

        it('edges', function() {
            var G = options.K3,
                edges = G.edges(),
                edges0 = G.edges(0);
            edges.sort();
            edges0.sort();

            expect(edges).toEqual([['0','1'], ['0','2'], ['1','2']]);
            expect(edges0).toEqual([['0','1'], ['0','2']]);
            expect(function() { G.edges(-1); }).toThrow('JSNetworkXError');
        });

        it('edges_iter', function() {
            var G = options.K3,
                edges = goog.iter.toArray(G.edges_iter()),
                edges0 = goog.iter.toArray(G.edges_iter(0));
            edges.sort();
            edges0.sort();

            expect(edges).toEqual([['0','1'], ['0','2'], ['1','2']]);
            expect(edges0).toEqual([['0','1'], ['0','2']]);
            expect(function() { goog.iter.toArray(G.edges(-1)); }).toThrow('JSNetworkXError');
        });

        it('adjacency_list', function() {
            var G = options.K3;
            expect(G.adjacency_list()).toEqual([['1','2'], ['0','2'], ['0','1']]);
        });

        it('degree', function() {
            var G = options.K3;
            expect(goog.object.getValues(G.degree())).toEqual([2, 2, 2]);
            expect(G.degree()).toEqual({0:2,1:2,2:2});
            expect(G.degree(0)).toEqual(2);
            expect(G.degree([0])).toEqual({0:2});
            expect(function() { G.degree(-1);}).toThrow('JSNetworkXError');
        });
        
        it('weighted_degree', function() {
            var G = new Graph();
            G.add_edge(1,2,{weight: 2});
            G.add_edge(2,3,{weight: 3});

            expect(goog.object.getValues(G.degree(null, 'weight'))).toEqual([2,5,3]);
            expect(G.degree(null, 'weight')).toEqual({1:2, 2:5, 3:3});
            expect(G.degree(1, 'weight')).toEqual(2);
            expect(G.degree([1], 'weight')).toEqual({1:2});
        });

        it('degree_iter', function() {
            var G = options.K3;
            expect(goog.iter.toArray(G.degree_iter())).toEqual([['0',2], ['1',2], ['2',2]]);
            expect(jsnx.helper.objectFromKeyValues(G.degree_iter())).toEqual({0:2, 1:2, 2:2});
            expect(goog.iter.toArray(G.degree_iter(0))).toEqual([['0',2]]);
        });

        it('size', function() {
            var G = options.K3;
            expect(G.size()).toEqual(3);
            expect(G.number_of_edges()).toEqual(3);
        });

        it('add_star', function() {
            var G = options.K3.copy(),
                nlist = [12,13,14,15];
            G.add_star(nlist);
            var edges = G.edges(nlist);
            edges.sort();
            expect(edges).toEqual([['12','13'],['12','14'],['12','15']]);

            G = options.K3.copy();
            G.add_star(nlist, {weight: 2});
            edges = G.edges(nlist, true);
            edges.sort();
            expect(edges).toEqual([['12','13',{weight: 2}], ['12','14',{weight: 2}], ['12','15',{weight: 2}]]);
        });

        it('add_path', function() {
            var G = options.K3.copy(),
                nlist = [12,13,14,15];
            G.add_path(nlist);
            var edges = G.edges(nlist);
            edges.sort();
            expect(edges).toEqual([['12','13'], ['13','14'], ['14','15']]);
            G = options.K3.copy();
            G.add_path(nlist, {weight: 2.0});
            edges = G.edges(nlist, true);
            edges.sort();
            expect(edges).toEqual([['12','13',{weight: 2}], ['13','14',{weight: 2}], ['14','15',{weight: 2}]]);
        });

        it('add_cycle', function() {
            var G = options.K3.copy(),
                nlist = [12,13,14,15],
                oklist = [
                    [['12','13'], ['12','15'], ['13','14'], ['14','15']],
                    [['12','13'], ['13','14'], ['14', '15'], ['15','12']]
                ];
            G.add_cycle(nlist);
            var edges = G.edges(nlist);
            edges.sort();
            expect(oklist).toContain(edges);

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
            edges = G.edges(nlist, true);
            edges.sort();
            expect(oklist).toContain(edges);
        });

        it('nbunch_iter', function() {
            var G = options.K3;
            expect(goog.iter.toArray(G.nbunch_iter())).toEqual(options.k3nodes); // all nodes
            expect(goog.iter.toArray(G.nbunch_iter(0))).toEqual(['0']); // single node
            expect(goog.iter.toArray(G.nbunch_iter([0,1]))).toEqual(['0','1']); // sequence
            // sequence with none in graph
            expect(goog.iter.toArray(G.nbunch_iter([-1]))).toEqual([]);
            // string sequence with none in graph
            //expect(goog.iter.toArray(G.nbunch_iter("foo"))).toEqual([]);
            // node not in graph doesn't get caught upon creation of iterator
            var bunch = G.nbunch_iter(-1);
            // but gets caught when iterator used
            expect(function() { goog.iter.toArray(bunch);}).toThrow('JSNetworkXError');
            // unhashable doesn't get caught upon creaton of iterator
            //expect(function() { goog.iter.toArray(bunch);}).toThrow();
        });

        it('selfloop_degree', function() {
            var G = new Graph();
            G.add_edge(1,1);
            expect(goog.object.getValues(G.degree())).toEqual([2]);
            expect(G.degree()).toEqual({1:2});
            expect(G.degree(1)).toEqual(2);
            expect(G.degree([1])).toEqual({1:2});
            expect(G.degree([1], 'weight')).toEqual({1:2});
        });

        it('selfloops', function() {
            var G = options.K3.copy();
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
        });

    });
}

function baseAttrGraphTester(Graph, setup) {
    baseGraphTester(Graph, setup);

    describe('Tests of graph class attribute features.', function() {
        var options;

        beforeEach(function() {
            options = setup();
        });

        function add_attributes(G) {
            G.graph['foo'] = [];
            G.node[0]['foo'] = [];
            G.remove_edge(1,2);
            var ll = [];
            G.add_edge(1,2, {foo: ll});
            G.add_edge(2,1, {foo: ll});
            // attr_dict must be object
            expect(function() { G.add_edge(0,1,[]);}).toThrow('JSNetworkXError');
        }

        function is_deepcopy(H, G) {
            graphs_equal(H, G);
            different_attrdict(H, G);
            deep_copy_attrdict(H, G);
        }

        function deep_copy_attrdict(H, G) {
            deepcopy_graph_attr(H, G);
            deepcopy_node_attr(H, G);
            deepcopy_edge_attr(H, G);
        }

        function deepcopy_graph_attr(H, G) {
            expect(G.graph['foo']).toEqual(H.graph['foo']);
            G.graph['foo'].push(1);
            expect(G.graph['foo']).not.toEqual(H.graph['foo']);
        }

        function deepcopy_node_attr(H, G) {
            expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
            G.node[0]['foo'].push(1);
            expect(G.node[0]['foo']).not.toEqual(H.node[0]['foo']);
        }

        function deepcopy_edge_attr(H, G) {
            expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
            G.get_node(1)[2]['foo'].push(1);
            expect(G.get_node(1)[2]['foo']).not.toEqual(H.get_node(1)[2]['foo']);
        }

        function is_shallow_copy(H, G) {
            graphs_equal(H, G);
            different_attrdict(H, G);
            shallow_copy_attrdict(H, G);
        }

        function shallow_copy_attrdict(H, G) {
            shallow_copy_graph_attr(H,H);
            shallow_copy_node_attr(H,H);
            shallow_copy_edge_attr(H,H);
        }

        function shallow_copy_graph_attr(H, G) {
            expect(G.graph['foo']).toEqual(H.graph['foo']);
            G.graph['foo'].push(1);
            expect(G.graph['foo']).toEqual(H.graph['foo']);
        }
        
        function shallow_copy_node_attr(H, G) {
            expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
            G.node[0]['foo'].push(1);
            expect(G.node[0]['foo']).toEqual(H.node[0]['foo']);
        }

        function shallow_copy_edge_attr(H, G) {
            expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
            G.get_node(1)[2]['foo'].push(1);
            expect(G.get_node(1)[2]['foo']).toEqual(H.get_node(1)[2]['foo']);
        }

        function same_attrdict(H, G) {
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
        }

        function different_attrdict(H, G) {
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
        }

        function graphs_equal(H, G) {
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
                    G.succ = G.ad;
                }
                if(!H.is_directed()) {
                    H.pred = H.adj;
                    H.succ = H.adj;
                }

                expect(G.pred).toEqual(H.pred);
                expect(G.succ).toEqual(H.succ);
                expect(H.succ[1][2]).toBe(H.succ[2][1]);
                expect(G.succ[1][2]).toBe(G.succ[2][1]);
            }
        }
            

        it('weighted_degree', function() {
            var G = new Graph();
            G.add_edge(1,2, {weight:2, other:3});
            G.add_edge(2,3, {weight:3, other:4});

            expect(goog.object.getValues(G.degree(null, 'weight'))).toEqual([2,5,3]);
            expect(G.degree(null, 'weight')).toEqual({1:2,2:5,3:3});
            expect(G.degree(1, 'weight')).toEqual(2);
            expect(G.degree([1], 'weight')).toEqual({1:2});
        });

        it('add_name', function() {
            // data has to be set to null explicitly
            var G = new Graph(null, {name:''});
            expect(G.name()).toEqual('');
            G = new Graph(null, {name: 'test'});
            expect('' + G).toEqual('test');
            expect(G.name()).toEqual('test');
        });

        it('copy', function() {
            var G = options.K3;
            add_attributes(G);
            var H = G.copy();
            is_deepcopy(H, G);
            H = new G.constructor(G);
            is_shallow_copy(H, G);
        });

        it('copy_attr', function() {
            var G = new Graph(null, {foo:[]});
            G.add_node(0, {foo:[]});
            G.add_edge(1,2,{foo:[]});
            var H = G.copy();
            is_deepcopy(H, G);
            H = new G.constructor(G); // just copy
            is_shallow_copy(H, G);
        });

        it('graph_attr', function() {
            var G = options.K3;
            G.graph['foo'] = 'bar';
            expect(G.graph['foo']).toEqual('bar');
            delete G.graph['foo'];
            expect(G.graph).toEqual({});
            var H = new Graph(null, {foo: 'bar'});
            expect(H.graph['foo']).toEqual('bar');
        });

        it('node_attr', function() {
            var G = options.K3;
            G.add_node(1, {foo: 'bar'});
            expect(G.nodes()).toEqual(['0', '1', '2']);
            expect(G.nodes(true)).toEqual([['0',{}],['1',{'foo':'bar'}],['2',{}]]);
            G.node[1]['foo'] = 'baz';
            expect(G.nodes(true)).toEqual([['0',{}],['1',{'foo':'baz'}],['2',{}]]);
        });

        it('node_attr2', function() {
            var G = options.K3,
                a = {foo: 'bar'};
            G.add_node(3, a);
            expect(G.nodes()).toEqual(['0', '1', '2', '3']);
            expect(G.nodes(true)).toEqual([['0',{}],['1',{}],['2',{}],['3', {foo: 'bar'}]]);
        });

        it('edge_attr', function() {
            var G = new Graph();
            G.add_edge(1,2, {foo: 'bar'});
            expect(G.edges(true)).toEqual([['1','2', {foo: 'bar'}]]);
        });

        it('edge_attr2', function() {
            var G = new Graph();
            G.add_edges_from([[1,2],[3,4]],{foo: 'bar'});
            expect(G.edges(true)).toEqual([['1','2', {foo: 'bar'}],['3','4', {foo: 'bar'}]]);
        });
        
        it('edge_attr3', function() {
            var G = new Graph();
            G.add_edges_from([[1,2, {weight: 32}], [3,4,{weight: 64}]], {foo: 'foo'});
            expect(G.edges(true)).toEqual([['1','2',{foo: 'foo', weight: 32}],
                                           ['3','4',{foo: 'foo', weight: 64}]]);
            G.remove_edges_from([[1,2], [3,4]]);
            G.add_edge(1,2,{data: 7, spam: 'bar', bar: 'foo'});
            expect(G.edges(true)).toEqual([['1','2',{data: 7, spam: 'bar', bar: 'foo'}]]);
        });

        it('edge_attr4', function() {
            var G = new Graph();
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
        });

        it('attr_dict_not_dict', function() {
            // attr_dict must be dict
            var G = new Graph();
            var edges = [[1,2]];
            expect(function() { G.add_edges_from(edges,[]); }).toThrow('JSNetworkXError');
        });

        it('to_undirected', function() {
            var G = options.K3;
            add_attributes(G);
            var H = new jsnx.Graph(G);
            is_shallow_copy(H, G);
            H = G.to_undirected();
            is_deepcopy(H,G);
        });


        it('to_directed', function() {
            var G = options.K3;
            add_attributes(G);
            var H = jsnx.DiGraph(G);
            is_shallow_copy(H, G);
            H = G.to_directed();
            is_deepcopy(H, G);
        });

        it('subgraph', function() {
            var G = options.K3;
            add_attributes(G);
            var H = G.subgraph([0,1,2,5]);
            H.name(G.name());
            graphs_equal(H, G);
            same_attrdict(H, G);
            shallow_copy_attrdict(H, G);

            H = G.subgraph(0);
            expect(H.adj).toEqual({0:{}});
            H = G.subgraph([]);
            expect(H.adj).toEqual({});
            expect(G.adj).not.toEqual({});
        });

        it('selfloop_attr', function() {
            var G = options.K3.copy();
            G.add_edge(0,0);
            G.add_edge(1,1, {weight: 2});
            expect(G.selfloop_edges(true)).toEqual([['0','0',{}], ['1','1',{weight:2}]]);
        });
    });
}


function testGraph() {
    function setup() {
        var ed1 = {},
            ed2 = {},
            ed3 = {},
            k3adj = {
                0: { 1: ed1, 2: ed2 },
                1: { 0: ed1, 2: ed3 },
                2: { 0: ed2, 1: ed3 }
            },
            k3edges = [['0', '1'], ['0', '2'], ['1', '2']],
            k3nodes = ['0', '1', '2'],
            K3 = new jsnx.Graph();

            K3.adj = K3.edge = k3adj;
            K3.node = {};
            K3.node[0] = {};
            K3.node[1] = {};
            K3.node[2] = {};

        return {
            k3adj: k3adj,
            k3edges: k3edges,
            k3nodes: k3nodes,
            K3: K3
        };
    }

    baseAttrGraphTester(jsnx.Graph, setup);

    describe('Tests specific to dict-of-dict-of-dict graph data structure', function() {



    });
}


function testGraph() {
    function setup() {
        var ed1 = {},
            ed2 = {},
            ed3 = {},
            k3adj = {
                0: { 1: ed1, 2: ed2 },
                1: { 0: ed1, 2: ed3 },
                2: { 0: ed2, 1: ed3 }
            },
            k3edges = [['0', '1'], ['0', '2'], ['1', '2']],
            k3nodes = ['0', '1', '2'],
            K3 = new jsnx.Graph();

            K3.adj = K3.edge = k3adj;
            K3.node = {};
            K3.node[0] = {};
            K3.node[1] = {};
            K3.node[2] = {};

        return {
            k3adj: k3adj,
            k3edges: k3edges,
            k3nodes: k3nodes,
            K3: K3
        };
    }

    baseAttrGraphTester(jsnx.Graph, setup);

    describe('Tests specific to dict-of-dict-of-dict graph data structure', function() {

        var Graph = jsnx.Graph,
        options;

        beforeEach(function() {
            options = setup();
        });

        it('Accepts data input', function() {
            var G = new Graph({1:[2],2:[1]}, {
                name: "test"
            });

            var items = jsnx.helper.items(G.adj);
            items.sort(function(a, b) {
                return +a[0] - +b[0];
            });

            expect(items).toEqual([['1', {'2': {}}], ['2', {'1': {}}]]);
        });

        it('adjancency_iter', function() {
            var G = options.K3;

            expect(goog.iter.toArray(G.adjacency_iter())).toEqual([
                                                                  ['0', {1: {}, 2: {}}], 
                                                                  ['1', {0: {}, 2: {}}], 
                                                                  ['2', {0: {}, 1: {}}]]);
        });

        it('getitem (get_node)', function() {
            var G = options.K3;
            expect(G.get_node(0)).toEqual({1: {}, 2: {}});
            expect(function() { G.get_node('j'); }).toThrow('KeyError');
            //  assert_raises((TypeError,networkx.NetworkXError), G.__getitem__, ['A'])
        });

        it('add_node', function() {
            var G = new Graph();
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
        });

        it('add_nodes_from', function() {
            var G = new Graph();
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
            var H = new Graph();
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
        });

        it('remove_node', function() {
            var G = options.K3;
            G.remove_node(0);
            expect(G.adj).toEqual({1:{2:{}},2:{1:{}}});
            expect(function() { G.remove_node(-1);}).toThrow('JSNetworkXError');
        });

        it('remove_nodes_from', function() {
            var G = options.K3;
            G.remove_nodes_from([0,1]);
            expect(G.adj).toEqual({2:{}});
            G.remove_nodes_from([-1]); // silent fail
        });

        it('add_edge', function() {
            var G = new Graph();
            G.add_edge(0,1);
            expect(G.adj, {0: {1: {}}, 1: {0: {}}});
            G = new Graph();
            G.add_edge.apply(G, [0,1]); //  G.add_edge(*(0,1))
            expect(G.adj, {0: {1: {}}, 1: {0: {}}});
        });

        it('add_edges_from', function() {
            var G = new Graph();
            G.add_edges_from([[0,1],[0,2,{weight:3}]]);
            expect(G.adj).toEqual({0: {1:{}, 2:{'weight':3}}, 1: {0:{}}, 
                2:{0:{'weight':3}}});
            G = new Graph();
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
        });

        it('remove_edge', function() {
            var G = options.K3;
            G.remove_edge(0,1);
            expect(G.adj).toEqual({0:{2:{}},1:{2:{}},2:{0:{},1:{}}});
            expect(function() { G.remove_edge(-1,0); }).toThrow('JSNetworkXError');
        });

        it('remove_edges_from', function() {
            var G = options.K3;
            G.remove_edges_from([[0,1]]);
            expect(G.adj).toEqual({0:{2:{}},1:{2:{}},2:{0:{},1:{}}});
            G.remove_edges_from([[0,0]]); // silent fail
        });

        it('clear', function() {
            var G = options.K3;
            G.clear();
            expect(G.adj).toEqual({});
        });

        it('edges_data', function() {
            var G = options.K3,
                edges = G.edges(true);
            edges.sort();
            expect(edges).toEqual([['0','1',{}],['0','2',{}],['1','2',{}]]);
            edges = G.edges(0, true);
            expect(edges).toEqual([['0','1',{}],['0','2',{}]]);
            expect(function() { G.edges(-1); }).toThrow('JSNetworkXError');
        });

        it('get_edge_data', function() {
            var G = options.K3;
            expect(G.get_edge_data(0,1)).toEqual({});
            expect(G.get_edge_data(10,20)).toBeNull();
            expect(G.get_edge_data(-1,0)).toBeNull();
            expect(G.get_edge_data(-1,0,1)).toEqual(1);
        });
    });
}

// run tests
testGraph();
