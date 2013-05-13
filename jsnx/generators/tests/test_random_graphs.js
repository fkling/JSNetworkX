/*jshint strict:false, node:true*/

var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');
var cnlti = jsnx.convert_node_labels_to_integers;


exports.TestGeneratorsRandom = {

  //TODO: smoke_test_random_graph

  test_gnp: function() {
    var G = jsnx.gnp_random_graph(10, 0.1);
    assert.equal(G.number_of_nodes(), 10);

    G = jsnx.gnp_random_graph(10, 1.1);
    assert.equal(G.number_of_nodes(), 10);
    assert.equal(G.number_of_edges(), 45);

    G = jsnx.fast_gnp_random_graph(10, 0.1, true);
    assert.equal(G.is_directed(), true);
    assert.equal(G.number_of_nodes(), 10);

    G = jsnx.fast_gnp_random_graph(10, -1.1);
    assert.equal(G.number_of_nodes(), 10);
    assert.equal(G.number_of_edges(), 0);

    G = jsnx.binomial_graph(10, 0.1);
    assert.equal(G.number_of_nodes(), 10);

    G = jsnx.erdos_renyi_graph(10, 0.1);
    assert.equal(G.number_of_nodes(), 10);
  },

  test_fast_gnp: function() {
    var G = jsnx.fast_gnp_random_graph(10, 0.1);
    assert.equal(G.number_of_nodes(), 10);

    G = jsnx.fast_gnp_random_graph(10, 1.1);
    assert.equal(G.number_of_nodes(), 10);
    assert.equal(G.number_of_edges(), 45);

    G = jsnx.fast_gnp_random_graph(10, -1.1);
    assert.equal(G.number_of_nodes(), 10);
    assert.equal(G.number_of_edges(), 0);

    G = jsnx.fast_gnp_random_graph(10, 0.1, true);
    assert.equal(G.is_directed(), true);
    assert.equal(G.number_of_nodes(), 10);
  }

  //TODO: test_gnm
};
