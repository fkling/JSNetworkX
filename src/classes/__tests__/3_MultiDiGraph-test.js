/*global assert, utils*/
'use strict';

import BaseMultiDiGraphTester from './BaseMultiDiGraphTester';
import MultiDiGraph from '../MultiDiGraph';
import {JSNetworkXError} from '../../exceptions';
import {TestMultiGraph} from './2_MultiGraph-test';

var Map = utils.Map;

export var TestMultiDiGraph = Object.assign(
  {},
  TestMultiGraph,
  BaseMultiDiGraphTester,
  {
  beforeEach: function() {
    this.Graph = MultiDiGraph;
    // build K3
    this.k3edges = [[0, 1], [0, 2], [1, 2]];
    this.k3nodes = [0, 1, 2];
    this.K3 = new this.Graph();
    this.K3.adj =
      new Map({0: new Map(),1: new Map(),2: new Map()});
    this.K3.succ = this.K3.adj;
    this.K3.pred =
      new Map({0: new Map(),1: new Map(),2: new Map()});
    this.k3nodes.forEach(function(u) {
      this.k3nodes.forEach(function(v) {
        if (v !== u) {
          var d = {0: {}};
          this.K3.succ.get(u).set(v, d);
          this.K3.pred.get(v).set(u, d);
        }
      }, this);
    }, this);

    this.K3.adj = this.K3.succ;
    this.K3.edge = this.K3.adj;
    this.K3.node = new Map({0: {}, 1: {}, 2: {}});
  },

  testAddEdge: function() {
    var G = new this.Graph();
    G.addEdge(0, 1);
    assert.deepEqual(
      G.adj,
      new Map({0: new Map({1: {0: {}}}), 1: new Map()})
    );
    assert.deepEqual(
      G.succ,
      new Map({0: new Map({1: {0: {}}}), 1: new Map()})
    );
    assert.deepEqual(
      G.pred,
      new Map({0: new Map(), 1: new Map({0: {0: {}}})})
    );

    G = new this.Graph();
    G.addEdge.apply(G, [0, 1]);
    assert.deepEqual(
      G.adj,
      new Map({0: new Map({1: {0: {}}}), 1: new Map()})
    );
    assert.deepEqual(
      G.succ,
      new Map({0: new Map({1: {0: {}}}), 1: new Map()})
    );
    assert.deepEqual(
      G.pred,
      new Map({0: new Map(), 1: new Map({0: {0: {}}})})
    );
  },

  testAddEdgesFrom: function() {
    var G = new this.Graph();
    G.addEdgesFrom([[0,1], [0,1, {weight: 3}]]);
    assert.deepEqual(
      G.adj,
      new Map({
        0: new Map({1: {0: {}, 1: {weight: 3}}}),
        1: new Map()
      })
    );
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({1: {0: {}, 1: {weight: 3}}}),
        1: new Map()
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map(),
        1: new Map({0: {0: {}, 1: {weight: 3}}})
      })
    );

    G.addEdgesFrom([[0,1], [0,1, {weight: 3}]], {weight: 2});
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({
          1: {
            0: {},
            1: {weight: 3},
            2: {weight: 2},
            3: {weight: 3}
          }
        }),
        1: new Map()
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map(),
        1: new Map({0: {0: {}, 1: {weight: 3}, 2: {weight: 2}, 3: {weight: 3}}})
      })
    );

    // too few in tuple
    assert.throws(() => G.addEdgesFrom([[0]]), JSNetworkXError);
    // too many in tuple
    assert.throws(
      () => G.addEdgesFrom([[0,1,2,3,4]]),
      JSNetworkXError
    );
    assert.throws(() => G.addEdgesFrom([0]), TypeError);
  },

  testRemoveEdge: function() {
    var G = this.K3;
    G.removeEdge(0, 1);
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.throws(() => G.removeEdge(-1, 0), JSNetworkXError);
    assert.throws(() => G.removeEdge(0, 2, 1), JSNetworkXError);
  },

  testRemoveMultiedge: function() {
    var G = this.K3;
    G.addEdge(0, 1, 'parallel edge');
    G.removeEdge(0, 1, 'parallel edge');
    assert.deepEqual(
      G.adj,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );

    G.removeEdge(0, 1);
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.throws(() => G.removeEdge(-1, 0), JSNetworkXError);
  },

  testRemoveEdgesFrom: function() {
    var G = this.K3;
    G.removeEdgesFrom([[0, 1]]);
    assert.deepEqual(
      G.succ,
      new Map({
        0: new Map({2: {0: {}}}),
        1: new Map({0: {0: {}}, 2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.deepEqual(
      G.pred,
      new Map({
        0: new Map({1: {0: {}}, 2: {0: {}}}),
        1: new Map({2: {0: {}}}),
        2: new Map({0: {0: {}}, 1: {0: {}}})
      })
    );
    assert.doesNotThrow(() => G.removeEdgesFrom([[0,0]])); // silent fail
  }
});
