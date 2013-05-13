/*jshint strict:false, node:true*/

var assert = require('../../mocha/assert');
var jsnx = require('../../jsnetworkx-test');

exports.TestRelabel = {

  test_convert_node_labels_to_integers: function() {
    // test that empty gaph convertts fine for all options
    var G = jsnx.empty_graph();
    var H = jsnx.convert_node_labels_to_integers(G, 100);
    assert.equal(H.name(), '(empty_graph(0))_with_int_labels');
    assert.deepEqual(H.nodes(), []);
    assert.deepEqual(H.edges(), []);

    ['default', 'sorted', 'increasing degree', 
     'decreasing degree'].forEach(function(opt) {
        var G = jsnx.empty_graph();
        var H = jsnx.convert_node_labels_to_integers(G, 100);
        assert.equal(H.name(), '(empty_graph(0))_with_int_labels');
        assert.deepEqual(H.nodes(), []);
        assert.deepEqual(H.edges(), []);
    });

    G = jsnx.empty_graph();
    G.add_edges_from([['A','B'],['A','C'],['B','C'],['C','D']]);
    G.name('paw');
    H = jsnx.convert_node_labels_to_integers(G);
    var degH = H.degree().values();
    var degG = G.degree().values();
    assert.deepEqual(degH.sort(), degG.sort());

    H = jsnx.convert_node_labels_to_integers(G, 1000);
    degH = H.degree().values();
    degG = G.degree().values();
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(H.nodes(), [1000, 1001, 1002, 1003]);

    H = jsnx.convert_node_labels_to_integers(G, 'increasing degree');
    degH = H.degree().values();
    degG = G.degree().values();
    assert.deepEqual(degH.sort(), degG.sort());
    assert.equal(jsnx.degree(H, 0), 1);
    assert.equal(jsnx.degree(H, 1), 2);
    assert.equal(jsnx.degree(H, 2), 2);
    assert.equal(jsnx.degree(H, 3), 3);

    H = jsnx.convert_node_labels_to_integers(G, 'decreasing degree');
    degH = H.degree().values();
    degG = G.degree().values();
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(jsnx.degree(H, 0), 3);
    assert.deepEqual(jsnx.degree(H, 1), 2);
    assert.deepEqual(jsnx.degree(H, 2), 2);
    assert.deepEqual(jsnx.degree(H, 3), 1);
  },

  test_relabel_nodes_copy: function() {
    var G = jsnx.empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  test_relabel_nodes_function: function() {
    var G = jsnx.empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var H = jsnx.relabel_nodes(G, function(n) {
        return n.charCodeAt(0);
    });
    assert.deepEqual(H.nodes().sort(), [65, 66, 67, 68]);
  },

  test_relabel_nodes_graph:  function() {
    var G = jsnx.Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  test_relabel_nodes_digraph: function() {
    var G = jsnx.DiGraph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  test_relabel_nodes_multigraph: function() {
    var G = jsnx.MultiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(H.edges().sort(), [['aardvark', 'bear'], ['aardvark', 'bear']]);
  },

  test_relabel_nodes_multidigraph: function() {
    var G = jsnx.MultiDiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = jsnx.relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(H.edges().sort(), [['aardvark', 'bear'], ['aardvark', 'bear']]);
  },

  test_relabel_nodes_missing: function() {
    var G = jsnx.Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'0': 'aardvark'};
    assert.throws(
      function() { jsnx.relabel_nodes(G, mapping, false);},
      jsnx.JSNetworkX
    );
  }

  //TODO: test_relabel_nodes_topsort
};
