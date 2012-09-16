/*jshint strict:false*/

function TestDegreeSeq() {
    goog.base(this, 'TestDegreeSeq');
}
goog.inherits(TestDegreeSeq, BaseTestClass);

//TODO: test_configuration_model
//TODO: test_expected_degree_graph

TestDegreeSeq.prototype.test_havel_hakimi_construction = function() {
    var z = [1000,3,3,3,3,2,2,2,1,1,1];
    expect(function() { jsnx.havel_hakimi_graph(z); })
        .toThrow('JSNetworkXError');
    z = ["A",3,3,3,3,2,2,2,1,1,1];
    expect(function() { jsnx.havel_hakimi_graph(z); })
        .toThrow('JSNetworkXError');
    z = [5,4,3,3,3,2,2,2];
    var G = jsnx.havel_hakimi_graph(z);
    //TODO: G = jsnx.configuration_model(z);
    z = [6,5,4,4,2,1,1,1];
    expect(function() { jsnx.havel_hakimi_graph(z); })
        .toThrow('JSNetworkXError');

    z = [10,3,3,3,3,2,2,2,2,2,2];
    G = jsnx.havel_hakimi_graph(z);

    expect(function() { jsnx.havel_hakimi_graph(z, jsnx.DiGraph()); })
        .toThrow('JSNetworkXError');
    expect(function() { jsnx.havel_hakimi_graph(z, jsnx.MultiGraph()); })
        .toThrow('JSNetworkXError');
};

//TODO: test_degree_sequence_tree
//TODO: test_random_degree_sequence_graph
//TODO: test_random_degree_sequence_graph_raise


(new TestDegreeSeq()).run();
