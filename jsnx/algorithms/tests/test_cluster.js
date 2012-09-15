/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

function TestTriangles(name) {
    goog.base(this, name || "TestTriangles");
}

goog.inherits(TestTriangles, BaseTestClass);


TestTriangles.prototype.test_empty = function() {
    var G = jsnx.Graph();
    expect(goog.object.getValues(jsnx.triangles(G))).toEqual([]);
};


TestTriangles.prototype.test_path = function() {
    var G = jsnx.path_graph(10);
    expect(goog.object.getValues(jsnx.triangles(G))).toEqual(
        [0,0,0,0,0,0,0,0,0,0]
    );
    expect(jsnx.triangles(G)).toEqual(
        {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0}
    );
};

//TODO:
TestTriangles.prototype.xtest_cubical = function() {
    var G = jsnx.cubical_graph();
    expect(goog.object.getValues(jsnx.triangles(G))).toEqual(
        [0,0,0,0,0,0,0,0]
    );
    expect(jsnx.triangles(G, 1)).toEqual(0);
    expect(goog.object.getValues(jsnx.triangles(G, [1,2]))).toEqual([0,0]);
    expect(jsnx.triangles(G, 1)).toEqual(0);
    expect(jsnx.triangles(G, [1,2])).toEqual({1: 0, 2: 0});
};


TestTriangles.prototype.test_k5 = function() {
    var G = jsnx.complete_graph(5);
    expect(goog.object.getValues(jsnx.triangles(G))).toEqual(
        [6,6,6,6,6]
    );
    expect(goog.math.sum.apply(null, goog.object.getValues(jsnx.triangles(G)))/3)
          .toEqual(10);
    expect(jsnx.triangles(G, 1)).toEqual(6);
    G.remove_edge(1,2);
    expect(goog.object.getValues(jsnx.triangles(G))).toEqual(
        [5,3,3,5,5]
    );
    expect(jsnx.triangles(G, 1)).toEqual(3);
};


function TestWeightedClustering(name) {
    goog.base(this, name || "TestWeightedClustering");
}

goog.inherits(TestWeightedClustering, BaseTestClass);


TestWeightedClustering.prototype.test_clustering = function() {
    var G = jsnx.Graph();
    expect(goog.object.getValues(jsnx.clustering(G, null, 'weight'))).toEqual([]);
    expect(jsnx.clustering(G)).toEqual({});
};


TestWeightedClustering.prototype.test_path = function() {
    var G = jsnx.path_graph(10);
    expect(goog.object.getValues(jsnx.clustering(G, null, 'weight'))).toEqual(
        [0,0,0,0,0,0,0,0,0,0]
    );
    expect(jsnx.clustering(G, null, 'weight')).toEqual(
        {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0}
    );
};

//TODO:
TestWeightedClustering.prototype.xtest_cubical = function() {
    var G = jsnx.cubical_graph();
    expect(goog.object.getValues(jsnx.clustering(G, null, 'weight'))).toEqual(
        [0,0,0,0,0,0,0,0]
    );
    expect(jsnx.clustering(G, 1)).toBe(0);
    expect(goog.object.getValues(jsnx.clustering(G, [1,2], 'weight'))).toEqual([0,0]);
    expect(jsnx.clustering(G, 1, 'weight')).toBe(0);
    expect(jsnx.clustering(G, [1,2], 'weight')).toEqual({1: 0, 2: 0});
};


TestWeightedClustering.prototype.test_k5 = function() {
    var G = jsnx.complete_graph(5);
    expect(goog.object.getValues(jsnx.clustering(G, null, 'weight'))).toEqual(
        [1,1,1,1,1]
    );
    expect(jsnx.average_clustering(G, null, 'weight')).toBe(1);
    G.remove_edge(1,2);
    expect(goog.object.getValues(jsnx.clustering(G, null, 'weight')))
        .toEqual([5/6,1,1,5/6,5/6]);
    expect(jsnx.clustering(G, [1,4], 'weight')).toEqual({1: 1, 4: 0.8333333333333334});
};


function TestClustering(name) {
    goog.base(this, name || "TestClustering");
}

goog.inherits(TestClustering, BaseTestClass);


TestClustering.prototype.test_clustering = function() {
    var G = jsnx.Graph();
    expect(goog.object.getValues(jsnx.clustering(G))).toEqual([]);
    expect(jsnx.clustering(G)).toEqual({});
};


TestClustering.prototype.test_path = function() {
    var G = jsnx.path_graph(10);
    expect(goog.object.getValues(jsnx.clustering(G))).toEqual(
        [0,0,0,0,0,0,0,0,0,0]
    );
    expect(jsnx.clustering(G)).toEqual(
        {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0}
    );
};

