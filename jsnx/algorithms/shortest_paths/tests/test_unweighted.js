/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

function TestUnweightedPath(name) {
      goog.base(this, name || "TestUnweightedPath");
}

goog.inherits(TestUnweightedPath, BaseTestClass);

TestUnweightedPath.prototype.setUp = function() {
  this.grid = jsnx.convert_node_labels_to_integers(
    jsnx.grid_2d_graph(4,4),
    1,
    'sorted'
  );
  this.cycle = jsnx.cycle_graph(7);
  this.directed_cycle = jsnx.cycle_graph(7, jsnx.DiGraph());
};

TestUnweightedPath.prototype.test_bidirectional_shortest_path = function() {
  expect(jsnx.bidirectional_shortest_path(this.cycle, 0, 3))
    .toEqual(['0','1','2','3']);
  expect(jsnx.bidirectional_shortest_path(this.cycle, 0, 4))
    .toEqual(['0','6','5','4']);
  expect(jsnx.bidirectional_shortest_path(this.grid, 1, 12))
    .toEqual(['1','2','3','4','8','12']);
  expect(jsnx.bidirectional_shortest_path(this.directed_cycle, 0, 3))
    .toEqual(['0','1','2','3']);
};

//TODO: test_shortest_path_length

TestUnweightedPath.prototype.test_single_source_shortest_path_length = function() {
  expect(jsnx.single_source_shortest_path_length(this.cycle, 0))
    .toEqual({0:0,1:1,2:2,3:3,4:3,5:2,6:1});
};


TestUnweightedPath.prototype.test_single_source_shortest_path = function() {
  var p = jsnx.single_source_shortest_path(this.cycle, 0);
  expect(p[3]).toEqual(['0','1','2','3']);
};

TestUnweightedPath.prototype.test_all_pairs_shortest_path = function() {
  var p = jsnx.all_pairs_shortest_path(this.cycle);
  expect(p[0][3]).toEqual(['0','1','2','3']);
  p = jsnx.all_pairs_shortest_path(this.grid);
  // Paths are not unique
  expect(p[1][12]).toEqualAny([
    ['1','2','3','4','8','12'],
    ['1','5','6','7','8','12'],
    ['1','5','9','10','11','12']
  ]);
};

TestUnweightedPath.prototype.test_all_pairs_shortest_path_length = function() {
  var l = jsnx.all_pairs_shortest_path_length(this.cycle);
  expect(l[0]).toEqual({0:0,1:1,2:2,3:3,4:3,5:2,6:1});
  l = jsnx.all_pairs_shortest_path_length(this.grid);
  expect(l[1][16]).toEqual(6);
};

TestUnweightedPath.prototype.test_predecessor = function() {
  var G = jsnx.path_graph(4);
  expect(jsnx.predecessor(G, 0)).toEqual({0:[],1:['0'],2:['1'],3:['2']});
  expect(jsnx.predecessor(G, 0, 3)).toEqual(['2']);
  // TODO: test for grid graph. Makes more sense if support for generic nodes
  // has been added.
};

(new TestUnweightedPath()).run();
