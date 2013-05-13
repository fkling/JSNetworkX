/*jshint strict:false, node:true*/

var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');

exports.TestTriangles = {

  test_empty: function() {
    var G = jsnx.Graph();
    assert.deepEqual(jsnx.triangles(G).values(), []);
  },

  test_path: function() {
    var G = jsnx.path_graph(10);
    assert.deepEqual(jsnx.triangles(G).values(), [0,0,0,0,0,0,0,0,0,0]);
    assert.deepEqual(
      jsnx.triangles(G),
      new jsnx.Map({0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = jsnx.cubical_graph();
    assert.deepEqual(jsnx.triangles(G).values(), [0,0,0,0,0,0,0,0]);
    assert.equal(jsnx.triangles(G, 1), 0);
    assert.deepEqual(jsnx.triangles(G, [1,2]).values(), [0,0]);
    assert.equal(jsnx.triangles(G, 1), 0);
    assert.deepEqual(jsnx.triangles(G, [1,2]), new jsnx.Map({1: 0, 2: 0}));
  },
*/

  test_k5: function() {
    var G = jsnx.complete_graph(5);
    assert.deepEqual(jsnx.triangles(G).values(), [6,6,6,6,6]);
    assert.equal(
      jsnx.triangles(G).values().reduce(function(v, p) {
        return p + v;
      }, 0) / 3,
      10
    );
    assert.equal(jsnx.triangles(G, 1), 6);
    G.remove_edge(1,2);
    assert.deepEqual(jsnx.triangles(G).values(), [5,3,3,5,5]);
    assert.deepEqual(jsnx.triangles(G, 1), 3);
  }
};


exports.TestWeightedClustering = {

  test_clustering: function() {
    var G = jsnx.Graph();
    assert.deepEqual(jsnx.clustering(G, null, 'weight').values(), []);
    assert.deepEqual(jsnx.clustering(G), new jsnx.Map());
  },

  test_path: function() {
    var G = jsnx.path_graph(10);
    assert.deepEqual(
      jsnx.clustering(G, null, 'weight').values(),
      [0,0,0,0,0,0,0,0,0,0]
    );
    assert.deepEqual(
      jsnx.clustering(G, null, 'weight'),
      new jsnx.Map({0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = jsnx.cubical_graph();
    assert.deepEqual(
      jsnx.clustering(G, null, 'weight').values(),
      [0,0,0,0,0,0,0,0]
    );
    assert.Equal(jsnx.clustering(G, 1), 0);
    assert.deepEqual(jsnx.clustering(G, [1,2], 'weight').values(), [0,0]);
    assert.equal(jsnx.clustering(G, 1, 'weight'), 0);
    assert.deepEqual(jsnx.clustering(G, [1,2], 'weight')).toEqual({1: 0, 2: 0});
  },
  */

  test_k5: function() {
    var G = jsnx.complete_graph(5);
    assert.deepEqual(
      jsnx.clustering(G, null, 'weight').values(),
      [1,1,1,1,1]
    );
    assert.equal(jsnx.average_clustering(G, null, 'weight'), 1);
    G.remove_edge(1,2);
    assert.deepEqual(
      jsnx.clustering(G, null, 'weight').values(),
      [5/6,1,1,5/6,5/6]
    );
    assert.deepEqual(
      jsnx.clustering(G, [1,4], 'weight'),
      new jsnx.Map({1: 1, 4: 0.8333333333333334})
    );
  }
};


exports.TestClustering = {

  test_clustering: function() {
    var G = jsnx.Graph();
    assert.deepEqual(jsnx.clustering(G).values(), []);
    assert.deepEqual(jsnx.clustering(G), new jsnx.Map());
  },

  test_path: function() {
    var G = jsnx.path_graph(10);
    assert.deepEqual(jsnx.clustering(G).values(), [0,0,0,0,0,0,0,0,0,0]);
    assert.deepEqual(
      jsnx.clustering(G),
      new jsnx.Map({0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0})
    );
  },

//TODO:
/*
  test_cubical: function() {
    var G = jsnx.cubical_graph();
    assert.ddepEqual(jsnx.clustering(G), [0,0,0,0,0,0,0,0]);
    assert.equal(jsnx.clustering(G, 1)).toBe(0);
    assert.deepEqual(jsnx.clustering(G, [1,2]).values(), [0,0]);
    assert.equal(jsnx.clustering(G, 1), 0);
    assert.deepEqual(jsnx.clustering(G, [1,2]), new jsnx.Map({1: 0, 2: 0}));
  },
*/

  test_k5: function() {
    var G = jsnx.complete_graph(5);
    assert.deepEqual(jsnx.clustering(G).values(), [1,1,1,1,1]);
    assert.equal(jsnx.average_clustering(G), 1);
    G.remove_edge(1,2);
    assert.deepEqual(jsnx.clustering(G).values(), [5/6,1,1,5/6,5/6]);
    assert.deepEqual(
      jsnx.clustering(G, [1,4]),
      new jsnx.Map({1: 1, 4: 0.8333333333333334})
    );
  },

  test_average_clustering: function() {
    var G = jsnx.cycle_graph(3);
    G.add_edge(2,3);
    assert.equal(jsnx.average_clustering(G),(1+1+1/3.0)/4.0);
    assert.equal(jsnx.average_clustering(G, true), (1+1+1/3.0)/4.0);
    assert.equal(jsnx.average_clustering(G, false), (1+1+1/3.0)/3.0);
  }
};


exports.TestTransitivity = {

  test_transitivity: function() {
    var G = jsnx.Graph();
    assert.equal(jsnx.transitivity(G), 0);
  },

  test_path: function() {
    var G = jsnx.path_graph(10);
    assert.equal(jsnx.transitivity(G), 0);
  },

  // TODO:
  /*
  test_cubical: function() {
    var G = jsnx.cubical_graph();
    assert.equal(jsnx.transitivity(G), 0);
  },
  */

  test_k5: function() {
    var G = jsnx.complete_graph(5);
    assert.equal(jsnx.transitivity(G), 1);
    G.remove_edge(1,2);
    assert.equal(jsnx.transitivity(G), 0.875);
  }
};


exports.TestSquareClustering = {

  test_clustering: function() {
    var G = jsnx.Graph();
    assert.deepEqual(jsnx.square_clustering(G).values(), []);
    assert.deepEqual(jsnx.square_clustering(G), new jsnx.Map());
  },

  test_path: function() {
    var G = jsnx.path_graph(10);
    assert.deepEqual(jsnx.square_clustering(G).values(), [0,0,0,0,0,0,0,0,0,0]);
    assert.deepEqual(
      jsnx.square_clustering(G), 
      new jsnx.Map({0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0})
    );
  },

  // TODO
  /*
  test_cubical: function() {
    var G = jsnx.cubical_graph();
    assert.deepEqual(
      jsnx.square_clustering(G).values(),
      [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]
    );
    assert.deepEqual(jsnx.square_clustering(G, [1,2]).values(), [0.5,0.5]);
    assert.equal(jsnx.square_clustering(G, 1), 0.5);
    assert.deepEqual(
      jsnx.square_clustering(G, [1,2]),
      new jsnx.Map({1: 0.5, 2: 0.5})
    );
  },
  */

  test_k5: function() {
    var G = jsnx.complete_graph(5);
    assert.deepEqual(jsnx.clustering(G).values(), [1,1,1,1,1]);
  },

  //TODO: test_bipartite_k5

  // Test C4 for figure 1 Lind et al (2005)
  test_lind_square_clustering: function() {
    var G = jsnx.Graph([[1,2],[1,3],[1,6],[1,7],[2,4],[2,5],
                      [3,4],[3,5],[6,7],[7,8],[6,8],[7,9],
                      [7,10],[6,11],[6,12],[2,13],[2,14],[3,15],[3,16]]);
    var G1 = G.subgraph([1,2,3,4,5,13,14,15,16]);
    var G2 = G.subgraph([1,6,7,8,9,10,11,12]);
    
    assert.equal(jsnx.square_clustering(G, 1), 3/75);
    assert.equal(jsnx.square_clustering(G1, 1), 2/6);
    assert.equal(jsnx.square_clustering(G2, 1), 1/5);
  }
};
