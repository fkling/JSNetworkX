/*global assert, utils*/
'use strict';
import BaseMultiGraphTester from './BaseMultiGraphTester';
import {TestGraph} from './0_Graph-test';
import {KeyError, JSNetworkXError} from '../../exceptions';

import MultiGraph from '../MultiGraph';

var Map = utils.Map;

export var TestMultiGraph = Object.assign({}, TestGraph, BaseMultiGraphTester, {
  beforeEach: function() {
    this.Graph = MultiGraph;
    var ed1 = {0: {}};
    var ed2 = {0: {}};
    var ed3 = {0: {}};
    this.k3adj = new Map({
      0: new Map({1: ed1, 2: ed2}),
      1: new Map({0: ed1, 2: ed3}),
      2: new Map({0: ed2, 1: ed3})
    });
    this.k3edges = [[0,1], [0,2], [1,2]];
    this.k3nodes = [0,1,2];
    this.K3 = new this.Graph();
    this.K3.adj = this.K3.edge = this.k3adj;
    this.K3.node = new Map({0: {}, 1: {}, 2: {}});
  },

  testDataInput: function() {
    var G = new this.Graph({1: [2], 2: [1]}, {name: 'test'});
    assert.equal(G.name, 'test');
    assert.deepEqual(
      Array.from(G.adj),
      [
        [1, new Map({2: {0: {}}})],
        [2, new Map({1: {0: {}}})]
      ]
    );
  },

  testGetitem: function() {
    var G = this.K3;
    assert.deepEqual(G.get(0), new Map({1: {0: {}}, 2: {0: {}}}));
    assert.throws(() => G.get('j'), KeyError);
    // not implemented:
    // assert.throws(function(){G.get(['A']);}, TypeError);
  },

  testRemoveNode: function() {
    var G = this.K3;
    G.removeNode(0);
    assert.deepEqual(G.adj, new Map({
      1: new Map({2: {0: {}}}),
      2: new Map({1: {0: {}}})
    }));
    assert.throws(() => G.removeNode(-1), JSNetworkXError);
  },

  testAddEdge: function() {
    var G = new this.Graph();
    G.addEdge(0,1);
    assert.deepEqual(G.adj, new Map({
      0: new Map({1: {0: {}}}),
      1: new Map({0: {0: {}}})
    }));
    G = new this.Graph();
    G.addEdge.apply(G, [0,1]);
    assert.deepEqual(G.adj, new Map({
      0: new Map({1: {0: {}}}),
      1: new Map({0: {0: {}}})
    }));
  },

  testAddEdgeConflictingKey: function() {
    var G = new this.Graph();
    G.addEdge(0, 1, 1);
    G.addEdge(0, 1);
    assert.equal(G.numberOfEdges(), 2);
    G = new this.Graph();
    G.addEdgesFrom([[0,1,1,{}]]);
    G.addEdgesFrom([[0,1]]);
    assert.equal(G.numberOfEdges(), 2);
  },

  testAddEdgesFrom: function() {
    var G = new this.Graph();
    G.addEdgesFrom([[0,1], [0,1, {weight: 3}]]);
    assert.deepEqual(
      G.adj,
      new Map({
        0: new Map({1: {0: {}, 1: {weight: 3}}}),
        1: new Map({0: {0: {}, 1: {weight: 3}}})
      })
    );
    G.addEdgesFrom([[0,1], [0,1, {weight: 3}]], {weight: 2});
    assert.deepEqual(
      G.adj,
      new Map({
        0: new Map({
          1: {
            0: {},
            1: {weight: 3},
            2: {weight: 2},
            3: {weight: 3}
          }
        }),
        1: new Map({0: {0: {}, 1: {weight: 3}, 2: {weight: 2}, 3: {weight: 3}}})
      })
    );

    // too few in tuple
    assert.throws(() => G.addEdgesFrom([[0]]), JSNetworkXError);
    // too many in tuple
    assert.throws(() => G.addEdgesFrom([[0,1,2,3,4]]), JSNetworkXError);
    // not a tuple
    assert.throws(() => G.addEdgesFrom([0]), TypeError);
  },

  testRemoveEdge: function() {
    var G = this.K3;
    G.removeEdge(0,1);
    assert.deepEqual(G.adj, new Map({
      0: new Map({2: {0: {}}}),
      1: new Map({2: {0: {}}}),
      2: new Map({0: {0: {}}, 1: {0: {}}})
    }));
    assert.throws(() => G.removeEdge(-1,0), JSNetworkXError);
    assert.throws(() => G.removeEdge(0,2,1), JSNetworkXError);
  },

  testRemoveEdgesFrom: function() {
    var G = this.K3;
    G.removeEdgesFrom([[0,1]]);
    assert.deepEqual(G.adj, new Map({
      0: new Map({2: {0: {}}}),
      1: new Map({2: {0: {}}}),
      2: new Map({0: {0: {}}, 1: {0: {}}})
    }));
    assert.doesNotThrow(() => G.removeEdgesFrom([[0,0]]));
  },

  testRemoveMultiedge: function() {
    var G = this.K3;
    G.addEdge(0, 1, 'parallel edge');
    G.removeEdge(0, 1, 'parallel edge');

    assert.deepEqual(G.adj, new Map({
      0: new Map({1: {0: {}}, 2: {0: {}}}),
      1: new Map({0: {0: {}}, 2: {0: {}}}),
      2: new Map({0: {0: {}}, 1: {0: {}}})
    }));
    G.removeEdge(0, 1);
    assert.deepEqual(G.adj, new Map({
      0: new Map({2: {0: {}}}),
      1: new Map({2: {0: {}}}),
      2: new Map({0: {0: {}}, 1: {0: {}}})
    }));
    assert.throws(() => G.removeEdge(-1,0), JSNetworkXError);
  }
});
