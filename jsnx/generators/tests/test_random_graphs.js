/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

var cnlti = jsnx.convert_node_labels_to_integers;

function TestGeneratorsRandom(name) {
    goog.base(this, name || "TestGeneratorsRandom");
}

goog.inherits(TestGeneratorsRandom, BaseTestClass);

//TODO: smoke_test_random_graph

TestGeneratorsRandom.prototype.test_gnp = function() {
    var G = jsnx.gnp_random_graph(10, 0.1);
    expect(G.number_of_nodes()).toEqual(10);

    G = jsnx.gnp_random_graph(10, 1.1);
    expect(G.number_of_nodes()).toEqual(10);
    expect(G.number_of_edges()).toEqual(45);

    G = jsnx.fast_gnp_random_graph(10, 0.1, true);
    expect(G.is_directed()).toEqual(true);
    expect(G.number_of_nodes()).toEqual(10);

    G = jsnx.fast_gnp_random_graph(10, -1.1);
    expect(G.number_of_nodes()).toEqual(10);
    expect(G.number_of_edges()).toEqual(0);

    G = jsnx.binomial_graph(10, 0.1);
    expect(G.number_of_nodes()).toEqual(10);

    G = jsnx.erdos_renyi_graph(10, 0.1);
    expect(G.number_of_nodes()).toEqual(10);
};


TestGeneratorsRandom.prototype.test_fast_gnp = function() {
    var G = jsnx.fast_gnp_random_graph(10, 0.1);
    expect(G.number_of_nodes()).toEqual(10);

    G = jsnx.fast_gnp_random_graph(10, 1.1);
    expect(G.number_of_nodes()).toEqual(10);
    expect(G.number_of_edges()).toEqual(45);

    G = jsnx.fast_gnp_random_graph(10, -1.1);
    expect(G.number_of_nodes()).toEqual(10);
    expect(G.number_of_edges()).toEqual(0);

    G = jsnx.fast_gnp_random_graph(10, 0.1, true);
    expect(G.is_directed()).toEqual(true);
    expect(G.number_of_nodes()).toEqual(10);
};

//TODO: test_gnm


(new TestGeneratorsRandom()).run();
