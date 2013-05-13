/*jshint strict:false, node:true*/

var assert = require('../../../../mocha/assert');
var jsnx = require('../../../../jsnetworkx-test');

exports.TestUnweightedPath = {

  beforeEach: function() {
    this.grid = jsnx.convert_node_labels_to_integers(
      jsnx.grid_2d_graph(4,4),
      1,
      'sorted'
    );
    this.cycle = jsnx.cycle_graph(7);
    this.directed_cycle = jsnx.cycle_graph(7, jsnx.DiGraph());
  },

  test_bidirectional_shortest_path: function() {
    assert.deepEqual(
      jsnx.bidirectional_shortest_path(this.cycle, 0, 3),
      [0,1,2,3]
    );
    assert.deepEqual(
      jsnx.bidirectional_shortest_path(this.cycle, 0, 4),
      [0,6,5,4]
    );
    assert.deepEqual(
      jsnx.bidirectional_shortest_path(this.grid, 1, 12),
      [1,2,3,4,8,12]
    );
    assert.deepEqual(
      jsnx.bidirectional_shortest_path(this.directed_cycle, 0, 3),
      [0,1,2,3]
    );
  },

//TODO: test_shortest_path_length

  test_single_source_shortest_path_length: function() {
    assert.deepEqual(
      jsnx.single_source_shortest_path_length(this.cycle, 0),
      new jsnx.Map({0:0,1:1,2:2,3:3,4:3,5:2,6:1})
    );
  },

  test_single_source_shortest_path: function() {
    var p = jsnx.single_source_shortest_path(this.cycle, 0);
    assert.deepEqual(p.get(3), [0,1,2,3]);
  },

  test_all_pairs_shortest_path: function() {
    var p = jsnx.all_pairs_shortest_path(this.cycle);
    assert.deepEqual(p.get(0).get(3), [0,1,2,3]);
    p = jsnx.all_pairs_shortest_path(this.grid);
    // Paths are not unique
    assert.isOneOf(
      p.get(1).get(12),
      [
        [1,2,3,4,8,12],
        [1,5,6,7,8,12],
        [1,5,9,10,11,12]
      ]
    );
  },

  test_all_pairs_shortest_path_length: function() {
    var l = jsnx.all_pairs_shortest_path_length(this.cycle);
    assert.deepEqual(
      l.get(0),
      new jsnx.Map({0:0,1:1,2:2,3:3,4:3,5:2,6:1})
    );
    l = jsnx.all_pairs_shortest_path_length(this.grid);
    assert.deepEqual(l.get(1).get(16), 6);
  },

  test_predecessor: function() {
    var G = jsnx.path_graph(4);
    assert.deepEqual(
      jsnx.predecessor(G, 0),
      new jsnx.Map({0:[],1:[0],2:[1],3:[2]})
    );
    assert.deepEqual(jsnx.predecessor(G, 0, 3), [2]);
    // TODO: test for grid graph. Makes more sense if support for generic nodes
    // has been added.
  }
};
