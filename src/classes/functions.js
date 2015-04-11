'use strict';

import JSNetworkXError from '../exceptions/JSNetworkXError';

import {
  fillArray,
  isMap,
  isPlainObject,
  sprintf
} from '../_internals';

/**
 * Return a copy of the graph nodes in a list.
 *
 * @param {Graph} G Graph
 * @return {Array} List of nodes
 */
export function nodes(G) {
  return G.nodes();
}

/**
 * Return an iterator over the graph nodes.
 *
 * @param {Graph} G Graph
 * @return {Iterator} Iterator over graph nodes
 */
export function nodesIter(G) {
  return G.nodesIter();
}

/**
 * Return a list of edges adjacent to nodes in nbunch.
 *
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 * @return {Array} List of edges
 */
export function edges(G, optNbunch) {
  return G.edges(optNbunch);
}

/**
 * Return iterator over  edges adjacent to nodes in nbunch.
 *
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 * @return {Iterator} Iterator over edges
 */
export function edgesIter(G, optNbunch) {
  return G.edgesIter(optNbunch);
}

/**
 * Return degree of single node or of nbunch of nodes.
 * If nbunch is omitted, then return degrees of *all* nodes.
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 * @param {string=} opt_weight Weight attribute name
 * @return {(number|Map)} Degree of node(s)
 */
export function degree(G, optNbunch, optWeight) {
  return G.degree(optNbunch, optWeight);
}

/**
 * Return a list of nodes connected to node n.
 *
 * @param {Graph} G Graph
 * @param {Node} n Node
 * @return {Array} List of nodes
 */
export function neighbors(G, n) {
  return G.neighbors(n);
}

/**
 * Return the number of nodes in the graph.
 *
 * @param {Graph} G Graph
 * @return {number} Number of nodes
 */
export function numberOfNodes(G) {
  return G.numberOfNodes();
}

/**
 * Return the number of edges in the graph.
 *
 * @param {Graph} G Graph
 * @return {number} Number of edges
 */
export function numberOfEdges(G) {
  return G.numberOfEdges();
}

/**
 * Return the density of a graph.
 * The density for undirected graphs is
 *
 * ```math
 * d = \frac{2m}{n(n-1)}
 * ```
 *
 * and for directed graphs is
 *
 * ```math
 * \frac{m}{n(n-1)}
 * ```
 *
 * where n is the number of nodes and m is the number of edges in G
 *
 * The density is 0 for an graph without edges and 1.0 for a complete graph.
 * The density of multigraphs can be higher than 1.
 *
 * @param {Graph} G Graph
 * @return {number} Density
 */
export function density(G) {
  var n = G.numberOfNodes();
  var m = G.numberOfEdges();
  var d;

  if(m === 0) { // includes cases n === 0 and n === 1
    d = 0.0;
  }
  else {
    if(G.isDirected()) {
      d = m / (n * (n-1));
    }
    else {
      d = (m * 2) / (n * (n-1));
    }
  }

  return d;
}

/**
 * Return a list of the frequency of each degree value.
 *
 * Note: the bins are width one, hence list.length can be large
 * (Order(number_of_edges))
 *
 *
 * @param {Graph} G Graph
 * @return {Array} A list of frequencies of degrees.
 *      The degree values are the index in the list.
 */
export function degreeHistogram(G) {
  var degseq = Array.from(G.degree().values());
  var dmax = Math.max.apply(Math, degseq) + 1;
  var freq = fillArray(dmax, 0);

  degseq.forEach(function(d) {
    freq[d] += 1;
  });

  return freq;
}

/**
 * Return True if graph is directed.
 *
 * @param {Graph} G Graph
 * @return {boolean}  True if graph is directed
 */
export function isDirected(G) {
  return G.isDirected();
}

/**
 * Modify graph to prevent addition of nodes or edges.
 *
 * This does not prevent modification of edge data.
 * To "unfreeze" a graph you must make a copy.
 *
 * @see #is_frozen
 *
 * @param {Graph} G Graph
 * @return {Graph} A reference to the input graph
 */
export function freeze(G) {
  function frozen() {
    throw new JSNetworkXError(
      "Frozen graph can't be modified"
    );
  }

  // This double assignment is necessary for the closure compiler
  G.addNode = frozen;
  G.addNodesFrom = frozen;
  G.removeNode = frozen;
  G.removeNodesFrom = frozen;
  G.addEdge = frozen;
  G.addEdgesFrom = frozen;
  G.removeEdge = frozen;
  G.removeEdgesFrom = frozen;
  G.clear = frozen;
  G.frozen = true;
  return G;
}

/**
 * Return True if graph is frozen.
 *
 * @see #freeze
 *
 * @param {Graph} G Graph
 * @return {boolean}  True if graph is frozen.
 */
export function isFrozen(G) {
  return !!G.frozen;
}

