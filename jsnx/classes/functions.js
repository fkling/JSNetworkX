"use strict";

var JSNetworkXError = require('../exceptions/JSNetworkXError');

var fillArray = require('../_internals/fillArray');
var isMap = require('../_internals/isMap');
var isPlainObject = require('../_internals/isPlainObject');
var iteratorToArray = require('../_internals/itertools/toArray');
var sprintf = require('../_internals/sprintf');

/**
 * Return a copy of the graph nodes in a list.
 *
 * @param {Graph} G Graph
 *
 * @return {Array} List of nodes
 * @export
 */
function nodes(G) {
  return G.nodes();
}

/**
 * Return an iterator over the graph nodes.
 *
 * @param {Graph} G Graph
 *
 * @return {goog.iter.Iterator} Iterator over graph nodes
 * @export
 */
function nodes_iter(G) {
  return G.nodes_iter();
}

/**
 * Return a list of edges adjacent to nodes in nbunch.
 *
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 *
 * @return {Array} List of edges
 * @export
 */
function edges(G, opt_nbunch) {
  return G.edges(opt_nbunch);
}

/**
 * Return iterator over  edges adjacent to nodes in nbunch.
 *
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 *
 * @return {Iterator} Iterator over edges
 * @export
 */
function edges_iter(G, opt_nbunch) {
  return G.edges_iter(opt_nbunch);
}

/**
 * Return degree of single node or of nbunch of nodes.
 * If nbunch is omitted, then return degrees of *all* nodes.
 *
 * @param {Graph} G Graph
 * @param {NodeContainer=} opt_nbunch Nodes
 * @param {string=} opt_weight Weight attribute name
 *
 * @return {(number|Map)} Degree of node(s)
 * export
 */
function degree(G, opt_nbunch, opt_weight) {
  return G.degree(opt_nbunch, opt_weight);
}

/**
 * Return a list of nodes connected to node n.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.Node} n Node
 *
 * @return {Array} List of nodes
 * @export
 */
function neighbors(G, n) {
  return G.neighbors(n);
}

/**
 * Return the number of nodes in the graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Number of nodes
 * @export
 */
function number_of_nodes(G) {
  return G.number_of_nodes();
}

/**
 * Return the number of edges in the graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Number of edges
 * @export
 */
function number_of_edges(G) {
  return G.number_of_edges();
}

/**
 * Return the density of a graph.
 * The density for undirected graphs is
 *
 * {@math d = \frac{2m}{n(n-1)}}
 *
 * and for directed graphs is
 *
 * {@math \frac{m}{n(n-1)}}
 *
 * where n is the number of nodes and m is the number of edges in G
 *
 * The density is 0 for an graph without edges and 1.0 for a complete graph.
 * The density of multigraphs can be higher than 1.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Density
 * @export
 */
