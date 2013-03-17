/*jshint strict:false*/


function TestFunction() {
    goog.base(this, 'TestFunction');
}

goog.inherits(TestFunction, BaseTestClass);

TestFunction.prototype.setUp = function() {
    this.G = jsnx.Graph({0:[1,2,3], 1:[1,2,0], 4:[]}, {name: 'Test'});
    this.Gdegree = {0:3, 1:2, 3:1, 4:0};
    this.Gnodes = ['0', '1', '2', '3', '4'];
    this.Gedges = [['0','1'],['0','2'],['0','3'],['1','0'],['1','1'],['1','2']];
    this.DG = jsnx.DiGraph({0:[1,2,3], 1:[1,2,0], 4:[]});
    this.DGin_degree = {0:1, 1:2, 2:2, 3:1, 4:0};
    this.Dout_degree = {0:3, 1:3, 2:0, 3:0, 4:0};
    this.DGnodes = ['0', '1', '2', '3', '4'];
    this.DGedges = [['0','1'],['0','2'],['0','3'],['1','0'],['1','1'],['1','2']];
};

TestFunction.prototype.test_nodes = function() {
    expect(this.G.nodes()).toEqual(jsnx.nodes(this.G));
    expect(this.DG.nodes()).toEqual(jsnx.nodes(this.DG));
};

TestFunction.prototype.test_edges = function() {
    expect(this.G.edges()).toEqual(jsnx.edges(this.G));
    expect(this.DG.edges()).toEqual(jsnx.edges(this.DG));
    expect(this.G.edges([0,1,3])).toEqual(jsnx.edges(this.G, [0,1,3]));
    expect(this.DG.edges([0,1,3])).toEqual(jsnx.edges(this.DG, [0,1,3]));
};

TestFunction.prototype.test_nodes_iter = function() {
    expect(jsnx.toArray(this.G.nodes())).toEqual(jsnx.toArray(jsnx.nodes(this.G)));
    expect(jsnx.toArray(this.DG.nodes())).toEqual(jsnx.toArray(jsnx.nodes(this.DG)));
};

TestFunction.prototype.test_edges_iter = function() {
    expect(jsnx.toArray(this.G.edges()))
        .toEqual(jsnx.toArray(jsnx.edges(this.G)));
    expect(jsnx.toArray(this.DG.edges()))
        .toEqual(jsnx.toArray(jsnx.edges(this.DG)));
    expect(jsnx.toArray(this.G.edges([0,1,3])))
        .toEqual(jsnx.toArray(jsnx.edges(this.G, [0,1,3])));
    expect(jsnx.toArray(this.DG.edges([0,1,3])))
        .toEqual(jsnx.toArray(jsnx.edges(this.DG, [0,1,3])));
};

TestFunction.prototype.test_degree = function() {
    expect(this.G.degree()).toEqual(jsnx.degree(this.G));
    expect(this.DG.degree()).toEqual(jsnx.degree(this.DG));
    expect(this.G.degree([0,1])).toEqual(jsnx.degree(this.G, [0,1]));
    expect(this.DG.degree([0,1])).toEqual(jsnx.degree(this.DG, [0,1]));
    expect(this.G.degree(null, 'weight')).toEqual(jsnx.degree(this.G, null, 'weight'));
    expect(this.DG.degree(null, 'weight')).toEqual(jsnx.degree(this.DG, null, 'weight'));
};

TestFunction.prototype.test_neighbors = function() {
    expect(this.G.neighbors(1)).toEqual(jsnx.neighbors(this.G, 1));
    expect(this.DG.neighbors(1)).toEqual(jsnx.neighbors(this.DG, 1));
};

TestFunction.prototype.test_number_of_nodes = function() {
    expect(this.G.number_of_nodes()).toEqual(jsnx.number_of_nodes(this.G));
    expect(this.DG.number_of_nodes()).toEqual(jsnx.number_of_nodes(this.DG));
};

