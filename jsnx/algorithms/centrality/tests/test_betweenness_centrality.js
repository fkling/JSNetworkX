/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

goog.require('jsnx.helper');


function TestBetweennessCentrality(name) {
    goog.base(this, name || "TestBetweennessCentrality");
}

goog.inherits(TestBetweennessCentrality, BaseTestClass);


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


TestBetweennessCentrality.prototype.test_K5 = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = {0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    expect(b).toEqual(b_answer);
};


TestBetweennessCentrality.prototype.test_K5_endpoints = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = {0: 4.0, 1: 4.0, 2: 4.0, 3: 4.0, 4: 4.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false, endpoints: true});
    expect(b).toEqual(b_answer);
};


TestBetweennessCentrality.prototype.test_P3_normalized = function() {
    var G = jsnx.path_graph(3);
    var b_answer = {0: 0.0, 1: 1.0, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    expect(b).toEqual(b_answer);
};


TestBetweennessCentrality.prototype.test_P3 = function() {
    var G = jsnx.path_graph(3);
    var b_answer = {0: 0.0, 1: 1.0, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    expect(b).toEqual(b_answer);
};


TestBetweennessCentrality.prototype.test_P3 = function() {
    var G = jsnx.path_graph(3);
    var b_answer = {0: 2.0, 1: 3.0, 2: 2.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false, endpoints: true});
    expect(b).toEqual(b_answer);
};


TestBetweennessCentrality.prototype.test_krackhardt_kite_graph = function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = {0: 1.667,1: 1.667,2: 0.000,3: 7.333,4: 0.000,
                    5: 16.667,6: 16.667,7: 28.000,8: 16.000,9: 0.000};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v] / 2);
    }
};


TestBetweennessCentrality.prototype.test_krackhardt_kite_graph_normalized = function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = {0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestBetweennessCentrality.prototype.test_florentine_families_graph = function() {
    var G = jsnx.florentine_families_graph();
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
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
    
    jsnx.forEach(G.nodes(), function(v) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    });
};


TestBetweennessCentrality.prototype.test_ladder_graph = function() {
    var G = jsnx.Graph();
    G.add_edges_from([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var b_answer = {0:1.667, 1: 1.667, 2: 6.667, 3: 6.667, 4: 1.667, 5: 1.667};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v] / 2);
    }
};


TestBetweennessCentrality.prototype.test_disconnected_path = function() {
    var G = jsnx.Graph();
    G.add_path([0, 1, 2]);
    G.add_path([3, 4, 5, 6]);
    var b_answer = {0: 0, 1: 1, 2: 0, 3: 0, 4: 2, 5: 2, 6: 0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestBetweennessCentrality.prototype.test_disconnected_path_endpoints = function() {
    var G = jsnx.Graph();
    G.add_path([0, 1, 2]);
    G.add_path([3, 4, 5, 6]);
    var b_answer = {0: 2, 1: 3, 2: 2, 3: 3, 4: 5, 5: 5, 6: 3};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false, endpoints: true});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestBetweennessCentrality.prototype.test_directed_path = function() {
    var G = jsnx.DiGraph();
    G.add_path([0, 1, 2]);
    var b_answer = {0: 0.0, 1: 1.0, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestBetweennessCentrality.prototype.test_directed_path_normalized = function() {
    var G = jsnx.DiGraph();
    G.add_path([0, 1, 2]);
    var b_answer = {0: 0.0, 1: 0.5, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: null, normalized: true});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


function TestWeightedBetweennessCentrality(name) {
    goog.base(this, name || "TestWeightedBetweennessCentrality");
}

goog.inherits(TestWeightedBetweennessCentrality, BaseTestClass);


TestWeightedBetweennessCentrality.prototype.test_K5 = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = {0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_P3_normalized = function() {
    var G = jsnx.path_graph(3);
    var b_answer = {0: 0.0, 1: 1.0, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: true});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_P3 = function() {
    var G = jsnx.path_graph(3);
    var b_answer = {0: 0.0, 1: 1.0, 2: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_krackhardt_kite_graph = function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = {0: 1.667,  1: 1.667,  2: 0.000,  3: 7.333,  4: 0.000,
                    5: 16.667, 6: 16.667, 7: 28.000, 8: 16.000, 9: 0.000};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v] / 2);
    }
};


TestWeightedBetweennessCentrality.prototype.test_krackhardt_kite_graph_normalized = function() {
    var G = jsnx.krackhardt_kite_graph();
    var b_answer = {0: 0.023, 1: 0.023, 2: 0.000, 3: 0.102, 4: 0.000,
                    5: 0.231, 6: 0.231, 7: 0.389, 8: 0.222, 9: 0.000};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: true});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_florentine_families_graph = function() {
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
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_ladder_graph = function() {
    var G = jsnx.Graph();
    G.add_edges_from([[0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [3,5]]);
    var b_answer = {0: 1.667, 1: 1.667, 2: 6.667, 3: 6.667, 4: 1.667, 5: 1.667};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v] / 2);
    }
};


