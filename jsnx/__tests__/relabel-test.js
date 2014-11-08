/*globals assert, utils*/
"use strict";

var {Graph, DiGraph} = require('../classes/');

var relabel = require('../relabel');
var empty_graph = require('../generators').empty_graph;
var toArray = utils.toArray;

var {JSNetworkXError} = require('../exceptions');

exports.relabel = {

  test_convert_node_labels_to_integers: function() {
    // test that empty graph converts fine for all options
    var G = empty_graph();
    var H = relabel.convert_node_labels_to_integers(G, 100);
    assert.equal(H.name, '(empty_graph(0))_with_int_labels');
    assert.deepEqual(H.nodes(), []);
    assert.deepEqual(H.edges(), []);

    ['default', 'sorted', 'increasing degree',
     'decreasing degree'].forEach(function(opt) {
        var G = empty_graph();
        var H = relabel.convert_node_labels_to_integers(G, 100, opt);
        assert.equal(H.name, '(empty_graph(0))_with_int_labels');
        assert.deepEqual(H.nodes(), []);
        assert.deepEqual(H.edges(), []);
    });

    G = empty_graph();
    G.add_edges_from([['A','B'],['A','C'],['B','C'],['C','D']]);
    G.name = 'paw';
    H = relabel.convert_node_labels_to_integers(G);
    var degH = toArray(H.degree().values());
    var degG = toArray(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());

    H = relabel.convert_node_labels_to_integers(G, 1000);
    degH = toArray(H.degree().values());
    degG = toArray(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(H.nodes(), [1000, 1001, 1002, 1003]);

    H = relabel.convert_node_labels_to_integers(G, 'increasing degree');
    degH = toArray(H.degree().values());
    degG = toArray(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.equal(H.degree(0), 1);
    assert.equal(H.degree(1), 2);
    assert.equal(H.degree(2), 2);
    assert.equal(H.degree(3), 3);

    H = relabel.convert_node_labels_to_integers(G, 'decreasing degree');
    degH = toArray(H.degree().values());
    degG = toArray(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(H.degree(0), 3);
    assert.deepEqual(H.degree(1), 2);
    assert.deepEqual(H.degree(2), 2);
    assert.deepEqual(H.degree(3), 1);
  },

  test_relabel_nodes_copy: function() {
    var G = empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabel_nodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  test_relabel_nodes_function: function() {
    var G = empty_graph();
    G.add_edges_from([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var H = relabel.relabel_nodes(G, function(n) {
        return n.charCodeAt(0);
    });
    assert.deepEqual(H.nodes().sort(), [65, 66, 67, 68]);
  },

  test_relabel_nodes_graph:  function() {
    var G = new Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabel_nodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  test_relabel_nodes_digraph: function() {
    var G = new DiGraph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  /* TODO MultiGraph
  test_relabel_nodes_multigraph: function() {
    var G = MultiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(
      H.edges().sort(),
      [['aardvark', 'bear'], ['aardvark', 'bear']]
    );
  },
  */

  /* TODO MultiDiGraph
  test_relabel_nodes_multidigraph: function() {
    var G = MultiDiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = relabel_nodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(
      H.edges().sort(),
      [['aardvark', 'bear'], ['aardvark', 'bear']]
    );
  },
  */

  test_relabel_nodes_missing: function() {
    var G = new Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'0': 'aardvark'};
    assert.throws(
      () => relabel.relabel_nodes(G, mapping, false),
      JSNetworkXError
    );
  }

  //TODO: test_relabel_nodes_topsort
};
