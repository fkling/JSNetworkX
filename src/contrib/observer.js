'use strict';

/**
 * A simple event object to any data can be added. It provides four methods:
 *
 * - stopPropagation to indicated that subsequent event handlers should not be
 *   executed.
 * - isPropgationStopped to test the status (internal only)
 * - preventDefault to prevent the default action
 * - isDefaultPrevented to test the status
 */
class Event {

  /**
   * @param {string} type
   * @param {*} target
   */
  constructor(type, target) {
    this.type = type;
    this.target = target;
    this._defaultAction = true;
    this._propagate = true;
  }

  /**
   * When called, should prevent the execution of subsequent handlers.
   */
  stopPropagation() {
    this._propagate = false;
  }

  /**
   * Tests whether the propagation should be stopped.
   * @return {boolean}
   */
  isPropgationStopped() {
    return !this._propagate;
  }

  /**
   * When called, should prevent the default action.
   */
  preventDefault() {
    this._defaultAction = false;
  }

  /**
   * Tests whether the default action should be stopped.
   *
   * @return {boolean}
   */
  isDefaultPrevented() {
    return !this._defaultAction;
  }
}

 /**
  * Makes a graph observable, i.e. external code can bind event handlers to
  * be notified about changes in the graph (adding or removing nodes or edges).
  *
  * @param {Graph} G The graph to make observable
  * @return {Graph} The same graph passed as argument (not a new graph)
  */
