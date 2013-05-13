/*jshint strict:false, node:true*/

var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');


exports.TestFunction = {
  beforeEach: function() {
    this.G = jsnx.Graph({0:[1,2,3], 1:[1,2,0], 4:[]}, {name: 'Test'});
    this.Gdegree = new jsnx.Map({0:3, 1:2, 3:1, 4:0});
    this.Gnodes = [0, 1, 2, 3, 4];
    this.Gedges = [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]];
    this.DG = jsnx.DiGraph({0:[1,2,3], 1:[1,2,0], 4:[]});
    this.DGin_degree = new jsnx.Map({0:1, 1:2, 2:2, 3:1, 4:0});
    this.Dout_degree = new jsnx.Map({0:3, 1:3, 2:0, 3:0, 4:0});
    this.DGnodes = [0, 1, 2, 3, 4];
    this.DGedges = [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]];
  },

  test_nodes: function() {
    assert.deepEqual(this.G.nodes(), jsnx.nodes(this.G));
    assert.deepEqual(this.DG.nodes(), jsnx.nodes(this.DG));
  },

  test_edges: function() {
    assert.deepEqual(this.G.edges(), jsnx.edges(this.G));
    assert.deepEqual(this.DG.edges(), jsnx.edges(this.DG));
    assert.deepEqual(this.G.edges([0,1,3]), jsnx.edges(this.G, [0,1,3]));
    assert.deepEqual(this.DG.edges([0,1,3]), jsnx.edges(this.DG, [0,1,3]));
  },

  test_nodes_iter: function() {
    assert.deepEqual(
      jsnx.toArray(this.G.nodes_iter()),
      jsnx.toArray(jsnx.nodes_iter(this.G))
    );
    assert.deepEqual(
      jsnx.toArray(this.DG.nodes_iter()),
      jsnx.toArray(jsnx.nodes(this.DG))
    );
  },

  test_edges_iter: function() {
    assert.deepEqual(
      jsnx.toArray(this.G.edges()),
      jsnx.toArray(jsnx.edges(this.G))
    );
    assert.deepEqual(
      jsnx.toArray(this.DG.edges()),
      jsnx.toArray(jsnx.edges(this.DG))
    );
    assert.deepEqual(
      jsnx.toArray(this.G.edges([0,1,3])),
      jsnx.toArray(jsnx.edges(this.G, [0,1,3]))
    );
    assert.deepEqual(
      jsnx.toArray(this.DG.edges([0,1,3])),
      jsnx.toArray(jsnx.edges(this.DG, [0,1,3]))
    );
  },

  test_degree: function() {
    assert.deepEqual(this.G.degree(), jsnx.degree(this.G));
    assert.deepEqual(this.DG.degree(), jsnx.degree(this.DG));
    assert.deepEqual(this.G.degree([0,1]), jsnx.degree(this.G, [0,1]));
    assert.deepEqual(this.DG.degree([0,1]), jsnx.degree(this.DG, [0,1]));
    assert.deepEqual(this.G.degree(null, 'weight'), jsnx.degree(this.G, null, 'weight'));
    assert.deepEqual(this.DG.degree(null, 'weight'), jsnx.degree(this.DG, null, 'weight'));
  },

  test_neighbors: function() {
    assert.deepEqual(this.G.neighbors(1), jsnx.neighbors(this.G, 1));
    assert.deepEqual(this.DG.neighbors(1), jsnx.neighbors(this.DG, 1));
  },

  test_number_of_nodes: function() {
    assert.equal(this.G.number_of_nodes(), jsnx.number_of_nodes(this.G));
    assert.equal(this.DG.number_of_nodes(), jsnx.number_of_nodes(this.DG));
  },

  test_number_of_edges: function() {
    assert.equal(this.G.number_of_edges(), jsnx.number_of_edges(this.G));
    assert.equal(this.DG.number_of_edges(), jsnx.number_of_edges(this.DG));
  },

  test_is_directed: function() {
    assert.equal(this.G.is_directed(), jsnx.is_directed(this.G));
    assert.equal(this.DG.is_directed(), jsnx.is_directed(this.DG));
  },

  test_subgraph: function() {
    assert.deepEqual(this.G.subgraph([0,1,2,4]), jsnx.subgraph(this.G, [0,1,2,4]));
    assert.deepEqual(this.DG.subgraph([0,1,2,4]), jsnx.subgraph(this.DG, [0,1,2,4]));
  },

  test_create_empty_copy: function() {
    var G = jsnx.create_empty_copy(this.G, false);
    assert.deepEqual(G.nodes(), []);
    assert.deepEqual(G.graph, {});
    assert.deepEqual(G.node, new jsnx.Map());
    assert.deepEqual(G.edge, new jsnx.Map());

    G = jsnx.create_empty_copy(this.G);
    assert.deepEqual(G.nodes(), this.G.nodes());
    assert.deepEqual(G.graph, {});
    assert.deepEqual(G.node, new jsnx.Map(jsnx.helper.fromkeys(this.G.nodes(), {})));
    assert.deepEqual(
      G.edge,
      new jsnx.Map(jsnx.helper.fromkeys(this.G.nodes(), new jsnx.Map()))
    );
  },

  test_degree_histogram: function() {
    assert.deepEqual(jsnx.degree_histogram(this.G), [1,1,1,1,1]);
  },

  test_density: function() {
    assert.equal(jsnx.density(this.G), 0.5);
    assert.equal(jsnx.density(this.DG), 0.3);
    var G = jsnx.Graph();
    G.add_node(1);
    assert.equal(jsnx.density(G), 0.0);
  },

  test_freeze: function() {
    var G = jsnx.freeze(this.G);
    assert.equal(G.frozen, true);
    assert.throws(function(){ G.add_node(1);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.add_nodes_from([1]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.remove_node(1);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.remove_nodes_from([1]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.add_edge([1,2]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.add_edges_from([[1,2]]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.remove_edge([1,2]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.remove_edges_from([[1,2]]);}, jsnx.JSNetworkXError);
    assert.throws(function(){ G.clear();}, jsnx.JSNetworkXError);
  },

  test_is_frozen: function() {
    assert.equal(jsnx.is_frozen(this.G), false);
    var G = jsnx.freeze(this.G);
    assert.equal(G.frozen, jsnx.is_frozen(G));
    assert.equal(jsnx.is_frozen(this.G), true);
  },

  test_info: function() {
    var G = jsnx.path_graph(5);
    var info = jsnx.info(G);
    var expected_graph_info = [
        'Name: path_graph(5)',
        'Type: Graph',
        'Number of nodes: 5',
        'Number of edges: 4',
        'Average degree: 1.6000'
    ].join('\n');

    assert.equal(info, expected_graph_info);
  },

  test_info_digraph: function() {
    var G = jsnx.DiGraph(null, {name: 'path_graph(5)'});
    G.add_path([0,1,2,3,4]);
    var info = jsnx.info(G);
    var expected_graph_info = [
        'Name: path_graph(5)',
        'Type: DiGraph',
        'Number of nodes: 5',
        'Number of edges: 4',
        'Average in degree: 0.8000',
        'Average out degree: 0.8000'
    ].join('\n');
    assert.equal(info, expected_graph_info);

    info = jsnx.info(G, 1);
    var expected_node_info = [
        'Node 1 has the following properties:',
        'Degree: 2',
        'Neighbors: 2'
    ].join('\n');
    assert.equal(info, expected_node_info);

    assert.throws(function(){ jsnx.info(G, -1);}, jsnx.JSNetworkXError);
  }
};
