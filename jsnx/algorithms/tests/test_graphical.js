/*jshint strict:false, node:true*/

var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');

exports.TestGraphical = {

  test_valid_degree_sequence1:  function() {
    var n = 100;
    var p = 0.3;
    for(var i = 0; i < 10; i++) {
      var G = jsnx.erdos_renyi_graph(n, p);
      var deg = G.degree().values();
      assert(jsnx.is_valid_degree_sequence(deg, /*method=*/'eg'));
      assert(jsnx.is_valid_degree_sequence(deg, /*method=*/'hh'));
    }
  },

//TODO: test_valid_degree_sequence2
//TODO: test_atlas

  test_small_graph_true: function() {
    var z = [5,3,3,3,3,2,2,2,1,1,1];
    assert(jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(jsnx.is_valid_degree_sequence(z, 'eg'));
    z = [10,3,3,3,3,2,2,2,2,2,2];
    assert(jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(jsnx.is_valid_degree_sequence(z, 'eg'));
    z = [1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    assert(jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(jsnx.is_valid_degree_sequence(z, 'eg'));
  },

  test_small_graph_false: function() {
    var z = [1000,3,3,3,3,2,2,2,1,1,1];
    assert(!jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(!jsnx.is_valid_degree_sequence(z, 'eg'));
    z = [6,5,4,4,2,1,1,1];
    assert(!jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(!jsnx.is_valid_degree_sequence(z, 'eg'));
    z = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    assert(!jsnx.is_valid_degree_sequence(z, 'hh'));
    assert(!jsnx.is_valid_degree_sequence(z, 'eg'));
  }
};