/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * Note:  subgraph(G) calls G.subgraph()
 *
 * @param {Graph} G Graph
 * @param {NodeContainer} nbunch
 *      A container of nodes that will be iterated through once (thus
 *      it should be an iterator or be iterable).  Each element of the
 *      container should be a valid node type: any hashable type except
 *      None.  If nbunch is None, return all edges data in the graph.
 *      Nodes in nbunch that are not in the graph will be (quietly)
 *      ignored.
 * @return {Graph} Subgraph
 */
export function subgraph(G, nbunch) {
  return G.subgraph(nbunch);
}

/**
 * Return a copy of the graph G with all of the edges removed.
 *
 * Notes: Graph, node, and edge data is not propagated to the new graph.
 *
 * @param {Graph} G Graph
 * @param {boolean} opt_with_nodes (default=True)
 *      Include nodes.
 *
 * @return {Graph} A copy of the graph
 */
export function createEmptyCopy(G, optWithNodes=true) {
  var H = new G.constructor();
  if(optWithNodes) {
    H.addNodesFrom(G);
  }
  return H;
}

/**
 * Print short summary of information for the graph G or the node n.
 *
 * @param {Graph} G Graph
 * @param {Node=} opt_n A node in the graph G
 * @return {string} Info
 */
export function info(G, optN) {
  var result = '';
  if (optN == null) {
    var template =
      'Name: %s\n' +
      'Type: %s\n' +
      'Number of nodes: %s\n' +
      'Number of edges: %s\n';
    var nnodes = G.numberOfNodes();
    result = sprintf(
      template,
      G.name,
      G.constructor.__name__,
      nnodes,
      G.numberOfEdges()
    );
    if(nnodes > 0) {
      if(G.isDirected()) {
        var inDegree = 0;
        var outDegree = 0;
        for (let degree of G.inDegree().values()) {
          inDegree += degree;
        }
        for (let degree of G.outDegree().values()) {
          outDegree += degree;
        }

        result += sprintf(
          'Average in degree: %s\nAverage out degree: %s',
          (inDegree / nnodes).toFixed(4),
          (outDegree / nnodes).toFixed(4)
        );
      }
      else {
        let sum = 0;
        for (let v of G.degree().values()) {
          sum += v;
        }
        result += sprintf('Average degree: %s', (sum / nnodes).toFixed(4));
      }
    }
  }
  else {
    if(!G.hasNode(optN)) {
      throw new JSNetworkXError(
        sprintf('Node %j not in graph.', optN)
      );
    }
    result = sprintf(
      'Node %j has the following properties:\nDegree: %s\nNeighbors: %s',
      optN,
      G.degree(optN),
      G.neighbors(optN).map(n => JSON.stringify(n)).join(' ')
    );
  }
  return result;
}

/**
 * Set node attributes from dictionary of nodes and values
 *
 * @param {Graph} G Graph
 * @param {string} name Attribute name
 * @param {(Object|Map)} attributes Dictionary of attributes keyed by node
 */
export function setNodeAttributes(G, name, attributes) {
  if (isMap(attributes)) {
    attributes.forEach((value, node) => G.node.get(node)[name] = value);
  }
  else if (isPlainObject(attributes)) {
    for (var node in attributes) {
      node = isNaN(node) ? node : +node;
      G.node.get(node)[name] = attributes[node];
    }
  }
  else {
    throw new TypeError('Attributes must be a Map or a plain object');
  }
}

/**
 * Get node attributes from graph
 *
 * @param {Graph} G Graph
 * @param {string} name Attribute name
 * @return {!Map} Dictionary of attributes keyed by node.
 */
export function getNodeAttributes(G, name) {
  var dict = new Map();
  G.node.forEach(function(node, data) {
    if (data.hasOwnProperty(name)) {
      dict.set(node, data[name]);
    }
  });
  return dict;
}

/**
 * Set edge attributes from dictionary of edge tuples and values
 *
 * @param {Graph} G Graph
 * @param {string} name Attribute name
 * @param {Map} attributes
 *    Dictionary of attributes keyed by edge (tuple).
 */
export function setEdgeAttributes(G, name, attributes) {
  attributes.forEach(function(edge, value) {
    G.get(edge[0]).get(edge[1])[name] = value;
  });
}

/**
 * Get edge attributes from graph
 *
 * Since keys can only be strings in JavaScript, the edge is returned as
 * {@code "node1,node2"} string. You'd have to call {@code .split(',')} on
 * the keys to extract the actual node names.
 *
 * @param {Graph} G Graph
 * @param {string} name Attribute name
 * @return {!Map} Dictionary of attributes keyed by edge.
 */
export function getEdgeAttributes(G, name) {
  var dict = new Map();
  G.edges(null, true).forEach(function(edged) {
    if (edged[2].hasOwnProperty(name)) {
      var value = edged[2][name];
      edged.length = 2; // cut of data
      dict.set(edged, value);
    }
  });
  return dict;
}
