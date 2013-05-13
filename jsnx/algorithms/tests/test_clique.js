/*jshint strict:false, node:true*/

var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');

var cnlti = jsnx.convert_node_labels_to_integers;

exports.TestCliques = {

  beforeEach: function() {
    var z = [3,4,3,4,2,4,2,1,1,1,1];
    this.G = cnlti(jsnx.havel_hakimi_graph(z), /*first_label=*/1);
    this.cl = jsnx.toArray(jsnx.find_cliques(this.G));
    var H = jsnx.complete_graph(6);
    H = jsnx.relabel_nodes(H, {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6});
    H.remove_edges_from([[2,6], [2,5], [2,4], [1,3], [5,3]]);
    this.H = H;
  },

  test_find_cliques1: function() {
    var cl = jsnx.toArray(jsnx.find_cliques(this.G));
    var rcl = jsnx.find_cliques_recursive(this.G);

    assert.deepEqual(
      cl.map(function(v) {
        v.sort();
        return v;
      }).sort(),
      rcl.map(function(v) {
        v.sort();
        return v;
      }).sort()
    );

    // Sort values because different browsers iterate over nodes in different
    // order
    assert.deepEqual(
      cl.map(function(v) {
        v.sort();
        return v;
      }),
      [
        [1, 2, 3, 6],
        [2, 4, 6],
        [4, 5, 7],
        [8, 9],
        [10, 11]
      ]
    );
  },

  test_selfloops: function() {
    this.G.add_edge(1,1);
    var cl = jsnx.toArray(jsnx.find_cliques(this.G));
    var rcl = jsnx.find_cliques_recursive(this.G);

    assert.deepEqual(
      cl.map(function(v) {
        v.sort();
        return v;
      }).sort(),
      rcl.map(function(v) {
        v.sort();
        return v;
      }).sort()
    );

    cl = jsnx.toArray(jsnx.find_cliques(this.G));
    assert.deepEqual(
      cl,
      [
        [2,6,1,3],
        [2,6,4],
        [5,4,7],
        [8,9],
        [10,11]
      ]
    );
  },

  test_find_cliques2: function() {
    var hcl = jsnx.toArray(jsnx.find_cliques(this.H));

    assert.deepEqual(
      hcl.map(function(v) {
        v.sort();
        return v;
      }).sort(),
      [[1,2], [1,4,5,6],[2,3],[3,4,6]]
    );
  },

  test_clique_number: function() {
    assert.equal(jsnx.graph_clique_number(this.G), 4);
    assert.equal(jsnx.graph_clique_number(this.G, this.cl), 4);
  },

  test_number_of_cliques: function() {
    var G = this.G;
    assert.equal(jsnx.graph_number_of_cliques(G), 5);
    assert.equal(jsnx.graph_number_of_cliques(G, this.cl), 5);
    assert.equal(jsnx.number_of_cliques(G, 1), 1);
    assert.deepEqual(jsnx.number_of_cliques(G,[1]).values(), [1]);
    assert.deepEqual(jsnx.number_of_cliques(G,[1,2]).values(), [1,2]);
    assert.deepEqual(jsnx.number_of_cliques(G,[1,2]), new jsnx.Map({1:1, 2:2}));
    assert.deepEqual(jsnx.number_of_cliques(G,2), 2);

    assert.deepEqual(
      jsnx.number_of_cliques(G),
      new jsnx.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
        6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      jsnx.number_of_cliques(G, G.nodes()),
      new jsnx.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                    6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      jsnx.number_of_cliques(G, [2,3,4]),
      new jsnx.Map({2: 2, 3: 1, 4: 2})
    );

    assert.deepEqual(
      jsnx.number_of_cliques(G, null, this.cl),
      new jsnx.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                    6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      jsnx.number_of_cliques(G, G.nodes(), this.cl),
      new jsnx.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                   6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );
  }

  //TODO: test_node_clique_number
  //TODO: test_cliques_containing_node
  //TODO: test_make_clique_bipartite
};