TestWeightedBetweennessCentrality.prototype.test_G = function() {
    var G = weighted_G();
    var b_answer = {0: 2.0, 1: 0.0, 2: 4.0, 3: 3.0, 4: 4.0, 5: 0.0};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


TestWeightedBetweennessCentrality.prototype.test_G2 = function() {
    var G = jsnx.DiGraph();
    G.add_weighted_edges_from([['s', 'u', 10], ['s', 'x', 5],
                               ['u', 'v', 1],  ['u', 'x', 2],
                               ['v', 'y', 1],  ['x', 'u', 3],
                               ['x', 'v', 5],  ['x', 'y', 2],
                               ['y', 's', 7],  ['y', 'v', 6]]);
    var b_answer = {'y': 5.0, 'x': 5.0, 's': 4.0, 'u': 2.0, 'v': 2.0};
    var b = jsnx.betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var v in b_answer) {
        expect(b[v]).toBeCloseTo(b_answer[v]);
    }
};


function TestEdgeBetweennessCentrality(name) {
    goog.base(this, name || "TestEdgeBetweennessCentrality");
}

goog.inherits(TestEdgeBetweennessCentrality, BaseTestClass);


TestEdgeBetweennessCentrality.prototype.test_K5 = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.fromkeys(G.edges(), 1);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    expect(b).toEqual(b_answer);
};


TestEdgeBetweennessCentrality.prototype.test_normalized_K5 = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.fromkeys(G.edges(), 1 / 10.0);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    expect(b).toEqual(b_answer);
};


TestEdgeBetweennessCentrality.prototype.test_C4 = function() {
    var G = jsnx.cycle_graph(4);
    var b_answer = jsnx.helper.fromkeys(G.edges(), 2 / 6.0);
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    expect(b).toEqual(b_answer);
};


TestEdgeBetweennessCentrality.prototype.test_P4 = function() {
    var G = jsnx.path_graph(4);
    var b_answer = {};
    b_answer[[0, 1]] = 3; b_answer[[1, 2]] = 4; b_answer[[2, 3]] = 3;
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    expect(b).toEqual(b_answer);
};


TestEdgeBetweennessCentrality.prototype.test_normalized_P4 = function() {
    var G = jsnx.path_graph(4);
    var b_answer = {};
    b_answer[[0, 1]] = 3 / 6.0; b_answer[[1, 2]] = 4 / 6.0; b_answer[[2, 3]] = 3 / 6.0;
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: true});
    expect(b).toEqual(b_answer);
};


TestEdgeBetweennessCentrality.prototype.test_balanced_tree = function() {
    var G = jsnx.balanced_tree(2, 2);
    var b_answer = {};
    b_answer[[0, 1]] = 12; b_answer[[0, 2]] = 12; b_answer[[1, 3]] = 6;
    b_answer[[1, 4]] = 6; b_answer[[2, 5]] = 6; b_answer[[2, 6]] = 6;
    var b = jsnx.edge_betweenness_centrality(G, {weight: null, normalized: false});
    expect(b).toEqual(b_answer);
};


