/*jshint strict:false, node:true*/

var assert = require('assert');
var jsnx = require('../../../jsnetworkx-test');

//TODO: test_configuration_model
//TODO: test_assert.throwsed_degree_graph

exports.TestDegreeSeq = {

  test_havel_hakimi_construction: function() {
    var z = [1000,3,3,3,3,2,2,2,1,1,1];
    assert.throws(function(){jsnx.havel_hakimi_graph(z);}, jsnx.JSNetworkXError);

    z = ["A",3,3,3,3,2,2,2,1,1,1];
    assert.throws(function(){jsnx.havel_hakimi_graph(z);}, jsnx.JSNetworkXError);

    z = [5,4,3,3,3,2,2,2];
    assert.doesNotThrow(function(){jsnx.havel_hakimi_graph(z);});
    //TODO: G = jsnx.configuration_model(z);

    z = [6,5,4,4,2,1,1,1];
    assert.throws(function(){jsnx.havel_hakimi_graph(z);}, jsnx.JSNetworkXError);

    z = [10,3,3,3,3,2,2,2,2,2,2];
    assert.doesNotThrow(function(){jsnx.havel_hakimi_graph(z);});

    assert.throws(
      function(){jsnx.havel_hakimi_graph(z, jsnx.DiGraph());},
      jsnx.JSNetworkXError
    );
    assert.throws(
      function(){jsnx.havel_hakimi_graph(z, jsnx.MultiGraph());},
      jsnx.JSNetworkXError
    );
  }

  //TODO: test_degree_sequence_tree
  //TODO: test_random_degree_sequence_graph
  //TODO: test_random_degree_sequence_graph_raise
};
