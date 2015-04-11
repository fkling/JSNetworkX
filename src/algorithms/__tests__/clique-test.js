/*global assert, utils*/
'use strict';

import {
  convertNodeLabelsToIntegers,
  relabelNodes
} from '../../relabel';
import {
  havelHakimiGraph,
  completeGraph
} from '../../generators';

import {
  findCliques,
  findCliquesRecursive,
  graphCliqueNumber,
  graphNumberOfCliques,
  numberOfCliques
} from '../clique';

export var clique = {

  beforeEach: function() {
    var z = [3,4,3,4,2,4,2,1,1,1,1];
    this.G = convertNodeLabelsToIntegers(havelHakimiGraph(z), 1);
    this.cl = Array.from(findCliques(this.G));
    var H = completeGraph(6);
    H = relabelNodes(H, {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6});
    H.removeEdgesFrom([[2,6], [2,5], [2,4], [1,3], [5,3]]);
    this.H = H;
  },

  testFindCliques1: function() {
    var cl = Array.from(findCliques(this.G));
    var rcl = Array.from(findCliquesRecursive(this.G));

    assert.deepEqual(
      cl.map(v => v.sort()).sort(),
      rcl.map(v => v.sort()).sort()
    );

    var expected = [[2, 6, 1, 3], [2, 6, 4], [5, 4, 7], [8, 9], [10, 11]];
    assert.deepEqual(
      cl.map(v => v.sort()).sort(),
      expected.map(v => v.sort()).sort()
    );
  },

  testSelfloops: function() {
    this.G.addEdge(1,1);
    var cl = Array.from(findCliques(this.G));
    var rcl = Array.from(findCliquesRecursive(this.G));

    assert.deepEqual(
      cl.map(v => v.sort()).sort(),
      rcl.map(v => v.sort()).sort()
    );

    var expected = [[2, 6, 1, 3], [2, 6, 4], [5, 4, 7], [8, 9], [10, 11]];
    assert.deepEqual(
      cl.map(v => v.sort()).sort(),
      expected.map(v => v.sort()).sort()
    );
  },

  testFindCliques2: function() {
    var hcl = Array.from(findCliques(this.H));

    assert.deepEqual(
      hcl.map(v => v.sort()).sort(),
      [[1,2], [1,4,5,6],[2,3],[3,4,6]]
    );
  },

  testCliqueNumber: function() {
    assert.equal(graphCliqueNumber(this.G), 4);
    assert.equal(graphCliqueNumber(this.G, this.cl), 4);
  },

  testNumberOfCliques: function() {
    var G = this.G;
    assert.equal(graphNumberOfCliques(G), 5);
    assert.equal(graphNumberOfCliques(G, this.cl), 5);
    assert.equal(numberOfCliques(G, 1), 1);
    assert.deepEqual(numberOfCliques(G,[1]), new utils.Map({1: 1}));
    assert.deepEqual(numberOfCliques(G,[1,2]), new utils.Map({1: 1, 2: 2}));
    assert.deepEqual(numberOfCliques(G,2), 2);

    assert.deepEqual(
      numberOfCliques(G),
      new utils.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
        6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      numberOfCliques(G, G.nodes()),
      new utils.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                    6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      numberOfCliques(G, [2,3,4]),
      new utils.Map({2: 2, 3: 1, 4: 2})
    );

    assert.deepEqual(
      numberOfCliques(G, null, this.cl),
      new utils.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                    6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );

    assert.deepEqual(
      numberOfCliques(G, G.nodes(), this.cl),
      new utils.Map({1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                   6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1})
    );
  }

  //TODO: test_node_clique_number
  //TODO: test_cliques_containing_node
  //TODO: test_make_clique_bipartite
};
