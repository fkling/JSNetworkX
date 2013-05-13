/*jshint strict:false, node:true*/

var assert = require('../../../../mocha/assert');
var jsnx = require('../../../../jsnetworkx-test');

function weighted_G() {
    var G = jsnx.Graph();
    G.add_edge(0, 1, {weight: 3});
    G.add_edge(0, 2, {weight: 2});
    G.add_edge(0, 3, {weight: 6});
    G.add_edge(0, 4, {weight: 4});
    G.add_edge(1, 3, {weight: 5});
    G.add_edge(1, 5, {weight: 5});
    G.add_edge(2, 4, {weight: 1});
    G.add_edge(3, 4, {weight: 2});
    G.add_edge(3, 5, {weight: 1});
    G.add_edge(4, 5, {weight: 4});
    return G;
}


exports.TestBetweennessCentrality = {
  test_K5: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = new jsnx.Map({0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_K5_endpoints: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = new jsnx.Map({0: 4.0, 1: 4.0, 2: 4.0, 3: 4.0, 4: 4.0});
    var b = jsnx.betweenness_centrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    assert.deepEqual(b, b_answer);
  },

  test_P3_normalized: function() {
    var G = jsnx.path_graph(3);
    var b_answer = new jsnx.Map({0: 0.0, 1: 1.0, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, b_answer);
  },

  test_P3: function() {
    var G = jsnx.path_graph(3);
    var b_answer = new jsnx.Map({0: 0.0, 1: 1.0, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_P3_endpoints: function() {
    var G = jsnx.path_graph(3);
    var b_answer = new jsnx.Map({0: 2.0, 1: 3.0, 2: 2.0});
    var b = jsnx.betweenness_centrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    assert.deepEqual(b, b_answer);
  },

  test_krackhardt_kite_graph: function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = new jsnx.Map({0: 1.667,1: 1.667,2: 0.000,3: 7.333,4: 0.000,
                    5: 16.667,6: 16.667,7: 28.000,8: 16.000,9: 0.000});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k) / 2);
    });
  },

  test_krackhardt_kite_graph_normalized: function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = new jsnx.Map({0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_florentine_families_graph: function() {
    var G = jsnx.florentine_families_graph();
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    var b_answer = new jsnx.Map({'Acciaiuoli':    0.000,
                    'Albizzi':       0.212,
                    'Barbadori':     0.093,
                    'Bischeri':      0.104,
                    'Castellani':    0.055,
                    'Ginori':        0.000,
                    'Guadagni':      0.255,
                    'Lamberteschi':  0.000,
                    'Medici':        0.522,
                    'Pazzi':         0.000,
                    'Peruzzi':       0.022,
                    'Ridolfi':       0.114,
                    'Salviati':      0.143,
                    'Strozzi':       0.103,
                    'Tornabuoni':    0.092});
    jsnx.forEach(G.nodes(), function(v) {
        assert.almostEqual(b.get(v), b_answer.get(v));
    });
  },

  test_ladder_graph: function() {
    var G = jsnx.Graph();
    G.add_edges_from([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var b_answer = new jsnx.Map({0:1.667, 1: 1.667, 2: 6.667, 3: 6.667, 4: 1.667, 5: 1.667});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k) / 2);
    });
  },

  test_disconnected_path: function() {
    var G = jsnx.Graph();
    G.add_path([0, 1, 2]);
    G.add_path([3, 4, 5, 6]);
    var b_answer = new jsnx.Map({0: 0, 1: 1, 2: 0, 3: 0, 4: 2, 5: 2, 6: 0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },


  test_disconnected_path_endpoints: function() {
    var G = jsnx.Graph();
    G.add_path([0, 1, 2]);
    G.add_path([3, 4, 5, 6]);
    var b_answer = new jsnx.Map({0: 2, 1: 3, 2: 2, 3: 3, 4: 5, 5: 5, 6: 3});
    var b = jsnx.betweenness_centrality(
      G,
      {weight: null, normalized: false, endpoints: true}
    );
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_directed_path: function() {
    var G = jsnx.DiGraph();
    G.add_path([0, 1, 2]);
    var b_answer = new jsnx.Map({0: 0.0, 1: 1.0, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_directed_path_normalized: function() {
    var G = jsnx.DiGraph();
    G.add_path([0, 1, 2]);
    var b_answer = new jsnx.Map({0: 0.0, 1: 0.5, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    b.forEach(function(k, v) {
      assert.almostEqual(v, b_answer.get(k));
    });
  }
};

exports.TestWeightedBetweennessCentrality = {

  test_K5: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = new jsnx.Map({0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_P3_normalized: function() {
    var G = jsnx.path_graph(3);
    var b_answer = new jsnx.Map({0: 0.0, 1: 1.0, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: true});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_P3: function() {
    var G = jsnx.path_graph(3);
    var b_answer = new jsnx.Map({0: 0.0, 1: 1.0, 2: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_krackhardt_kite_graph: function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = new jsnx.Map({0: 1.667,  1: 1.667,  2: 0.000,  3: 7.333,  4: 0.000,
                    5: 16.667, 6: 16.667, 7: 28.000, 8: 16.000, 9: 0.000});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k) / 2);
    });
  },

  test_krackhardt_kite_graph_normalized: function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = new jsnx.Map({0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: true});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_florentine_families_graph: function() {
    var G = jsnx.florentine_families_graph();
    var b_answer = {'Acciaiuoli':    0.000,
                    'Albizzi':       0.212,
                    'Barbadori':     0.093,
                    'Bischeri':      0.104,
                    'Castellani':    0.055,
                    'Ginori':        0.000,
                    'Guadagni':      0.255,
                    'Lamberteschi':  0.000,
                    'Medici':        0.522,
                    'Pazzi':         0.000,
                    'Peruzzi':       0.022,
                    'Ridolfi':       0.114,
                    'Salviati':      0.143,
                    'Strozzi':       0.103,
                    'Tornabuoni':    0.092};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: true});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer[k]);
    });
  },

  test_ladder_graph: function() {
    var G = jsnx.Graph();
    G.add_edges_from([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var b_answer = new jsnx.Map({0: 1.667, 1: 1.667, 2: 6.667, 3: 6.667, 4: 1.667, 5: 1.667});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k) / 2);
    });
  },

  test_G: function() {
    var G = weighted_G();
    var b_answer = new jsnx.Map({0: 2.0, 1: 0.0, 2: 4.0, 3: 3.0, 4: 4.0, 5: 0.0});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_G2: function() {
    var G = jsnx.DiGraph();
    G.add_weighted_edges_from([['s', 'u', 10], ['s', 'x', 5],
                               ['u', 'v', 1],  ['u', 'x', 2],
                               ['v', 'y', 1],  ['x', 'u', 3],
                               ['x', 'v', 5],  ['x', 'y', 2],
                               ['y', 's', 7],  ['y', 'v', 6]]);
    var b_answer = new jsnx.Map({'y': 5.0, 'x': 5.0, 's': 4.0, 'u': 2.0, 'v': 2.0});
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  }
};


exports.TestEdgeBetweennessCentrality = {

  test_K5: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.mapfromkeys(G.edges(), 1);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_normalized_K5: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.mapfromkeys(G.edges(), 1 / 10.0);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, b_answer);
  },

  test_C4: function() {
    var G = jsnx.cycle_graph(4);
    var b_answer = jsnx.helper.mapfromkeys(G.edges(), 2 / 6.0);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, b_answer);
  },

  test_P4: function() {
    var G = jsnx.path_graph(4);
    var b_answer = new jsnx.Map([
      [[0,1], 3],
      [[1,2], 4],
      [[2,3], 3]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_normalized_P4: function() {
    var G = jsnx.path_graph(4);
    var b_answer = new jsnx.Map([
      [[0,1], 3/6],
      [[1,2], 4/6],
      [[2,3], 3/6]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    assert.deepEqual(b, b_answer);
  },

  test_balanced_tree: function() {
    var G = jsnx.balanced_tree(2, 2);
    var b_answer = new jsnx.Map([
      [[0,1], 12],
      [[0,2], 12],
      [[1,3], 6],
      [[1,4], 6],
      [[2,5], 6],
      [[2,6], 6]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    assert.deepEqual(b, b_answer);
  }
};


exports.TestWeightedEdgeBetweennessCentrality = {

  test_K5: function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.mapfromkeys(G.edges(), 1);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_C4: function() {
    var G = jsnx.cycle_graph(4);
    var b_answer = jsnx.helper.mapfromkeys(G.edges(), 2);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_P4: function() {
    var G = jsnx.path_graph(4);
    var b_answer = new jsnx.Map([
      [[0,1], 3],
      [[1,2], 4],
      [[2,3], 3]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_balanced_tree: function() {
    var G = jsnx.balanced_tree(2, 2);
    var b_answer = new jsnx.Map([
      [[0,1], 12],
      [[0,2], 12],
      [[1,3], 6],
      [[1,4], 6],
      [[2,5], 6],
      [[2,6], 6]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    assert.deepEqual(b, b_answer);
  },

  test_weighted_graph: function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3], 
                 [0, 4, 2], [1, 2, 4], [1, 3, 1], 
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = jsnx.Graph();
    G.add_weighted_edges_from(eList);
    var b_answer = new jsnx.Map([
      [[0,1], 0],
      [[0,2], 1],
      [[0,3], 2],
      [[0,4], 1],
      [[1,2], 2],
      [[1,3], 3.5],
      [[1,4], 1.5],
      [[2,4], 1],
      [[3,4], 0.5]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k));
    });
  },

  test_normalized_weighted_graph: function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3], 
                 [0, 4, 2], [1, 2, 4], [1, 3, 1], 
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = jsnx.Graph();
    G.add_weighted_edges_from(eList);
    var b_answer = new jsnx.Map([
      [[0,1], 0],
      [[0,2], 1],
      [[0,3], 2],
      [[0,4], 1],
      [[1,2], 2],
      [[1,3], 3.5],
      [[1,4], 1.5],
      [[2,4], 1],
      [[3,4], 0.5]
    ]);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: true});
    var norm = jsnx.helper.len(G) * (jsnx.helper.len(G) - 1) / 2.0;
    b.forEach(function(k, v) {
        assert.almostEqual(v, b_answer.get(k)/norm);
    });
  }
};
