/*global assert, utils*/
'use strict';

import BaseGraphTester from './BaseGraphTester';
import Graph from '../Graph';
import DiGraph from '../DiGraph';
var Map = utils.Map;
import JSNetworkXError from '../../exceptions/JSNetworkXError';

import shared from './shared';
import _ from 'lodash';

export default _.extend({}, BaseGraphTester, {
  testWeightedDegree: function() {
    var G = new this.Graph();
    G.addEdge(1,2,{weight: 2,other: 3});
    G.addEdge(2,3,{weight: 3,other: 4});
    assert.deepEqual(Array.from(G.degree(null, 'weight').values()), [2,5,3]);
    assert.deepEqual(G.degree(null, 'weight'), new Map([[1,2],[2,5],[3,3]]));
    assert.equal(G.degree(1, 'weight'), 2);
    assert.deepEqual(G.degree([1], 'weight'), new Map([[1,2]]));

    assert.deepEqual(Array.from(G.degree(null, 'other').values()), [3,7,4]);
    assert.deepEqual(G.degree(null, 'other'), new Map([[1,3],[2,7],[3,4]]));
    assert.equal(G.degree(1, 'other'), 3);
    assert.deepEqual(G.degree([1], 'other'), new Map([[1,3]]));
  },

  testName: function() {
    var G = new this.Graph(null, {name: ''});
    assert.equal(G.name,'');
    G = new this.Graph(null, {name: 'test'});
    assert.equal(G.toString(), 'test');
    assert.equal(G.name, 'test');
  },

  testCopy: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = G.copy();
    //shared.is_deepcopy(H, G);
    H = new G.constructor(G);
    shared.isShallowCopy(H,G);
  },

  testCopyAttr: function() {
    var G = new this.Graph(null, {foo: []});
    G.addNode(0, {foo: []});
    G.addEdge(1,2, {foo: []});
    var H = G.copy();
    shared.isDeepcopy(H, G);
    H = new G.constructor(G); // just copy
    shared.isShallowCopy(H, G);
  },

  testGraphAttr: function() {
    var G = this.K3;
    G.graph.foo = 'bar';
    assert.equal(G.graph.foo, 'bar');
    delete G.graph.foo;
    assert.deepEqual(G.graph, {});
    var H = new this.Graph(null, {foo: 'bar'});
    assert.equal(H.graph.foo, 'bar');

  },

  testNodeAttr: function() {
    var G = this.K3;
    G.addNode(1, {foo: 'bar'});
    assert.deepEqual(G.nodes(), [0,1,2]);
    assert.deepEqual(G.nodes(true), [[0,{}],[1,{'foo': 'bar'}],[2,{}]]);
    G.node.get(1).foo='baz';
    assert.deepEqual(G.nodes(true), [[0,{}],[1,{'foo': 'baz'}],[2,{}]]);
  },

  testNodeAttr2: function() {
    var G = this.K3;
    var a = {'foo': 'bar'};
    G.addNode(3, a);
    assert.deepEqual(G.nodes(), [0,1,2,3]);
    assert.deepEqual(
      G.nodes(true),
      [[0,{}],[1,{}],[2,{}],[3,{'foo': 'bar'}]]
    );

  },

  testEdgeAttr: function() {
    var G = new this.Graph();
    G.addEdge(1,2,{foo: 'bar'});
    assert.deepEqual(G.edges(true), [[1,2,{'foo': 'bar'}]]);
  },

  testEdgeAttr2: function() {
    var G = new this.Graph();
    G.addEdgesFrom([[1,2],[3,4]],{foo: 'foo'});
    assert.deepEqual(
      G.edges(true).sort(),
      [[1,2,{'foo': 'foo'}],[3,4,{'foo': 'foo'}]]
    );
  },

  testEdgeAttr3: function() {
    var G = new this.Graph();
    G.addEdgesFrom([[1,2,{'weight': 32}],[3,4,{'weight': 64}]],{foo: 'foo'});
    assert.deepEqual(
      G.edges(true),
      [
        [1,2,{'foo': 'foo','weight': 32}],
        [3,4,{'foo': 'foo','weight': 64}]
      ]
    );

    G.removeEdgesFrom([[1,2],[3,4]]);
    G.addEdge(1,2,{data: 7,spam: 'bar',bar: 'foo'});
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data': 7,'spam': 'bar','bar': 'foo'}]]
    );
  },

  testEdgeAttr4: function() {
    var G = new this.Graph();
    G.addEdge(1,2,{data: 7,spam: 'bar',bar: 'foo'});
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data': 7,'spam': 'bar','bar': 'foo'}]]
    );
    G.get(1).get(2).data = 10;  // OK to set data like this
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data': 10,'spam': 'bar','bar': 'foo'}]]
    );

    G.edge.get(1).get(2).data = 20; // another spelling, "edge"
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data': 20,'spam': 'bar','bar': 'foo'}]]
    );
    G.edge.get(1).get(2).listdata = [20,200];
    G.edge.get(1).get(2).weight = 20;
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data': 20,'spam': 'bar',
        'bar': 'foo','listdata': [20,200],'weight': 20}]]
    );
  },

  testAttrDictNotDict: function() {
    // attr_dict must be dict
    var G = new this.Graph();
    var edges = [[1,2]];
    assert.throws(function(){
      G.addEdgesFrom(edges,[]);
    }, JSNetworkXError);
  },

  testToUndirected: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = new Graph(G);
    shared.isShallowCopy(H,G);
    H = G.toUndirected();
    shared.isDeepcopy(H,G);
  },

  testToDirected: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = new DiGraph(G);
    shared.isShallowCopy(H,G);
    H = G.toDirected();
    shared.isDeepcopy(H,G);
  },

  testSubgraph: function() {
    var G = this.K3;
    shared.addAttributes(G);
    var H = G.subgraph([0,1,2,5]);
    // assert.equal(H.name, 'Subgraph of ('+G.name+')')
    H.name = G.name;
    shared.graphsEqual(H, G);
    shared.sameAttrdict(H, G);
    shared.shallowCopyAttrdict(H, G);

    H = G.subgraph(0);
    assert.deepEqual(H.adj, new Map([[0, new Map()]]));
    H = G.subgraph([]);
    assert.deepEqual(H.adj, new Map());
    assert.notDeepEqual(G.adj, new Map());
  },

  testSelfloopsAttr: function() {
    var G = this.K3.copy();
    G.addEdge(0,0);
    G.addEdge(1,1,{weight: 2});
    assert.deepEqual(
      G.selfloopEdges(true),
      [[0,0,{}],[1,1,{weight: 2}]]
    );
  }
});
