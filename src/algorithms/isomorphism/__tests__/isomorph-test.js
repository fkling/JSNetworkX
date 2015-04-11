/*global assert*/
'use strict';

import {Graph} from '../../../classes';

import * as iso from '../isomorph';

export var testIsomorph = {

  beforeEach: function() {
    this.G1 = new Graph();
    this.G2 = new Graph();
    this.G3 = new Graph();
    this.G4 = new Graph();
    this.G1.addEdgesFrom([[1,2],[1,3],[1,5],[2,3]]);
    this.G2.addEdgesFrom([[10,20],[20,30],[10,30],[10,50]]);
    this.G3.addEdgesFrom([[1,2],[1,3],[1,5],[2,5]]);
    this.G4.addEdgesFrom([[1,2],[1,3],[1,5],[2,4]]);
  },

  testCouldBeIsomorphic: function() {
    assert(iso.couldBeIsomorphic(this.G1, this.G2));
    assert(iso.couldBeIsomorphic(this.G1, this.G3));
    assert(!iso.couldBeIsomorphic(this.G1, this.G4));
    assert(iso.couldBeIsomorphic(this.G3, this.G2));
  },

  testFastCouldBeIsomorphic: function() {
    assert(iso.fastCouldBeIsomorphic(this.G3, this.G2));
  },

  testFasterCouldBeIsomorphic: function() {
    assert(iso.fasterCouldBeIsomorphic(this.G3, this.G2));
  }

  // TODO
  /*
  testIsIsomorphic: function() {
    assert(iso.isIsomorphic(this.G1, this.G2));
    assert(iso.isIsomorphic(this.G1, this.G4));
  },
*/
};