export function observe(G) {
  if (typeof G.on === 'function') {
    // graph is already observable, do nothing
    return G;
  }

  var eventHandlers = {
    'addNodes': [],
    'removeNodes': [],
    'addEdges': [],
    'removeEdges': [],
    'clear': []
  };
  var proto = G.constructor.prototype;

  /* eslint-disable no-shadow */
  function triggerHandlers(event, G, funcName, args) {
    /* eslint-enable no-shadow */
    var handlers = eventHandlers[event.type];
    if (!handlers) {
      return;
    }
    // run before handlers
    for (var i = 0, l = handlers.length;
         i < l && !event.isPropgationStopped();
         i += 3
    ) {
      if (handlers[i+2]) {
        handlers[i].call(handlers[i+1] || G, event);
      }
    }

    if (!event.isDefaultPrevented()) {
      if (args) {
        proto[funcName].apply(G, args);
      }
      else {
        proto[funcName].call(G);
      }
      if (!event.isPropgationStopped()) {
        // run after handlers
        for (i = 0, l = handlers.length;
           i < l && !event.isPropgationStopped();
           i += 3
        ) {
          if (!handlers[i+2]) {
            handlers[i].call(handlers[i+1] || G, event);
          }
        }
      }
    }
  }

  G.on = function(event, handler, thisObj, before) {
    if (!eventHandlers[event]) {
      throw new Error('Event "' + event + '" is not supported.');
    }
    eventHandlers[event].push(handler, thisObj, !!before);
  };

  G.off = function(event, handler, thisObj) {
    var handlers;
    var startIndex;
    var i;
    if (arguments.length === 1) {
      // Remove all event handlers
      eventHandlers[event].length = 0;
    }
    else if (arguments.length === 2) {
      // Remove particular handler or object only
      handlers = eventHandlers[event];
      startIndex = handlers.length - 2;
      if (typeof handler !== 'function') {
        startIndex += 1;
      }
      for (i = startIndex; i > 0; i -= 2) {
        if (handlers[i] === handler) {
          handlers.splice(i, 3);
        }
      }
    }
    else {
      // Remove particular handler-object combination
      handlers = eventHandlers[event];
      startIndex = handlers.length - 2;
      for (i = startIndex; i > 0; i -= 2) {
        if (handlers[i] === handler && handlers[i+1] === thisObj) {
          handlers.splice(i, 2);
        }
      }
    }
  };

  G.addNode = function(n) {
    var newNodes = G.hasNode(n) ? [] : [n];
    var event = new Event('addNodes', this);
    event.nodes = [n];
    event.newNodes = newNodes;

    triggerHandlers(event, this, 'addNode', arguments);
  };

  G.addNodesFrom = function(nbunch) {
    var nodes = [];
    var newNodes = [];

    for (var bunch of nbunch) {
      var v = Array.isArray(bunch) ? bunch[0] : bunch;
      nodes.push(Array.isArray(bunch) ? bunch.slice() : bunch);
      if (!G.hasNode(v)) {
        newNodes.push(v);
      }
    }

    var event = new Event('addNodes', this);
    event.nodes = nodes.filter(v => Array.isArray(v) ? v[0] : v);
    event.newNodes = newNodes;

    var args = Array.from(arguments);
    args[0] = nodes;

    triggerHandlers(event, this, 'addNodesFrom', args);
  };

  G.addEdge = function(u, v) {
    var edges = [[u,v]];
    var newEdges = this.hasEdge(u, v) ? [] : edges;

    var event = new Event('addEdges', this);
    event.edges = edges;
    event.newEdges = newEdges;

    triggerHandlers(event, this, 'addEdge', arguments);
  };

   G.addEdgesFrom = function(ebunch) {
    var edges = [];
    var newEdges = [];
    for (var bunch of ebunch) {
      edges.push(bunch.slice());
      if (!this.hasEdge(bunch[0], bunch[1])) {
        newEdges.push(bunch.slice(0,2));
      }
    }

    var event = new Event('addEdges', this);
    event.edges = edges;
    event.newEdges = newEdges;

    var args = Array.from(arguments);
    args[0] = edges;

    triggerHandlers(event, this, 'addEdgesFrom', args);
  };

  G.removeNode = function(n) {
    var event = new Event('removeNodes', this);
    event.nodes = [n];

    triggerHandlers(event, this, 'removeNode', arguments);
  };

  G.removeNodesFrom = function(nbunch) {
    var nodes = [];
    for (var bunch of nbunch) {
      nodes.push(Array.isArray(bunch) ? bunch.slice() : bunch);
    }
    var event = new Event('removeNodes', this);
    event.nodes = nodes;

    var args = Array.from(arguments);
    args[0] = nodes;

    triggerHandlers(event, this, 'removeNodesFrom', args);
  };

  G.removeEdge = function(u, v) {
    var event = new Event('removeEdges', this);
    event.edges = [[u,v]];

    triggerHandlers(event, this, 'removeEdge', arguments);
  };

  G.removeEdgesFrom = function(ebunch) {
    var edges = [];
    for (var bunch of ebunch) {
      edges.push(bunch.slice());
    }
    var event = new Event('removeEdges');
    event.edges = edges;

    var args = Array.from(arguments);
    args[0] = edges;

    triggerHandlers(event, this, 'removeEdgesFrom', args);
  };

  G.clear = function() {
    triggerHandlers(new Event('clear', this), this, 'clear');
  };

  return G;
}

/**
 * Removes the properties added to a graph for event handling.
 *
 * @param {Graph} G
 * @return {Graph} The graph passed to the function
 */
export function unobserve(G) {
  var proto = G.constructor.prototype;

  if (typeof G.on !== 'function') {
    // nothing to do
    return G;
  }

  G.addNode = proto.addNode;
  G.addNodesFrome = proto.addNodesFrom;
  G.addEdge = proto.addEdge;
  G.addEdgesFrome = proto.addEdgesFrom;
  G.removeNode = proto.removeNode;
  G.removeEdge = proto.removeEdge;
  G.removeNodesFrom = proto.removeNodesFrom;
  G.removeEdgesFrom = proto.removeEdgesFrom;
  G.clear = proto.clear;

  delete G.on;
  delete G.off;

  return G;
}

/**
 * Tests whether the graph is observable.
 *
 * @param {Graph} G
 * @return {boolean}
 */
export function isObservable(G) {
  return typeof G.on === 'function' && typeof G.off === 'function';
}
