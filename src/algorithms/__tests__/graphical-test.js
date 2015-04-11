/*global assert*/
'use strict';

import JSNetworkXException from '../../exceptions/JSNetworkXException';

import {isValidDegreeSequence} from '../graphical';
import {erdosRenyiGraph} from '../../generators/randomGraphs';

export var graphical = {

  testValidDegreeSequence1: function() {
    this.timeout(5000);
    var n = 100;
    var p = 0.3;
    for(var i = 0; i < 10; i++) {
      var G = erdosRenyiGraph(n, p);
      var deg = G.degree();
      assert.ok(isValidDegreeSequence(deg.values(), /*method=*/'eg'), 'eg');
      assert.ok(isValidDegreeSequence(deg.values(), /*method=*/'hh'), 'hh');
    }
  },

  //TODO: test_valid_degree_sequence2

  testStringInput: function() {
    assert.throws(() => isValidDegreeSequence([], 'foo'), JSNetworkXException);
  },

  testNegativeInput: function() {
    assert.ok(!isValidDegreeSequence([-1], 'hh'));
    assert.ok(!isValidDegreeSequence([-1], 'eg'));
    assert.ok(!isValidDegreeSequence([72.5], 'eg'));
  },

  //TODO: test_atlas

  testSmallGraphTrue: function() {
    var z = [5,3,3,3,3,2,2,2,1,1,1];
    assert.ok(isValidDegreeSequence(z, 'hh'), 'hh');
    assert.ok(isValidDegreeSequence(z, 'eg'), 'eg');
    z = [10,3,3,3,3,2,2,2,2,2,2];
    assert.ok(isValidDegreeSequence(z, 'hh'), 'hh');
    assert.ok(isValidDegreeSequence(z, 'eg'), 'eg');
    z = [1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    assert.ok(isValidDegreeSequence(z, 'hh'), 'hh');
    assert.ok(isValidDegreeSequence(z, 'eg'), 'eg');
  },

  testSmallGraphFalse: function() {
    var z = [1000,3,3,3,3,2,2,2,1,1,1];
    assert.ok(!isValidDegreeSequence(z, 'hh'));
    assert.ok(!isValidDegreeSequence(z, 'eg'));
    z = [6,5,4,4,2,1,1,1];
    assert.ok(!isValidDegreeSequence(z, 'hh'));
    assert.ok(!isValidDegreeSequence(z, 'eg'));
    z = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    assert.ok(!isValidDegreeSequence(z, 'hh'));
    assert.ok(!isValidDegreeSequence(z, 'eg'));
  }

  // TODO: test_directed_degree_sequence
  // TODO: test_small_directed_degree_sequence
  // TODO: test_multi_sequence
  // TODO: test_pseudo_sequence
};
