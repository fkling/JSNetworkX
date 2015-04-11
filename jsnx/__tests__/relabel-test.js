/*globals assert*/
'use strict';

import {Graph, DiGraph, MultiGraph, MultiDiGraph} from '../classes';
import {JSNetworkXError} from '../exceptions';

import * as relabel from '../relabel';
import {emptyGraph} from '../generators';


export var testRelabel = {

  testConvertNodeLabelsToIntegers: function() {
    // test that empty graph converts fine for all options
    var G = emptyGraph();
    var H = relabel.convertNodeLabelsToIntegers(G, 100);
    assert.equal(H.name, '(emptyGraph(0))WithIntLabels');
    assert.deepEqual(H.nodes(), []);
    assert.deepEqual(H.edges(), []);

    ['default', 'sorted', 'increasing degree',
     'decreasing degree'].forEach(function(opt) {
       /* eslint-disable no-shadow */
       var G = emptyGraph();
       var H = relabel.convertNodeLabelsToIntegers(G, 100, opt);
       /* eslint-enable no-shadow */
       assert.equal(H.name, '(emptyGraph(0))WithIntLabels');
       assert.deepEqual(H.nodes(), []);
       assert.deepEqual(H.edges(), []);
    });

    G = emptyGraph();
    G.addEdgesFrom([['A','B'],['A','C'],['B','C'],['C','D']]);
    G.name = 'paw';
    H = relabel.convertNodeLabelsToIntegers(G);
    var degH = Array.from(H.degree().values());
    var degG = Array.from(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());

    H = relabel.convertNodeLabelsToIntegers(G, 1000);
    degH = Array.from(H.degree().values());
    degG = Array.from(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(H.nodes(), [1000, 1001, 1002, 1003]);

    H = relabel.convertNodeLabelsToIntegers(G, 'increasing degree');
    degH = Array.from(H.degree().values());
    degG = Array.from(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.equal(H.degree(0), 1);
    assert.equal(H.degree(1), 2);
    assert.equal(H.degree(2), 2);
    assert.equal(H.degree(3), 3);

    H = relabel.convertNodeLabelsToIntegers(G, 'decreasing degree');
    degH = Array.from(H.degree().values());
    degG = Array.from(G.degree().values());
    assert.deepEqual(degH.sort(), degG.sort());
    assert.deepEqual(H.degree(0), 3);
    assert.deepEqual(H.degree(1), 2);
    assert.deepEqual(H.degree(2), 2);
    assert.deepEqual(H.degree(3), 1);
  },

  testRelabelNodesCopy: function() {
    var G = emptyGraph();
    G.addEdgesFrom([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabelNodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  testRelabelNodesFunction: function() {
    var G = emptyGraph();
    G.addEdgesFrom([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var H = relabel.relabelNodes(G, function(n) {
        return n.charCodeAt(0);
    });
    assert.deepEqual(H.nodes().sort(), [65, 66, 67, 68]);
  },

  testRelabelNodesGraph: function() {
    var G = new Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabelNodes(G, mapping);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  testRelabelNodesDigraph: function() {
    var G = new DiGraph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'A': 'aardvark','B': 'bear','C': 'cat','D': 'dog'};
    var H = relabel.relabelNodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear', 'cat', 'dog']);
  },

  testRelabelNodesMultigraph: function() {
    var G = new MultiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = relabel.relabelNodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(
      H.edges().sort(),
      [['aardvark', 'bear'], ['aardvark', 'bear']]
    );
  },

  testRelabelNodesMultidigraph: function() {
    var G = new MultiDiGraph([['a', 'b'], ['a', 'b']]);
    var mapping = {'a': 'aardvark','b': 'bear'};
    var H = relabel.relabelNodes(G, mapping, false);
    assert.deepEqual(H.nodes().sort(), ['aardvark', 'bear']);
    assert.deepEqual(
      H.edges().sort(),
      [['aardvark', 'bear'], ['aardvark', 'bear']]
    );
  },

  testRelabelNodesMissing: function() {
    var G = new Graph([['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]);
    var mapping = {'0': 'aardvark'};
    assert.throws(
      () => relabel.relabelNodes(G, mapping, false),
      JSNetworkXError
    );
  }

  //TODO: testRelabelNodesTopsort
};
