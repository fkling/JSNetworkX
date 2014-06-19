/*jshint strict:false, node:true*/

var assert = require('../../../../mocha/assert');
var jsnx = require('../../../../jsnetworkx-test');

exports.TestEigenvectorCentrality = {
  test_K5: function() {
    var G = jsnx.complete_graph(5);

    var b_answer = new jsnx.Map({0: 0.4472135955, 1: 0.4472135955, 2: 0.4472135955, 3: 0.4472135955, 4: 0.4472135955});
    var b = jsnx.eigenvector_centrality(G);
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_eigenvector_centrality_weighted: function() {
    var G = new jsnx.DiGraph();
    var edges=[[1,2, {weight: 2.0}],[1,3, {weight: 2.0}],[2,4, {weight: 2.0}],[3,2, {weight: 2.0}],[3,5, {weight: 2.0}],[4,2, {weight: 2.0}],[4,5, {weight: 2.0}],[4,6, {weight: 2.0}],[5,6, {weight: 2.0}],[5,7, {weight: 2.0}],[5,8, {weight: 2.0}],[6,8, {weight: 2.0}],[7,1, {weight: 2.0}],[7,5, {weight: 2.0}],[7,8, {weight: 2.0}],[8,6, {weight: 2.0}],[8,7, {weight: 2.0}]];
    G.add_edges_from(edges);
    var b_answer = new jsnx.Map({1: 0.25368793, 2: 0.19576478, 3: 0.32817092, 4: 0.40430835, 5: 0.48199885, 6: 0.15724483, 7: 0.51346196, 8: 0.32475403});
    var b = jsnx.eigenvector_centrality(G);
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_eigenvector_centrality_unweighted: function() {
    var G = new jsnx.DiGraph();
    var edges=[[1,2],[1,3],[2,4],[3,2],[3,5],[4,2],[4,5],[4,6],[5,6],[5,7],[5,8],[6,8],[7,1],[7,5],[7,8],[8,6],[8,7]];
    G.add_edges_from(edges);
    var b_answer = new jsnx.Map({1: 0.25368793, 2: 0.19576478, 3: 0.32817092, 4: 0.40430835, 5: 0.48199885, 6: 0.15724483, 7: 0.51346196, 8: 0.32475403});
    var b = jsnx.eigenvector_centrality(G);
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  }


}