function density(G) {
  var n = G.number_of_nodes();
  var m = G.number_of_edges();
  var d;

  if(m === 0) { // includes cases n === 0 and n === 1
    d = 0.0;
  }
  else {
    if(G.is_directed()) {
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
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {Array} A list of frequencies of degrees.
 *      The degree values are the index in the list.
 *  @export
 */
function degree_histogram(G) {
  var degseq = iteratorToArray(G.degree().values());
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
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {boolean}  True if graph is directed
 * @export
 */
function is_directed(G) {
  return G.is_directed();
}

/**
 * Modify graph to prevent addition of nodes or edges.
 *
 * This does not prevent modification of edge data.
 * To "unfreeze" a graph you must make a copy.
 *
 * @see #is_frozen
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {jsnx.classes.Graph} A reference to the input graph
 * @export
 */
function freeze(G) {
  function frozen() {
    throw new JSNetworkXError(
      "Frozen graph can't be modified"
    );
  }

  // This double assignment is necessary for the closure compiler
  G.add_node = frozen;
  G.add_nodes_from = frozen;
  G.remove_node = frozen;
  G.remove_nodes_from = frozen;
  G.add_edge = frozen;
  G.add_edges_from = frozen;
  G.remove_edge = frozen;
  G.remove_edges_from = frozen;
  G.clear = frozen;
  G.frozen = true;
  return G;
}

/**
 * Return True if graph is frozen.
 *
 * @see #freeze
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {boolean}  True if graph is frozen.
 * @export
 */
function is_frozen(G) {
  return !!G.frozen;
}

/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * Note:  subgraph(G) calls G.subgraph()
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.NodeContainer} nbunch
 *      A container of nodes that will be iterated through once (thus
 *      it should be an iterator or be iterable).  Each element of the
 *      container should be a valid node type: any hashable type except
 *      None.  If nbunch is None, return all edges data in the graph.
 *      Nodes in nbunch that are not in the graph will be (quietly)
 *      ignored.
 *
 * @return {jsnx.classes.Graph} Subgraph
 * @export
 */
function subgraph(G, nbunch) {
  return G.subgraph(nbunch);
}

/**
 * Return a copy of the graph G with all of the edges removed.
 *
 * Notes: Graph, node, and edge data is not propagated to the new graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {boolean} opt_with_nodes (default=True)
 *      Include nodes.
 *
 * @return {jsnx.classes.Graph} A copy of the graph
 * @export
 */
function create_empty_copy(G, opt_with_nodes=true) {
  var H = new G.constructor();
  if(opt_with_nodes) {
    H.add_nodes_from(G);
  }
  return H;
}

/**
 * Print short summary of information for the graph G or the node n.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.Node=} opt_n A node in the graph G
 *
 * @return {string} Info
 * @export
 */
function info(G, opt_n) {
  var result = '';
  if (opt_n == null) {
    var template =
      'Name: %s\n' +
      'Type: %s\n' +
      'Number of nodes: %s\n' +
      'Number of edges: %s\n';
    var nnodes = G.number_of_nodes();
    result = sprintf(
      template,
      G.name,
      G.constructor.__name__,
      nnodes,
      G.number_of_edges()
    );
    if(nnodes > 0) {
      if(G.is_directed()) {
        var in_degree = 0;
        var out_degree = 0;
        for (var degree of G.in_degree().values()) {
          in_degree += degree;
        }
        for (degree of G.out_degree().values()) {
          out_degree += degree;
        }

        result += sprintf(
          'Average in degree: %s\nAverage out degree: %s',
          (in_degree / nnodes).toFixed(4),
          (out_degree / nnodes).toFixed(4)
        );
      }
      else {
        var sum = 0;
        for (var v of G.degree().values()) {
          sum += v;
        }
        result += sprintf('Average degree: %s', (sum / nnodes).toFixed(4));
      }
    }
  }
  else {
    if(!G.has_node(opt_n)) {
      throw new JSNetworkXError(
        sprintf('Node %j not in graph.', opt_n)
      );
    }
    result = sprintf(
      'Node %j has the following properties:\nDegree: %s\nNeighbors: %s',
      opt_n,
      G.degree(opt_n),
      G.neighbors(opt_n).map(n => JSON.stringify(n)).join(' ')
    );
  }
  return result;
}

/**
 * Set node attributes from dictionary of nodes and values
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 * @param {(Object|Map)} attributes Dictionary of attributes keyed by node
 * @export
 */
function set_node_attributes(G, name, attributes) {
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
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 *
 * @return {!Map} Dictionary of attributes keyed by node.
 * @export
 */
function get_node_attributes(G, name) {
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
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 * @param {Map} attributes
 *    Dictionary of attributes keyed by edge (tuple).
 * @export
 */
function set_edge_attributes(G, name, attributes) {
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
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 *
 * @return {!Map} Dictionary of attributes keyed by edge.
 * @export
 */
function get_edge_attributes(G, name) {
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

module.exports = {
  nodes: nodes,
  nodes_iter: nodes_iter,
  edges: edges,
  edges_iter: edges_iter,
  degree: degree,
  neighbors: neighbors,
  number_of_nodes: number_of_nodes,
  number_of_edges: number_of_edges,
  density: density,
  degree_histogram: degree_histogram,
  is_directed: is_directed,
  freeze: freeze,
  is_frozen: is_frozen,
  subgraph: subgraph,
  create_empty_copy: create_empty_copy,
  info: info,
  set_node_attributes: set_node_attributes,
  get_node_attributes: get_node_attributes,
  set_edge_attributes: set_edge_attributes,
  get_edge_attributes: get_edge_attributes,
};
