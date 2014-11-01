/*jshint strict:false, node:true*/
/*global utils, assert*/

var Graph = require('../graph');
var DiGraph = require('../digraph');
/*jshint ignore:start*/
var Map = utils.Map;
/*jshint ignore:end*/
var JSNetworkXError = require('../../exceptions/JSNetworkXError');

var funcs = require('../functions');
var toArray = utils.toArray;


exports.TestFunction = {
  beforeEach: function() {
    this.G = new Graph({0:[1,2,3], 1:[1,2,0], 4:[]}, {name: 'Test'});
    this.Gdegree = new Map({0:3, 1:2, 3:1, 4:0});
    this.Gnodes = [0, 1, 2, 3, 4];
    this.Gedges = [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]];
    this.DG = new DiGraph({0:[1,2,3], 1:[1,2,0], 4:[]});
    this.DGin_degree = new Map({0:1, 1:2, 2:2, 3:1, 4:0});
    this.Dout_degree = new Map({0:3, 1:3, 2:0, 3:0, 4:0});
    this.DGnodes = [0, 1, 2, 3, 4];
    this.DGedges = [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]];
  },

  test_nodes: function() {
    assert.deepEqual(this.G.nodes(), funcs.nodes(this.G));
    assert.deepEqual(this.DG.nodes(), funcs.nodes(this.DG));
  },

  test_edges: function() {
    assert.deepEqual(this.G.edges(), funcs.edges(this.G));
    assert.deepEqual(this.DG.edges(), funcs.edges(this.DG));
    assert.deepEqual(this.G.edges([0,1,3]), funcs.edges(this.G, [0,1,3]));
    assert.deepEqual(this.DG.edges([0,1,3]), funcs.edges(this.DG, [0,1,3]));
  },

  test_nodes_iter: function() {
    assert.deepEqual(
      toArray(this.G.nodes_iter()),
      toArray(funcs.nodes_iter(this.G))
    );
    assert.deepEqual(
      toArray(this.DG.nodes_iter()),
      toArray(funcs.nodes_iter(this.DG))
    );
  },

  test_edges_iter: function() {
    assert.deepEqual(
      toArray(this.G.edges_iter()),
      toArray(funcs.edges_iter(this.G))
    );
    assert.deepEqual(
      toArray(this.DG.edges_iter()),
      toArray(funcs.edges_iter(this.DG))
    );
    assert.deepEqual(
      toArray(this.G.edges_iter([0,1,3])),
      toArray(funcs.edges_iter(this.G, [0,1,3]))
    );
    assert.deepEqual(
      toArray(this.DG.edges_iter([0,1,3])),
      toArray(funcs.edges_iter(this.DG, [0,1,3]))
    );
  },

  test_degree: function() {
    assert.deepEqual(this.G.degree(), funcs.degree(this.G));
    assert.deepEqual(this.DG.degree(), funcs.degree(this.DG));
    assert.deepEqual(this.G.degree([0,1]), funcs.degree(this.G, [0,1]));
    assert.deepEqual(this.DG.degree([0,1]), funcs.degree(this.DG, [0,1]));
    assert.deepEqual(
      this.G.degree(null, 'weight'),
      funcs.degree(this.G, null, 'weight')
    );
    assert.deepEqual(
      this.DG.degree(null, 'weight'),
      funcs.degree(this.DG, null, 'weight')
    );
  },

  test_neighbors: function() {
    assert.deepEqual(this.G.neighbors(1), funcs.neighbors(this.G, 1));
    assert.deepEqual(this.DG.neighbors(1), funcs.neighbors(this.DG, 1));
  },

  test_number_of_nodes: function() {
    assert.equal(this.G.number_of_nodes(), funcs.number_of_nodes(this.G));
    assert.equal(this.DG.number_of_nodes(), funcs.number_of_nodes(this.DG));
  },

  test_number_of_edges: function() {
    assert.equal(this.G.number_of_edges(), funcs.number_of_edges(this.G));
    assert.equal(this.DG.number_of_edges(), funcs.number_of_edges(this.DG));
  },

  test_is_directed: function() {
    assert.equal(this.G.is_directed(), funcs.is_directed(this.G));
    assert.equal(this.DG.is_directed(), funcs.is_directed(this.DG));
  },

  test_subgraph: function() {
    assert.deepEqual(
      this.G.subgraph([0,1,2,4]),
      funcs.subgraph(this.G, [0,1,2,4])
    );
    assert.deepEqual(
      this.DG.subgraph([0,1,2,4]),
      funcs.subgraph(this.DG, [0,1,2,4])
    );
  },

  test_create_empty_copy: function() {
    var G = funcs.create_empty_copy(this.G, false);
    assert.deepEqual(G.nodes(), []);
    assert.deepEqual(G.graph, {});
    assert.deepEqual(G.node, new Map());
    assert.deepEqual(G.edge, new Map());

    G = funcs.create_empty_copy(this.G);
    assert.deepEqual(G.nodes(), this.G.nodes());
    assert.deepEqual(G.graph, {});
    assert.deepEqual(G.node, new Map(this.G.nodes().map(v => [v,{}])));
    assert.deepEqual(
      G.edge,
      new Map(this.G.nodes().map(v => [v,new Map()]))
    );
  },

  test_degree_histogram: function() {
    assert.deepEqual(funcs.degree_histogram(this.G), [1,1,1,1,1]);
  },

  test_density: function() {
    assert.equal(funcs.density(this.G), 0.5);
    assert.equal(funcs.density(this.DG), 0.3);
    var G = new Graph();
    G.add_node(1);
    assert.equal(funcs.density(G), 0.0);
  },

  test_freeze: function() {
    var G = funcs.freeze(this.G);
    assert.equal(G.frozen, true);
    assert.throws(function(){ G.add_node(1);}, JSNetworkXError);
    assert.throws(function(){ G.add_nodes_from([1]);}, JSNetworkXError);
    assert.throws(function(){ G.remove_node(1);}, JSNetworkXError);
    assert.throws(function(){ G.remove_nodes_from([1]);}, JSNetworkXError);
    assert.throws(function(){ G.add_edge([1,2]);}, JSNetworkXError);
    assert.throws(function(){ G.add_edges_from([[1,2]]);}, JSNetworkXError);
    assert.throws(function(){ G.remove_edge([1,2]);}, JSNetworkXError);
    assert.throws(function(){ G.remove_edges_from([[1,2]]);}, JSNetworkXError);
    assert.throws(function(){ G.clear();}, JSNetworkXError);
  },

  test_is_frozen: function() {
    assert.equal(funcs.is_frozen(this.G), false);
    var G = funcs.freeze(this.G);
    assert.equal(G.frozen, funcs.is_frozen(G));
    assert.equal(funcs.is_frozen(this.G), true);
  },

  /* TODO: Implement when path_graph is implemented
  test_info: function() {
    var G = path_graph(5);
    var info = info(G);
    var expected_graph_info = [
        'Name: path_graph(5)',
        'Type: Graph',
        'Number of nodes: 5',
        'Number of edges: 4',
        'Average degree: 1.6000'
    ].join('\n');

    assert.equal(info, expected_graph_info);
  },
  */

  test_info_digraph: function() {
    var G = new DiGraph(null, {name: 'path_graph(5)'});
    G.add_path([0,1,2,3,4]);
    var info = funcs.info(G);
    var expected_graph_info = [
        'Name: path_graph(5)',
        'Type: DiGraph',
        'Number of nodes: 5',
        'Number of edges: 4',
        'Average in degree: 0.8000',
        'Average out degree: 0.8000'
    ].join('\n');
    assert.equal(info, expected_graph_info);

    info = funcs.info(G, 1);
    var expected_node_info = [
        'Node 1 has the following properties:',
        'Degree: 2',
        'Neighbors: 2'
    ].join('\n');
    assert.equal(info, expected_node_info);

    assert.throws(function(){ funcs.info(G, -1);}, JSNetworkXError);
  }
};
