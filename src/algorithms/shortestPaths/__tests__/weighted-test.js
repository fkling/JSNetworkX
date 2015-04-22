/*global assert*/
'use strict';

import * as weighted from '../weighted';

import {
  getDefault
} from '../../../_internals';

import {
  DiGraph,
  MultiDiGraph,
  Map,
  JSNetworkXNoPath,
  convertNodeLabelsToIntegers
} from '../../../';

import {
  cycleGraph,
  grid2dGraph
} from '../../../generators';

function validatePath(G, source, target, length, path) {
  assert.equal(path[0], source);
  assert.equal(path[path.length - 1], target);
  let sum = 0;
  if (!G.isMultigraph()) {
    for (let i = 0; i < path.length - 1; i += 1) {
      sum += getDefault(G.get(path[i]).get(path[i+1]).weight, 1);
    }
  } else {
    for (let i = 0; i < path.length - 1; i += 1) {
      let keydata = G.get(path[i]).get(path[i+1]);
      let min = Infinity;
      for (let prop in keydata) {
        let weight = getDefault(keydata[prop].weight, 1);
        min = weight < min ? weight : min;
      }
      sum += min;
    }
  }
  assert.equal(length, sum);
}

export var testWeighted = {
  beforeEach: function() {
    this.grid = convertNodeLabelsToIntegers(grid2dGraph(4, 4), 1, 'sorted');
    this.cycle = cycleGraph(7);
    this.XG = new DiGraph();
    this.XG.addWeightedEdgesFrom([
      ['s', 'u', 10],
      ['s', 'x', 5],
      ['u', 'v', 1],
      ['u', 'x', 2],
      ['v', 'y', 1],
      ['x', 'u', 3],
      ['x', 'v', 5],
      ['x', 'y', 2],
      ['y', 's', 7],
      ['y', 'v', 6]
    ]);

    this.MXG = new MultiDiGraph(this.XG);
    this.MXG.addEdge('s', 'u', {weight: 15});
    this.XG2 = new DiGraph();
    this.XG2.addWeightedEdgesFrom([
      [1, 4, 1],
      [4, 5, 1],
      [5, 6, 1],
      [6, 3, 1],
      [1, 3, 50],
      [1, 2, 100],
      [2, 3, 100]
    ]);
    this.XG3 = new DiGraph();
    this.XG3.addWeightedEdgesFrom([
      [0, 1, 2],
      [1, 2, 12],
      [2, 3, 1],
      [3, 4, 5],
      [4, 5, 1],
      [5, 0, 10]
    ]);
    this.XG4 = new DiGraph();
    this.XG4.addWeightedEdgesFrom([
      [0, 1, 2],
      [1, 2, 2],
      [2, 3, 1],
      [3, 4, 1],
      [4, 5, 1],
      [5, 6, 1],
      [6, 7, 1],
      [7, 0, 1]
    ]);
    this.MXG4 = new MultiDiGraph(this.XG4);
    this.MXG4.addEdge(0, 1, {weight: 3});
    this.G = new DiGraph(); // no weights
    this.G.addEdgesFrom([
      ['s', 'u'],
      ['s', 'x'],
      ['u', 'v'],
      ['u', 'x'],
      ['v', 'y'],
      ['x', 'u'],
      ['x', 'v'],
      ['x', 'y'],
      ['y', 's'],
      ['y', 'v']
    ]);
  },

  testDijkstra: function() {
    var [distances, paths] = weighted.singleSourceDijkstra(
      this.XG,
      {source: 's'}
    );
    validatePath(this.XG, 's', 'v', 9, paths.get('v'));
    assert.equal(distances.get('v'), 9);

    validatePath(this.XG, 's', 'v', 9,
      weighted.singleSourceDijkstraPath(this.XG, {source: 's'}).get('v')
    );
    assert.equal(
      weighted.singleSourceDijkstraPathLength(this.XG, {source: 's'}).get('v'),
      9
    );

    validatePath(
      this.XG, 's', 'v', 9,
      weighted.singleSourceDijkstra(this.XG, {source: 's'})[1].get('v')
    );
    validatePath(
      this.MXG, 's', 'v', 9,
      weighted.singleSourceDijkstraPath(this.MXG, {source: 's'}).get('v')
    );


    var GG = this.XG.toUndirected();
    // make sure we get lower weight
    // toUndirected might choose either edge with weight 2 or 3
    GG.get('u').get('x').weight = 2;
    [distances, paths] = weighted.singleSourceDijkstra(GG, {source: 's'});
    validatePath(GG, 's', 'v', 8, paths.get('v'));
    assert.equal(distances.get('v'), 8); // uses lower weight of 2 on u<->x edge
    validatePath(
      GG, 's', 'v', 8,
      weighted.dijkstraPath(GG, {source: 's', target: 'v'}
    ));
    assert.equal(
      weighted.dijkstraPathLength(GG, {source: 's', target: 'v'}),
      8
    );

    validatePath(
      this.XG2, 1, 3, 4,
      weighted.dijkstraPath(this.XG2, {source: 1, target: 3}
    ));
    validatePath(
      this.XG3, 0, 3, 15,
      weighted.dijkstraPath(this.XG3, {source: 0, target: 3}
    ));
    assert.equal(
      weighted.dijkstraPathLength(this.XG3, {source: 0, target: 3}),
      15
    );
    validatePath(
      this.XG4, 0, 2, 4,
      weighted.dijkstraPath(this.XG4, {source: 0, target: 2}
    ));
    assert.equal(
      weighted.dijkstraPathLength(this.XG4, {source: 0, target: 2}),
      4
    );
    validatePath(
      this.MXG4, 0, 2, 4,
      weighted.dijkstraPath(this.MXG4, {source: 0, target: 2}
    ));
    validatePath(
      this.G, 's', 'v', 2,
      weighted.singleSourceDijkstra(
        this.G,
        {source: 's', target: 'v'}
      )[1].get('v')
    );
    validatePath(
      this.G, 's', 'v', 2,
      weighted.singleSourceDijkstra(this.G, {source: 's'})[1].get('v')
    );
    validatePath(
      this.G, 's', 'v', 2,
      weighted.dijkstraPath(this.G, {source: 's', target: 'v'})
    );
    assert.equal(
      weighted.dijkstraPathLength(this.G, {source: 's', target: 'v'}),
      2
    );

    // JSNetworkXError: node s not reachable from moon
    assert.throws(
      () => weighted.dijkstraPath(this.G, {source: 's', target: 'moon'}),
      JSNetworkXNoPath
    );
    assert.throws(
      () => weighted.dijkstraPathLength(this.G, {source: 's', target: 'moon'}),
      JSNetworkXNoPath
    );

    validatePath(
      this.cycle, 0, 3, 3,
      weighted.dijkstraPath(this.cycle, {source: 0, target: 3}
    ));
    validatePath(
      this.cycle, 0, 4, 3,
      weighted.dijkstraPath(this.cycle, {source: 0, target: 4}
    ));

    assert.deepEqual(
      weighted.singleSourceDijkstra(this.cycle, {source: 0, target: 0}),
      [new Map([[0, 0]]), new Map([[0, 0]])]
    );
  },


  // TODO testBidirectionalDijkstra
  // TODO testBidirectionalDijkstraNoPath
  // TODO testDijkstraPredecessor

  testSingleSourceDijkstraPathLength: function() {
    var pl = weighted.singleSourceDijkstraPathLength;
    assert.equal(pl(this.MXG4, {source: 0}).get(2), 4);
    assert.notOk(pl(this.MXG4, {source: 0, cutoff: 2}).has(4));
  },

  // TODO testBidirectionalDijkstraMultigraph
  // TODO testDijkstraPredDistanceMultigraph
  // TODO testNegativeEdgeCycle

};
