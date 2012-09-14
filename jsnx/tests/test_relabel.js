/*jshint strict:false, sub:true*/

function TestRelabel() {
    goog.base(this, 'TestRelabel');
}

goog.inherits(TestRelabel, BaseTestClass);

TestRelabel.prototype.test_convert_node_labels_to_integers = function() {
    // test that empty gaph convertts fine for all options
    var G = jsnx.empty_graph();
    var H = jsnx.convert_node_labels_to_integers(G, 100);
    expect(H.name()).toEqual('(empty_graph(0))_with_int_labels');
    expect(H.nodes()).toEqual([]);
    expect(H.edges()).toEqual([]);

    ['default', 'sorted', 'increasing degree', 
     'decreasing degree'].forEach(function(opt) {
        var G = jsnx.empty_graph();
        var H = jsnx.convert_node_labels_to_integers(G, 100);
        expect(H.name()).toEqual('(empty_graph(0))_with_int_labels');
        expect(H.nodes()).toEqual([]);
        expect(H.edges()).toEqual([]);
    });

    G = jsnx.empty_graph();
    G.add_edges_from([['A','B'],['A','C'],['B','C'],['C','D']]);
    G.name('paw');
    H = jsnx.convert_node_labels_to_integers(G);
    var degH = goog.object.getValues(H.degree());
    var degG = goog.object.getValues(G.degree());
    expect(this.sorted(degH)).toEqual(this.sorted(degG));

    H = jsnx.convert_node_labels_to_integers(G, 1000);
    degH = goog.object.getValues(H.degree());
    degG = goog.object.getValues(G.degree());
    expect(this.sorted(degH)).toEqual(this.sorted(degG));
    expect(H.nodes()).toEqual(['1000', '1001', '1002', '1003']);

    H = jsnx.convert_node_labels_to_integers(G, 'increasing degree');
    degH = goog.object.getValues(H.degree());
    degG = goog.object.getValues(G.degree());
    expect(this.sorted(degH)).toEqual(this.sorted(degG));
    expect(jsnx.degree(H, 0)).toEqual(1);
    expect(jsnx.degree(H, 1)).toEqual(2);
    expect(jsnx.degree(H, 2)).toEqual(2);
    expect(jsnx.degree(H, 3)).toEqual(3);

    H = jsnx.convert_node_labels_to_integers(G, 'decreasing degree');
    degH = goog.object.getValues(H.degree());
    degG = goog.object.getValues(G.degree());
    expect(this.sorted(degH)).toEqual(this.sorted(degG));
    expect(jsnx.degree(H, 0)).toEqual(3);
    expect(jsnx.degree(H, 1)).toEqual(2);
    expect(jsnx.degree(H, 2)).toEqual(2);
    expect(jsnx.degree(H, 3)).toEqual(1);
};

TestRelabel.prototype.test_relabel_nodes_copy = function() {
    var G = jsnx.empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping);
    expect(this.sorted(H.nodes())).toEqual(['aardvark', 'bear', 'cat', 'dog']);
};

TestRelabel.prototype.test_relabel_nodes_function = function() {
    var G = jsnx.empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var H = jsnx.relabel_nodes(G, function(n) {
        return n.charCodeAt(0);                         
    });
    expect(this.sorted(H.nodes())).toEqual(['65', '66', '67', '68']);
};

TestRelabel.prototype.test_relabel_nodes_graph = function() {
    var G = jsnx.Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping);
    expect(this.sorted(H.nodes())).toEqual(['aardvark', 'bear', 'cat', 'dog']);
};

TestRelabel.prototype.test_relabel_nodes_digraph = function() {
    var G = jsnx.DiGraph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    expect(this.sorted(H.nodes())).toEqual(['aardvark', 'bear', 'cat', 'dog']);
};

TestRelabel.prototype.test_relabel_nodes_multigraph = function() {
    var G = jsnx.MultiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    expect(this.sorted(H.nodes())).toEqual(['aardvark', 'bear']);
    expect(this.sorted(H.edges())).toEqual([['aardvark', 'bear'], ['aardvark', 'bear']]);
};

TestRelabel.prototype.test_relabel_nodes_multidigraph = function() {
    var G = jsnx.MultiDiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    expect(this.sorted(H.nodes())).toEqual(['aardvark', 'bear']);
    expect(this.sorted(H.edges())).toEqual([['aardvark', 'bear'], ['aardvark', 'bear']]);
};

TestRelabel.prototype.test_relabel_nodes_missing = function() {
    var G = jsnx.Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'0': 'aardvark'};
    expect(function() { jsnx.relabel_nodes(G, mapping, false);}).toThrow('JSNetworkXError');
};

TestRelabel.prototype.test_relabel_nodes_topsort = function() {
    //TODO
};


(new TestRelabel()).run();
