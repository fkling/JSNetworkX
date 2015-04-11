/*global assert*/
'use strict';

import sinon from 'sinon';
import {Graph} from '../../classes/';
import {tuple2, tulpe3} from '../../_internals';

import {
  observe,
  unobserve,
  isObservable
} from '../observer';

function calledWith(cb, arg) {
  sinon.assert.calledWith(cb, sinon.match(arg));
}

export var testObserver = {
  testObserve: function() {
    var G = new Graph();
    observe(G);

    assert.isFunction(G.on);
    assert(isObservable(G));

    unobserve(G);
    assert(!isObservable(G));
  },

  testAddNodes: function() {
    var G = new Graph();
    observe(G);

    var cb = sinon.spy();
    G.on('addNodes', cb);

    G.addNode(1);
    calledWith(cb, {nodes: [1], newNodes: [1]});
    cb.reset();

    G.addNodesFrom([1,2,3]);
    calledWith(cb, {nodes: [1,2,3], newNodes: [2,3]});
    cb.reset();

    G.addNodesFrom([[10, {}], 11]);
    calledWith(cb, {nodes: [[10, {}], 11], newNodes: [10, 11]});
  },

  testAddNodesIterator: function() {
    var G = new Graph();
    observe(G);

    function* gen() {
      yield tuple2(1, {});
      yield tuple2(2, {});
    }

    var cb = sinon.spy();
    G.on('addNodes', cb);
    G.addNodesFrom(gen());

    calledWith(cb, {nodes: [[1,{}], [2,{}]], newNodes: [1,2]});
  },

  testAddEdges: function() {
    var G = new Graph();
    observe(G);

    var cb = sinon.spy();
    G.on('addEdges', cb);

    G.addEdge(1, 2);
    calledWith(cb, {edges: [[1, 2]], newEdges: [[1,2]]});
    cb.reset();

    G.addEdgesFrom([[1,2], [2,3]]);
    calledWith(cb, {edges: [[1,2], [2,3]], newEdges: [[2,3]]});
  },

  testAddEdgesIterator: function() {
    var G = new Graph();
    observe(G);

    function* gen() {
      yield tuple2(1,2);
      yield tuple2(2,3);
    }

    var cb = sinon.spy();
    G.on('addEdges', cb);
    G.addEdgesFrom(gen());

    calledWith(cb, {edges: [[1,2], [2,3]], newEdges: [[1,2], [2,3]]});
  },

  testPreventDefaultNodes: function() {
    var G = new Graph();
    observe(G);

    G.addNodesFrom([1,2]);
    G.on('addNodes', event => event.preventDefault(), null, true);
    G.addNodesFrom([3,4]);

    assert.deepEqual(G.nodes(), [1,2]);
  },

  testPreventDefaultEdges: function() {
    var G = new Graph();
    observe(G);

    G.addEdge(1,2);
    G.on('addEdges', event => event.preventDefault(), null, true);
    G.addEdge(2, 3);

    assert.deepEqual(G.edges(), [[1,2]]);
  }
};
