/*global assert*/

import {
  compose,
  difference,
  disjointUnion,
  intersection,
  symmetricDifference,
  union,
} from '../binary';

import {
  DiGraph,
  Graph,
  MultiGraph,
} from '../../../classes';

import {
  completeGraph,
  pathGraph,
} from '../../../generators/classic';

import {
  JSNetworkXError,
} from '../../../exceptions';

import Set, {union as setUnion} from '../../../_internals/Set';

function sorted(it) {
  return Array.from(it).sort();
}

export var testBinary = {
  testUnionAttributes() {
    let g = new Graph();
    g.addNode(0, {x: 4});
    g.addNode(1, {x: 5});
    g.addEdge(0, 1, {size: 5});
    g.graph.name = 'g';

    let h = g.copy();
    h.graph.name = 'h';
    h.graph.attr = 'attr';
    h.node.get(0).x = 7;

    let gh = union(g, h, {rename: ['g', 'h']});
    assert.deepEqual(sorted(gh.nodes()), ['g0', 'g1', 'h0', 'h1']);

    let graphs = {g, h};
    for (let n of gh) {
      assert.deepEqual(gh.node.get(n), graphs[n[0]].node.get(Number(n[1])));
    }

    assert.equal(gh.graph.attr, 'attr');
    assert.equal(gh.graph.name, 'h');
  },

  testIntersection() {
    let G = new Graph();
    let H = new Graph();
    G.addNodesFrom([1,2,3,4]);
    G.addEdgesFrom([[1,2], [2,3]]);
    H.addNodesFrom([1,2,3,4]);
    H.addEdgesFrom([[2,3], [3,4]]);

    let I = intersection(G, H);
    assert.deepEqual(sorted(I.nodes()), [1,2,3,4]);
    assert.deepEqual(I.edges(), [[2,3]]);

    G = new Graph();
    G.addNodesFrom([1,2,3,4]);
    G.addEdgesFrom([[2,3]]);
    I = intersection(G, H);
    assert.deepEqual(sorted(I.nodes()), [1,2,3,4]);
    assert.deepEqual(I.edges(), [[2,3]]);
  },

  testIntersectionAttributes() {
    let g = new Graph();
    g.addNode(0, {x: 4});
    g.addNode(1, {x: 5});
    g.addEdge(0, 1, {size: 5});
    g.graph.name = 'g';

    let h = g.copy();
    h.graph.name = 'h';
    h.graph.attr = 'attr';
    h.node.get(0).x = 7;

    let gh = intersection(g, h);
    assert.deepEqual(sorted(gh.nodes()), sorted(g.nodes()));
    assert.deepEqual(sorted(gh.nodes()), sorted(h.nodes()));
    assert.deepEqual(gh.edges(), g.edges());

    h.removeNode(0);
    assert.throws(() => intersection(g, h), JSNetworkXError);
  },

  testIntersectionMultigraphAttributes() {
    let g = new MultiGraph();
    g.addEdge(0, 1, 0);
    g.addEdge(0, 1, 1);
    g.addEdge(0, 1, 2);

    let h = new MultiGraph();
    h.addEdge(0, 1, 0);
    h.addEdge(0, 1, 3);

    let gh = intersection(g, h);
    assert.deepEqual(sorted(gh.nodes()), sorted(g.nodes()));
    assert.deepEqual(sorted(gh.nodes()), sorted(h.nodes()));
    assert.deepEqual(gh.edges(), [[0,1]]);
    assert.deepEqual(gh.edges(false, true), [[0,1,'0']]);
  },

  testDifference() {
    let G = new Graph();
    let H = new Graph();
    G.addNodesFrom([1,2,3,4]);
    G.addEdgesFrom([[1,2], [2,3]]);
    H.addNodesFrom([1,2,3,4]);
    H.addEdgesFrom([[2,3], [3,4]]);
    let D = difference(G, H);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), [[1,2]]);
    D = difference(H, G);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), [[3,4]]);
    D = symmetricDifference(G, H);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), [[1,2], [3,4]]);
  },

  testDifference2() {
    let G = new Graph();
    let H = new Graph();
    G.addNodesFrom([1,2,3,4]);
    G.addEdgesFrom([[1,2], [2,3]]);
    H.addNodesFrom([1,2,3,4]);
    H.addEdge(1, 2);
    let D = difference(G, H);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), [[2,3]]);
    D = difference(H, G);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), []);
    H.addEdge(3, 4);
    D = difference(H, G);
    assert.deepEqual(sorted(D.nodes()), [1,2,3,4]);
    assert.deepEqual(sorted(D.edges()), [[3,4]]);
  },

  testDifferenceAttributes() {
    let g = new Graph();
    g.addNode(0, {x: 4});
    g.addNode(1, {x: 5});
    g.addEdge(0, 1, {size: 5});
    g.graph.name = 'g';

    let h = g.copy();
    h.graph.name = 'h';
    h.graph.attr = 'attr';
    h.node.get(0).x = 7;

    let gh = difference(g, h);
    assert.deepEqual(sorted(gh.nodes()), sorted(g.nodes()));
    assert.deepEqual(sorted(gh.nodes()), sorted(h.nodes()));
    assert.deepEqual(gh.edges(), []);

    h.removeNode(0);
    assert.throws(() => intersection(g, h), JSNetworkXError);
  },

  testDifferenceMultiGraphAttributes() {
    let g = new MultiGraph();
    g.addEdge(0, 1, 0);
    g.addEdge(0, 1, 1);
    g.addEdge(0, 1, 2);

    let h = new MultiGraph();
    h.addEdge(0, 1, 0);
    h.addEdge(0, 1, 3);

    let gh = difference(g, h);
    assert.deepEqual(sorted(gh.nodes()), sorted(g.nodes()));
    assert.deepEqual(sorted(gh.nodes()), sorted(h.nodes()));
    assert.deepEqual(gh.edges(), [[0,1], [0,1]]);
    assert.deepEqual(gh.edges(false, true), [[0,1,'1'], [0,1,'2']]);
  },

  testDifferenceThrows() {
    assert.throws(() => difference(pathGraph(4), pathGraph(3)));
  },

  testSymmetricDifferenceMultiGraph() {
    let g = new MultiGraph();
    g.addEdge(0, 1, 0);
    g.addEdge(0, 1, 1);
    g.addEdge(0, 1, 2);

    let h = new MultiGraph();
    h.addEdge(0, 1, 0);
    h.addEdge(0, 1, 3);

    let gh = symmetricDifference(g, h);
    assert.deepEqual(sorted(gh.nodes()), sorted(g.nodes()));
    assert.deepEqual(sorted(gh.nodes()), sorted(h.nodes()));
    assert.deepEqual(gh.edges(), [[0,1], [0,1], [0,1]]);
    assert.deepEqual(gh.edges(false, true), [[0,1,'1'], [0,1,'2'], [0,1,'3']]);
  },

  testSymmetricDifferenceThrows() {
    assert.throws(() => difference(pathGraph(4), pathGraph(3)));
  },

  testUnionAndCompose() {
    /*eslint-disable max-len */
    let K3 = completeGraph(3);
    let P3 = pathGraph(3);
    let G1 = new DiGraph();
    G1.addEdgesFrom([['A', 'B'], ['A', 'C'], ['A', 'D']]);
    let G2 = new DiGraph();
    G2.addEdgesFrom([['1', '2'], ['1', '3'], ['1', '4']]);

    let G = union(G1, G2);
    let H = compose(G1, G2);
    assert.deepEqual(sorted(G.edges()), sorted(H.edges()));
    assert.notOk(G.hasEdge('A', 1));
    assert.throws(() => union(K3, P3), JSNetworkXError);

    let H1 = union(H, G1, {rename: ['H', 'G1']});
    assert.deepEqual(
      sorted(H1.nodes()),
      ['G1A', 'G1B', 'G1C', 'G1D', 'H1', 'H2', 'H3', 'H4', 'HA', 'HB', 'HC', 'HD']
    );
    let H2 = union(H, G2, {rename: ['H', '']});
    assert.deepEqual(
      sorted(H2.nodes()),
      ['1', '2', '3', '4', 'H1', 'H2', 'H3', 'H4', 'HA', 'HB', 'HC', 'HD']
    );
    assert.notOk(H1.hasEdge('HB', 'HA'));

    G = compose(G, G);
    assert.deepEqual(sorted(G.edges()), sorted(H.edges()));

    G2 = union(G2, G2, {rename: ['', 'copy']});
    assert.deepEqual(
      sorted(G2.nodes()),
      ['1', '2', '3', '4', 'copy1', 'copy2', 'copy3', 'copy4']
    );
    assert.deepEqual(G2.neighbors('copy4'), []);
    assert.deepEqual(
      sorted(G2.neighbors('copy1')),
      ['copy2', 'copy3', 'copy4']
    );
    assert.equal(G.order(), 8);
    assert.equal(G.numberOfEdges(), 6);

    let E = disjointUnion(G, G);
    assert.equal(E.order(), 16);
    assert.equal(E.numberOfEdges(), 12);

    E = disjointUnion(G1, G2);
    assert.deepEqual(
      E.nodes().sort((a,b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    );
  },

  testUnionMultiGraph() {
    let G = new MultiGraph();
    G.addEdge(1, 2, 0);
    G.addEdge(1, 2, 1);

    let H = new MultiGraph();
    H.addEdge(3, 4, 0);
    H.addEdge(3, 4, 1);

    let GH = union(G, H);
    assert.deepEqual(new Set(GH), setUnion(new Set(G), new Set(H)));
    assert.deepEqual(
      new Set(GH.edges(false, true)),
      setUnion(new Set(G.edges(false, true)), new Set(H.edges(false, true)))
    );
  },

  testDisjointUnionMultiGraph() {
    let G = new MultiGraph();
    G.addEdge(0, 1, 0);
    G.addEdge(0, 1, 1);

    let H = new MultiGraph();
    H.addEdge(2, 3, 0);
    H.addEdge(2, 3, 1);

    let GH = disjointUnion(G, H);
    assert.deepEqual(new Set(GH), setUnion(new Set(G), new Set(H)));
    assert.deepEqual(
      new Set(GH.edges(false, true)),
      setUnion(new Set(G.edges(false, true)), new Set(H.edges(false, true)))
    );
  },

  testComposeMultiGraph() {
    let G = new MultiGraph();
    G.addEdge(1, 2, 0);
    G.addEdge(1, 2, 1);

    let H = new MultiGraph();
    H.addEdge(3, 4, 0);
    H.addEdge(3, 4, 1);

    let GH = compose(G, H);
    assert.deepEqual(new Set(GH), setUnion(new Set(G), new Set(H)));
    assert.deepEqual(
      new Set(GH.edges(false, true)),
      setUnion(new Set(G.edges(false, true)), new Set(H.edges(false, true)))
    );
    H.addEdge(1, 2, 2);
    GH = compose(G, H);
    assert.deepEqual(
      new Set(GH.edges(false, true)),
      setUnion(new Set(G.edges(false, true)), new Set(H.edges(false, true)))
    );
  },

  testMixedTypeUnion() {
    assert.throws(() => union(new Graph(), new MultiGraph()), JSNetworkXError);
  },

  testMixedTypeDisjointUnion() {
    assert.throws(
      () => disjointUnion(new Graph(), new MultiGraph()),
      JSNetworkXError
    );
  },

  testMixedTypeIntersection() {
    assert.throws(
      () => intersection(new Graph(), new MultiGraph()),
      JSNetworkXError
    );
  },

  testMixedTypeDifference() {
    assert.throws(
      () => difference(new Graph(), new MultiGraph()),
      JSNetworkXError
    );
  },

  testMixedTypeSymmetricDifference() {
    assert.throws(
      () => symmetricDifference(new Graph(), new MultiGraph()),
      JSNetworkXError
    );
  },

  testMixedTypeCompose() {
    assert.throws(
      () => union(new Graph(), new MultiGraph()),
      JSNetworkXError
    );
  },

};
