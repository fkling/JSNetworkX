/*jshint strict:false, node:true*/

var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');

exports.TestMisc = {

//TODO: test_is_string_like ?
//TODO: test_iterable ?
//TODO: test_graph_iterable ?

  test_is_list_of_ints: function() {
    assert(jsnx.utils.is_list_of_ints([1,2,3,42]));
    assert(!jsnx.utils.is_list_of_ints([1,2,3,'kermit']));
  },

  // Not in original tests
  test_cumulative_sum:  function() {
    assert(
      jsnx.toArray(jsnx.utils.cumulative_sum([1,2,3,4])),
      [1,3,6,10]
    );
  }
  //TODO: test_random_number_distribution
};
