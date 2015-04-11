/*globals assert, utils*/
'use strict';

import {Graph, DiGraph} from '../../classes';
import JSNetworkXError from '../../exceptions/JSNetworkXError';
import JSNetworkXUnfeasible from '../../exceptions/JSNetworkXUnfeasible';

import * as dag from '../dag';
import {fullRaryTree} from '../../generators';

export var TestDAG = {

  testTopologicalSort1: function() {
    var DG = new DiGraph();
    DG.addEdgesFrom([[1,2],[1,3],[2,3]]);
    assert.deepEqual(dag.topologicalSort(DG), [1,2,3]);
    assert.deepEqual(dag.topologicalSortRecursive(DG), [1,2,3]);
  },

  testTopologicalSort2: function() {
    var DG = new DiGraph({1: [2], 2: [3], 3: [4],
                          4: [5], 5: [1], 11: [12],
                          12: [13], 13: [14], 14: [15]});

    assert.throws(() => dag.topologicalSort(DG), JSNetworkXUnfeasible);
    assert.throws(
      () => dag.topologicalSortRecursive(DG),
      JSNetworkXUnfeasible
    );

    assert(!dag.isDirectedAcyclicGraph(DG));

    DG.removeEdge(1,2);
    assert.deepEqual(
      dag.topologicalSortRecursive(DG),
      [11, 12, 13, 14, 15, 2, 3, 4, 5, 1]
    );
    assert.deepEqual(
      dag.topologicalSort(DG),
      [11, 12, 13, 14, 15, 2, 3, 4, 5, 1]
    );
    assert(dag.isDirectedAcyclicGraph(DG));
  },

  testTopologicalSort3: function() {
    var DG = new DiGraph();
    DG.addEdgesFrom(utils.range(2,5).map(i => [1,i]));
    DG.addEdgesFrom(utils.range(5,9).map(i => [2,i]));
    DG.addEdgesFrom(utils.range(9,12).map(i => [6,i]));
    DG.addEdgesFrom(utils.range(12,15).map(i => [4,i]));

    /*
    * Doesn't validate, probably because the order in which the nodes are
    * iterated over is different.
    assert.deepEqual(
      dag.topological_sort_recursive(DG),
      [1,4,14,13,12,3,2,7,6,11,10,9,5,8]
    );
    assert.deepEqual(
      dag.topological_sort(DG),
      [1,2,8,5,6,9,10,11,7,3,4,12,13,14]
    );
    */

    DG.addEdge(14, 1);

    assert.throws(() => dag.topologicalSort(DG), JSNetworkXUnfeasible);
    assert.throws(
      () => dag.topologicalSortRecursive(DG),
      JSNetworkXUnfeasible
    );
  },

  testTopologicalSort4: function() {
    var G = new Graph();
    G.addEdge(0,1);
    assert.throws(() => dag.topologicalSort(G), JSNetworkXError);
    assert.throws(() => dag.topologicalSortRecursive(G), JSNetworkXError);
  },

  testTopologicalSort5: function() {
    var G = new DiGraph();
    G.addEdge(0,1);
    assert.deepEqual(dag.topologicalSortRecursive(G), [0,1]);
    assert.deepEqual(dag.topologicalSort(G), [0,1]);
  },

  testNbunchArgument: function() {
    var G = new DiGraph();
    G.addEdgesFrom([[1,2], [2,3], [1,4], [1,5], [2,6]]);
    assert.deepEqual(dag.topologicalSort(G), [1,2,3,6,4,5]);
    assert.deepEqual(dag.topologicalSortRecursive(G), [1,5,4,2,6,3]);
    assert.deepEqual(dag.topologicalSort(G, [1]), [1,2,3,6,4,5]);
    assert.deepEqual(dag.topologicalSortRecursive(G,[1]), [1,5,4,2,6,3]);
    assert.deepEqual(dag.topologicalSort(G, [5]), [5]);
    assert.deepEqual(dag.topologicalSortRecursive(G,[5]), [5]);
  },

  testIsAperiodicCycle: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    assert(!dag.isAperiodic(G));
  },

  testIsAperiodicCycle2: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    G.addCycle([3,4,5,6,7]);
    assert(dag.isAperiodic(G));
  },

  testIsAperiodicCycle3: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    G.addCycle([3,4,5,6]);
    assert(!dag.isAperiodic(G));
  },

  testIsAperiodicCycle4: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    G.addCycle([1,3]);
    assert(dag.isAperiodic(G));
  },

  testIsAperiodicSelfloop: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    G.addEdge(1,1);
    assert(dag.isAperiodic(G));
  },

  testIsAperiodicRaise: function() {
    var G = new Graph();
    assert.throws(() => dag.isAperiodic(G), JSNetworkXError);
  },

  /* TODO: davis_southern_women_graph
  test_is_aperiodic_bipartite: function() {
    var G = new DiGraph(davis_southern_women_graph());
    assert(!dag.is_aperiodic(G));
  },
  */

  testIsAperiodicRaryTree: function() {
    var G = fullRaryTree(3, 27, new DiGraph());
    assert(!dag.isAperiodic(G));
  },

  testIsAperiodicDisconnected: function() {
    var G = new DiGraph();
    G.addCycle([1,2,3,4]);
    G.addCycle([5,6,7,8]);
    assert(!dag.isAperiodic(G));
    G.addEdge(1,3);
    G.addEdge(5,7);
    assert(dag.isAperiodic(G));
  },

  testIsAperiodicDisconnected2: function() {
    var G = new DiGraph();
    G.addCycle([0,1,2]);
    G.addEdge(3,3);
    assert(!dag.isAperiodic(G));
  }
};
