/*jshint strict:false, node:true*/

var assert= require('assert');
var jsnx = require('../../../../jsnetworkx-test');
var iso = jsnx.algorithms.isomorphism;

exports.TestIsomorph = {

  beforeEach: function() {
    this.G1 = jsnx.Graph();
    this.G2 = jsnx.Graph();
    this.G3 = jsnx.Graph();
    this.G4 = jsnx.Graph();
    this.G1.add_edges_from([[1,2],[1,3],[1,5],[2,3]]);
    this.G2.add_edges_from([[10,20],[20,30],[10,30],[10,50]]);
    this.G3.add_edges_from([[1,2],[1,3],[1,5],[2,5]]);
    this.G4.add_edges_from([[1,2],[1,3],[1,5],[2,4]]);
  },

  test_could_be_isomorphic: function() {
    assert(iso.could_be_isomorphic(this.G1, this.G2));
    assert(iso.could_be_isomorphic(this.G1, this.G3));
    assert(!iso.could_be_isomorphic(this.G1, this.G4));
    assert(iso.could_be_isomorphic(this.G3, this.G2));
  },

  test_fast_could_be_isomorphic: function() {
    assert(iso.fast_could_be_isomorphic(this.G3, this.G2));
  },

  test_faster_could_be_isomorphic: function() {
    assert(iso.faster_could_be_isomorphic(this.G3, this.G2));
  }

  // TODO
  /*
  test_is_isomorphic: function() {
    assert(iso.is_isomorphic(this.G1, this.G2));
    assert(iso.is_isomorphic(this.G1, this.G4));
  },
*/
};