TestFunction.prototype.test_number_of_edges = function() {
    expect(this.G.number_of_edges()).toEqual(jsnx.number_of_edges(this.G));
    expect(this.DG.number_of_edges()).toEqual(jsnx.number_of_edges(this.DG));
};

TestFunction.prototype.test_is_directed = function() {
    expect(this.G.is_directed()).toEqual(jsnx.is_directed(this.G));
    expect(this.DG.is_directed()).toEqual(jsnx.is_directed(this.DG));
};

TestFunction.prototype.test_subgraph = function() {
    expect(this.G.subgraph([0,1,2,4])).toEqual(jsnx.subgraph(this.G, [0,1,2,4]));
    expect(this.DG.subgraph([0,1,2,4])).toEqual(jsnx.subgraph(this.DG, [0,1,2,4]));
};

TestFunction.prototype.test_create_empty_copy = function() {
    var G = jsnx.create_empty_copy(this.G, false);
    expect(G.nodes()).toEqual([]);
    expect(G.graph).toEqual({});
    expect(G.node).toEqual({});
    expect(G.edge).toEqual({});

    G = jsnx.create_empty_copy(this.G);
    expect(G.nodes()).toEqual(this.G.nodes());
    expect(G.graph).toEqual({});
    expect(G.node).toEqual(jsnx.helper.fromkeys(this.G.nodes(), {}));
    expect(G.edge).toEqual(jsnx.helper.fromkeys(this.G.nodes(), {}));
};

TestFunction.prototype.test_degree_histogram = function() {
    expect(jsnx.degree_histogram(this.G)).toEqual([1,1,1,1,1]);
};

TestFunction.prototype.test_density = function() {
    expect(jsnx.density(this.G)).toEqual(0.5);
    expect(jsnx.density(this.DG)).toEqual(0.3);
    var G = jsnx.Graph();
    G.add_node(1);
    expect(jsnx.density(G)).toEqual(0.0);
};

TestFunction.prototype.test_freeze = function() {
    var G = jsnx.freeze(this.G);
    expect(G.frozen).toBeTruthy();
    expect(function(){ G.add_node(1);}).toThrow('JSNetworkXError');
    expect(function(){ G.add_nodes_from([1]);}).toThrow('JSNetworkXError');
    expect(function(){ G.remove_node(1);}).toThrow('JSNetworkXError');
    expect(function(){ G.remove_nodes_from([1]);}).toThrow('JSNetworkXError');
    expect(function(){ G.add_edge([1,2]);}).toThrow('JSNetworkXError');
    expect(function(){ G.add_edges_from([[1,2]]);}).toThrow('JSNetworkXError');
    expect(function(){ G.remove_edge([1,2]);}).toThrow('JSNetworkXError');
    expect(function(){ G.remove_edges_from([[1,2]]);}).toThrow('JSNetworkXError');
    expect(function(){ G.clear();}).toThrow('JSNetworkXError');
};

TestFunction.prototype.test_is_frozen = function() {
    expect(jsnx.is_frozen(this.G)).toBeFalsy();
    var G = jsnx.freeze(this.G);
    expect(G.frozen).toEqual(jsnx.is_frozen(G));
    expect(jsnx.is_frozen(this.G)).toBeTruthy();
};

TestFunction.prototype.test_info = function() {
    var G = jsnx.path_graph(5);
    var info = jsnx.info(G);
    var expected_graph_info = [
        'Name: path_graph(5)',
        'Type: Graph',
        'Number of nodes: 5',
        'Number of edges: 4',
        'Average degree: 1.6000'
    ].join('\n');

    expect(info).toEqual(expected_graph_info);
};

TestFunction.prototype.test_info_digraph = function() {
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
    expect(info).toEqual(expected_graph_info);

    info = jsnx.info(G, 1);
    var expected_node_info = [
        'Node 1 has the following properties:',
        'Degree: 2',
        'Neighbors: 2'
    ].join('\n');
    expect(info).toEqual(expected_node_info);

    expect(function(){ jsnx.info(G, -1);}).toThrow('JSNetworkXError');
};

(new TestFunction()).run();