function TestWeightedEdgeBetweennessCentrality(name) {
    goog.base(this, name || "TestWeightedEdgeBetweennessCentrality");
}

goog.inherits(TestWeightedEdgeBetweennessCentrality, BaseTestClass);


TestWeightedEdgeBetweennessCentrality.prototype.test_K5 = function() {
    var G = jsnx.complete_graph(5);
    var b_answer = jsnx.helper.fromkeys(G.edges(), 1);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    expect(b).toEqual(b_answer);
};


TestWeightedEdgeBetweennessCentrality.prototype.test_C4 = function() {
    var G = jsnx.cycle_graph(4);
    var b_answer = jsnx.helper.fromkeys(G.edges(), 2);
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    expect(b).toEqual(b_answer);
};


TestWeightedEdgeBetweennessCentrality.prototype.test_P4 = function() {
    var G = jsnx.path_graph(4);
    var b_answer = {};
    b_answer[[0, 1]] = 3; b_answer[[1, 2]] = 4; b_answer[[2, 3]] = 3;
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    expect(b).toEqual(b_answer);
};


TestWeightedEdgeBetweennessCentrality.prototype.test_balanced_tree = function() {
    var G = jsnx.balanced_tree(2, 2);
    var b_answer = {};
    b_answer[[0, 1]] = 12; b_answer[[0, 2]] = 12; b_answer[[1, 3]] = 6;
    b_answer[[1, 4]] = 6; b_answer[[2, 5]] = 6; b_answer[[2, 6]] = 6;
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    expect(b).toEqual(b_answer);
};


TestWeightedEdgeBetweennessCentrality.prototype.test_weighted_graph = function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3], 
                 [0, 4, 2], [1, 2, 4], [1, 3, 1], 
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = jsnx.Graph();
    G.add_weighted_edges_from(eList);
    var b_answer = {};
    b_answer[[0, 1]] = 0.0; b_answer[[0, 2]] = 1.0; b_answer[[0, 3]] = 2.0; b_answer[[0, 4]] = 1.0;
    b_answer[[1, 2]] = 2.0; b_answer[[1, 3]] = 3.5; b_answer[[1, 4]] = 1.5; b_answer[[2, 4]] = 1.0;
    b_answer[[3, 4]] = 0.5;
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: false});
    for (var e in b_answer) {
        expect(b[e]).toBeCloseTo(b_answer[e]);
    }
};


TestWeightedEdgeBetweennessCentrality.prototype.test_normalized_weighted_graph = function() {
    var eList = [[0, 1, 5], [0, 2, 4], [0, 3, 3], 
                 [0, 4, 2], [1, 2, 4], [1, 3, 1], 
                 [1, 4, 3], [2, 4, 5], [3, 4, 4]];
    var G = jsnx.Graph();
    G.add_weighted_edges_from(eList);
    var b_answer = {};
    b_answer[[0, 1]] = 0.0; b_answer[[0, 2]] = 1.0; b_answer[[0, 3]] = 2.0; b_answer[[0, 4]] = 1.0;
    b_answer[[1, 2]] = 2.0; b_answer[[1, 3]] = 3.5; b_answer[[1, 4]] = 1.5; b_answer[[2, 4]] = 1.0;
    b_answer[[3, 4]] = 0.5;
    var b = jsnx.edge_betweenness_centrality(G, {weight: 'weight', normalized: true});
    var norm = jsnx.helper.len(G) * (jsnx.helper.len(G) - 1) / 2.0;
    for (var e in b_answer) {
        expect(b[e]).toBeCloseTo(b_answer[e] / norm);
    }
};


(new TestBetweennessCentrality()).run();
(new TestWeightedBetweennessCentrality()).run();
(new TestEdgeBetweennessCentrality()).run();
(new TestWeightedEdgeBetweennessCentrality()).run();