//TODO:
TestClustering.prototype.xtest_cubical = function() {
    var G = jsnx.cubical_graph();
    expect(goog.object.getValues(jsnx.clustering(G))).toEqual(
        [0,0,0,0,0,0,0,0]
    );
    expect(jsnx.clustering(G, 1)).toBe(0);
    expect(goog.object.getValues(jsnx.clustering(G, [1,2]))).toEqual([0,0]);
    expect(jsnx.clustering(G, 1)).toBe(0);
    expect(jsnx.clustering(G, [1,2])).toEqual({1: 0, 2: 0});
};


TestClustering.prototype.test_k5 = function() {
    var G = jsnx.complete_graph(5);
    expect(goog.object.getValues(jsnx.clustering(G))).toEqual(
        [1,1,1,1,1]
    );
    expect(jsnx.average_clustering(G)).toBe(1);
    G.remove_edge(1,2);
    expect(goog.object.getValues(jsnx.clustering(G)))
        .toEqual([5/6,1,1,5/6,5/6]);
    expect(jsnx.clustering(G, [1,4])).toEqual({1: 1, 4: 0.8333333333333334});
};

TestClustering.prototype.test_average_clustering = function() {
    var G = jsnx.cycle_graph(3);
    G.add_edge(2,3);
    expect(jsnx.average_clustering(G)).toBe((1+1+1/3.0)/4.0);
    expect(jsnx.average_clustering(G, true)).toBe((1+1+1/3.0)/4.0);
    expect(jsnx.average_clustering(G, false)).toBe((1+1+1/3.0)/3.0);
};


function TestTransitivity(name) {
    goog.base(this, name || "TestTransitivity");
}

goog.inherits(TestTransitivity, BaseTestClass);


TestTransitivity.prototype.test_transitivity = function() {
    var G = jsnx.Graph();
    expect(jsnx.transitivity(G)).toBe(0);
};


TestTransitivity.prototype.test_path = function() {
    var G = jsnx.path_graph(10);
    expect(jsnx.transitivity(G)).toBe(0);
};

//TODO:
TestTransitivity.prototype.xtest_cubical = function() {
    var G = jsnx.cubical_graph();
    expect(jsnx.transitivity(G)).toBe(0);
};


TestTransitivity.prototype.test_k5 = function() {
    var G = jsnx.complete_graph(5);
    expect(jsnx.transitivity(G)).toBe(1);
    G.remove_edge(1,2);
    expect(jsnx.transitivity(G)).toBe(0.875);
};


function TestSquareClustering(name) {
    goog.base(this, name || "TestSquareClustering");
}

goog.inherits(TestSquareClustering, BaseTestClass);


TestSquareClustering.prototype.test_clustering = function() {
    var G = jsnx.Graph();
    expect(goog.object.getValues(jsnx.square_clustering(G))).toEqual([]);
    expect(jsnx.square_clustering(G)).toEqual({});
};


TestSquareClustering.prototype.test_path = function() {
    var G = jsnx.path_graph(10);
    expect(goog.object.getValues(jsnx.square_clustering(G))).toEqual(
        [0,0,0,0,0,0,0,0,0,0]
    );
    expect(jsnx.square_clustering(G)).toEqual(
        {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0}
    );
};

//TODO:
TestSquareClustering.prototype.xtest_cubical = function() {
    var G = jsnx.cubical_graph();
    expect(goog.object.getValues(jsnx.square_clustering(G))).toEqual(
        [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]
    );
    expect(goog.object.getValues(jsnx.square_clustering(G, [1,2]))).toEqual([0.5,0.5]);
    expect(jsnx.square_clustering(G, 1)).toBe(0.5);
    expect(jsnx.square_clustering(G, [1,2])).toEqual({1: 0.5, 2: 0.5});
};


TestSquareClustering.prototype.test_k5 = function() {
    var G = jsnx.complete_graph(5);
    expect(goog.object.getValues(jsnx.clustering(G))).toEqual(
        [1,1,1,1,1]
    );
};

//TODO: test_bipartite_k5

// Test C4 for figure 1 Lind et al (2005)
TestSquareClustering.prototype.test_lind_square_clustering = function() {
    var G = jsnx.Graph([[1,2],[1,3],[1,6],[1,7],[2,4],[2,5],
                      [3,4],[3,5],[6,7],[7,8],[6,8],[7,9],
                      [7,10],[6,11],[6,12],[2,13],[2,14],[3,15],[3,16]]);
    var G1 = G.subgraph([1,2,3,4,5,13,14,15,16]);
    var G2 = G.subgraph([1,6,7,8,9,10,11,12]);
    
    expect(jsnx.square_clustering(G, 1)).toBe(3/75);
    expect(jsnx.square_clustering(G1, 1)).toBe(2/6);
    expect(jsnx.square_clustering(G2, 1)).toBe(1/5);
};



(new TestTriangles()).run();
(new TestWeightedClustering()).run();
(new TestClustering()).run();
(new TestTransitivity()).run();
(new TestSquareClustering()).run();
