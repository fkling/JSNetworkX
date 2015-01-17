"use strict";

import KeyError from '../exceptions/KeyError';
/* jshint ignore:start */
import Map from '../_internals/Map';
import Set from '../_internals/Set';
/* jshint ignore:end */
import JSNetworkXError from '../exceptions/JSNetworkXError';

import isBoolean from 'lodash-node/modern/objects/isBoolean';
import isString from 'lodash-node/modern/objects/isString';

import convert from '../convert';
import {
  clear,
  clone,
  deepcopy,
  forEach,
  isPlainObject,
  mapIterator,
  mapSequence,
  toIterator,
  sprintf,
  tuple2,
  tuple2c,
  tuple3,
  tuple3c,
  zipSequence
} from '../_internals';



/*jshint expr:false*/

/*
 * Base class for undirected graphs.
 *
 * A Graph stores nodes and edges with optional data, or attributes.
 *
 * Graphs hold undirected edges.  Self loops are allowed but multiple
 * (parallel) edges are not.
 *
 * Nodes can be arbitrary (hashable) Python objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * See Also
 * --------
 * DiGraph
 * MultiGraph
 * MultiDiGraph
 *
 * @param {*=} opt_data Data to initialize graph.  If data=None (default) an
 *       empty graph is created. The data can be an edge list, or any
 *       NetworkX graph object.
 * @param {Object=} opt_attr (default= no attributes)
 *       Attributes to add to graph as key=value pairs.
 */
export default class Graph {

  constructor(optData, optAttr) {
    // makes it possible to call Graph without new
    if(!(this instanceof Graph)) {
        return new Graph(optData, optAttr);
    }

    this.graph = {}; // dictionary for graph attributes
    this.node = new Map(); // empty node dict (created before convert)
    this.adj = new Map(); // empty adjacency dict

    // attempt to load graph with data
    if (optData != null) {
      convert.toNetworkxGraph(optData, this);
    }

    // load graph attributes (must be after convert)
    if (optAttr) {
      Object.assign(this.graph, optAttr);
    }
    this.edge = this.adj;
  }


  /**
   * Holds the graph type (class) name for information.
   * This is compatible to Pythons __name__ property.
   *
   * @type {string}
   */
  static get __name__() {
    return 'Graph';
  }

  /**
   * Gets or sets the name of the graph.
   *
   * @param {string=} opt_name Graph name.
   *
   * @return {(string|undefined)} Graph name if no parameter was passed.
   * @export
   */
  get name() {
    return this.graph.name || '';
  }

  set name(name) {
    this.graph.name = name;
  }

  // Implements __str__
  /**
   * Return the graph name
   *
   * @return {string} Graph name.
   * @export
   */
  toString() {
    return this.name;
  }



  /* for convenience */
  forEach(callback, optThisValue) {
    for (var n of this.adj.keys()) {
      if (optThisValue) {
        callback.call(optThisValue, n);
      }
      else {
        callback(n);
      }
    }
  }

  // __contains__ is not supported, has_node has to be used


  // __len__ is not supported, number_of_nodes or order has to be used


  // Implements __getitem__
  /**
   * Return a dict of neighbors of node n.
   *
   * @param {Node} n  A node in the graph.
   *
   * @return {!Map} The adjacency dictionary for nodes
   *   connected to n.
   * @export
   */
  get(n) {
    var value = this.adj.get(n);
    if (typeof value === 'undefined') {
      throw new KeyError('Graph does not contain node ' + n + '.');
    }
    return value;
  }


  /**
   * Add a single node n and update node attributes.
   *
   * Since JavaScript does not provide keyword arguments,
   * all attributes must be passed in an object as second
   * argument.
   *
   * @param {!Node} n A node.
   * @param {Object=} opt_attr_dict Dictionary of node attributes.
   *      Key/value pairs will update existing data associated with the node.
   * @export
   */
  addNode(n, optAttrDict={}) {
    if (!isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    if (!this.node.has(n)) {
      this.adj.set(n, new Map());
      this.node.set(n, optAttrDict);
    }
    else { // update attr even if node already exists
      Object.assign(this.node.get(n), optAttrDict);
    }
  }


  /**
   * Add multiple nodes.
   *
   * Since JavaScript does not provide keyword arguments,
   * all attributes must be passed in an object as second
   * argument.
   *
   * @param {!NodeContainer} nodes
   *       A container of nodes (Array, Object, Array-like).
   *       OR
   *       A container of (node, attribute dict) tuples.
   *
   * @param {Object=} opt_attr  Update attributes for all nodes in nodes.
   *       Node attributes specified in nodes as a tuple
   *       take precedence over attributes specified generally.
   * @export
   */
  addNodesFrom(nodes, optAttr={}) {
    forEach(nodes, function(node) {
      if (Array.isArray(node) && node.length === 2 && isPlainObject(node[1])) {
        var [nn, ndict] = node;

        if (!this.adj.has(nn)) {
          this.adj.set(nn, new Map());
          var newdict = clone(optAttr);
          this.node.set(nn, Object.assign(newdict, ndict));
        }
        else {
          var olddict = this.node.get(nn);
          Object.assign(olddict, optAttr, ndict);
        }
        return; // continue next iteration
      }
      var newnode = !this.node.has(node);
      if (newnode) {
        this.adj.set(node, new Map());
        this.node.set(node, clone(optAttr));
      }
      else {
        Object.assign(this.node.get(node), optAttr);
      }
    }, this);
  }


  /**
   * Remove node n.
   *
   * Removes the node n and all adjacent edges.
   * Attempting to remove a non-existent node will raise an exception.
   *
   * @param {Node} n A node in the graph.
   * @export
   */
  removeNode(n) {
    var adj = this.adj;

    if (this.node.delete(n)) {
      adj.get(n).forEach(
        (_, u) => adj.get(u).delete(n) // remove all edges n-u in graph
      );
      adj.delete(n); // now remove node
    }
    else {
      throw new JSNetworkXError('The node %s is not in the graph', n);
    }
  }


  /**
   * Remove multiple nodes.
   *
   * @param {NodeContainer} nodes A container of nodes
   *      If a node in the container is not in the graph it is silently ignored.
   *
   * @export
   */
  removeNodesFrom(nodes) {
    var adj = this.adj;
    var node = this.node;

    forEach(nodes, function(n) {
      if (node.delete(n)) {
        adj.get(n).forEach((_, u) => adj.get(u).delete(n));
        adj.delete(n);
      }
    });
  }


  /**
   * Return an iterator over the nodes.
   *
   * @param {boolean=} opt_data (default false) If false the iterator returns
   *   nodes. If true return a two-tuple of node and node data dictionary.
   *
   * @return {Iterator} of nodes If data=true the iterator gives
   *           two-tuples containing (node, node data, dictionary).
   * @export
   */
  nodesIter(optData) {
    if (optData) {
      return toIterator(this.node);
    }
    return this.node.keys();
  }


  /**
   * Return a list of the nodes in the graph.
   *
   * @param {boolean=} opt_data (default false) If false the iterator returns
   *   nodes. If true return a two-tuple of node and node data dictionary.
   *
   * @return {!Array} of nodes If data=true a list of two-tuples containing
   *           (node, node data dictionary).
   * @export
   */
  nodes(optData) {
    return Array.from(optData ? this.node.entries() : this.node.keys());
  }


  /**
   * Return the number of nodes in the graph.
   *
   * @return {number} The number of nodes in the graph.
   * @export
   */
  numberOfNodes() {
    return this.node.size;
  }


  /**
   * Return the number of nodes in the graph.
   *
   * @return {number} The number of nodes in the graph.
   * @export
   */
  order() {
    return this.node.size;
  }


  /**
   * Return true if the graph contains the node n.
   *
   * @param {!(Node|NodeContainer)} n node.
   *
   * @return {boolean}
   * @export
   */
  hasNode(n) {
    return this.node.has(n);
  }


  /**
   * Add an edge between u and v.
   *
   * The nodes u and v will be automatically added if they are
   * not already in the graph.
   *
   * Edge attributes can be specified by providing
   * a dictionary with key/value pairs.
   *
   * Unlike in Python, attributes can only be defined
   * via the dictionary.
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   * @param {?Object=} opt_attr_dict Dictionary of edge attributes.
   *      Key/value pairs will update existing data associated with the edge.
   *
   * @export
   */
  addEdge(u, v, optAttrDict) {
    if (optAttrDict && !isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    // add nodes
    if (!this.node.has(u)) {
      this.adj.set(u, new Map());
      this.node.set(u, {});
    }
    if (!this.node.has(v)) {
      this.adj.set(v, new Map());
      this.node.set(v, {});
    }

    // add the edge
    var datadict = this.adj.get(u).get(v) || {};
    Object.assign(datadict, optAttrDict);
    this.adj.get(u).set(v, datadict);
    this.adj.get(v).set(u, datadict);
  }


  /**
   * Add all the edges in ebunch.
   *
   * Adding the same edge twice has no effect but any edge data
   * will be updated when each duplicate edge is added.
   *
   * Edge attributes specified in edges as a tuple take precedence
   * over attributes specified generally.
   *
   * @param {Iterable} ebunch container of edges
   *      Each edge given in the container will be added to the
   *      graph. The edges must be given as as 2-tuples (u,v) or
   *      3-tuples (u,v,d) where d is a dictionary containing edge
   *      data.
   *
   * @param {Object=} opt_attr_dict
   *     Dictionary of edge attributes.  Key/value pairs will
   *     update existing data associated with each edge.
   * @export
   */
  addEdgesFrom(ebunch, optAttrDict) {
    if (optAttrDict && !isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    // process ebunch
    forEach(ebunch, function(tuple) {
      var [u, v, data] = tuple;
      if (!isPlainObject(data)) {
        data = {};
      }
      if (u == null || v == null || tuple[3] != null) {
        throw new JSNetworkXError(sprintf(
          'Edge tuple %j must be a 2-tuple or 3-tuple.',
          tuple
        ));
      }

      if (!this.node.has(u)) {
        this.adj.set(u, new Map());
        this.node.set(u, {});
      }
      if (!this.node.has(v)) {
        this.adj.set(v, new Map());
        this.node.set(v, {});
      }

      // add the edge
      var datadict = this.adj.get(u).get(v) || {};
      Object.assign(datadict, optAttrDict, data);
      this.adj.get(u).set(v, datadict);
      this.adj.get(v).set(u, datadict);
    }, this);
  }


  /**
   * Add all the edges in ebunch as weighted edges with specified weights.
   *
   *
   * Adding the same edge twice for Graph/DiGraph simply updates
   * the edge data.  For MultiGraph/MultiDiGraph, duplicate edges
   * are stored.
   *
   * Since JavaScript does not support keyword arguments, all attributes
   * must be passed in the attr object.
   *
   * @param {?} ebunch  container of edges
   *      Each edge given in the list or container will be added
   *      to the graph. The edges must be given as 3-tuples (u,v,w)
   *      where w is a number.
   *
   * @param {string=} opt_weight (default 'weight')
   *      The attribute name for the edge weights to be added.
   *
   * @param {Object=} opt_attr Edge attributes to add/update for all edges.
   *
   * @export
   */
  addWeightedEdgesFrom(ebunch, optWeight, optAttr) {
    optAttr = optAttr || {};
    if (!isString(optWeight)) {
      optAttr = optWeight;
      optWeight = 'weight';
    }

    this.addEdgesFrom(mapSequence(ebunch, function(e) {
      var attr = {};
      attr[optWeight] = e[2];
      if (attr[optWeight] == null) { // simulate too few value to unpack error
        throw new TypeError('Values must consist of three elements: %s.', e);
      }
      return [e[0], e[1], attr];
    }), optAttr);
  }


  /**
   * Remove the edge between u and v.
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   *
   * @export
   */
  removeEdge(u, v) {
    var node = this.adj.get(u);
    if (node != null) {
      node.delete(v);
      // self-loop needs only one entry removed
      var vnode = this.adj.get(v);
      if (vnode !== node) {
        vnode.delete(u);
      }
    }
    else {
      throw new JSNetworkXError('The edge %s-%s is not in the graph', u, v);
    }
  }


  /**
   * Remove all edges specified in ebunch.
   *
   * Notes: Will fail silently if an edge in ebunch is not in the graph.
   *
   * @param {?} ebunch 1list or container of edge tuples
   *      Each edge given in the list or container will be removed
   *      from the graph. The edges can be:
   *          - 2-tuples (u,v) edge between u and v.
   *          - 3-tuples (u,v,k) where k is ignored.
   * @export
   */
  removeEdgesFrom(ebunch) {
    var adj = this.adj;
    forEach(ebunch, function([u, v]) {
      var unode = adj.get(u);
      if (unode != null && unode.has(v)) {
        unode.delete(v);
        var vnode = adj.get(v);
        if (vnode !== unode) {
          vnode.delete(u);
        }
      }
    });
  }


  /**
   * Return True if the edge (u,v) is in the graph.
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   *
   * @return {boolean} True if edge is in the graph, False otherwise.
   * @export
   */
  hasEdge(u, v) {
    var unode = this.adj.get(u);
    return unode && unode.has(v);
  }


  /**
   * Return a list of the nodes connected to the node n.
   *
   * @param {!Node} n A node in the graph.
   *
   * @return {!Array} A list of nodes that are adjacent to n.
   * @export
   */
  neighbors(n) {
    return Array.from(this.neighborsIter(n));
  }


  /**
   * Return an iterator over all neighbors of node n.
   *
   * @param {!Node} n A node in the graph.
   *
   * @return {!Iterator} A list of nodes that are adjacent to n.
   * @export
   */
  neighborsIter(n) {
    var node = this.adj.get(n);
    if (node != null) {
      return node.keys();
    }
    else {
      throw new JSNetworkXError('The node %s is not in the graph.', n);
    }
  }


  /**
   * Return a list of edges.
   *
   * Edges are returned as tuples with optional data
   * in the order (node, neighbor, data).
   *
   * Note: Nodes in nbunch that are not in the graph will be (quietly) ignored.
   * For directed graphs this returns the out-edges.
   *
   * @param {?NodeContainer=} opt_nbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} opt_data Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   *
   * @return {!Array} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   * @export
   */
  edges(optNbunch, optData) {
    return Array.from(this.edgesIter(optNbunch, optData));
  }


  /**
   * Return an iterator over the edges.
   *
   * Edges are returned as tuples with optional data
   * in the order (node, neighbor, data).
   *
   * Note: Nodes in nbunch that are not in the graph will be (quietly) ignored.
   * For directed graphs this returns the out-edges.
   *
   * @param {?(NodeContainer|boolean)=} opt_nbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} opt_data Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   *
   * @return {!Iterator} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   * @export
   */
  *edgesIter(optNbunch, optData) {

    // handle calls with data being the only argument
    if (isBoolean(optNbunch)) {
      optData = optNbunch;
      optNbunch = null;
    }

    // helper dict to keep track of multiply stored edges
    var seen = new Set();
    var nodesNbrs;

    if (optNbunch == null) {
      nodesNbrs = this.adj.entries();
    }
    else {
      var adj = this.adj;
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, adj.get(n))
      );
    }

    for (var nodeData of nodesNbrs) {
      var node = nodeData[0];

      for (var neighborsData of nodeData[1].entries()) {
        if (!seen.has(neighborsData[0])) {
          if (optData) {
            neighborsData.unshift(node);
            yield neighborsData;
          }
          else {
            yield [node, neighborsData[0]];
          }
        }
      }
      seen.add(node);
      nodeData.length = 0;
    }
  }


  /**
   * Return the attribute dictionary associated with edge (u,v).
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   * @param {T=} opt_default (default=null)
   *      Value to return if the edge (u,v) is not found.
   *
   * @return {(Object|T)} The edge attribute dictionary.
   * @template T
   *
   * @export
   */
  getEdgeData(u, v, optDefault) {
    var nbrs = this.adj.get(u);
    if (nbrs != null) {
      var data = nbrs.get(v);
      if (data != null) {
        return data;
      }
    }
    return optDefault;
  }


  /**
   * Return an adjacency list representation of the graph.
   *
   * The output adjacency list is in the order of G.nodes().
   * For directed graphs, only outgoing adjacencies are included.
   *
   * @return {!Array.<Array>} The adjacency structure of the graph as a
   *      list of lists.
   * @export
   */
  adjacencyList() {
    return Array.from(mapIterator(
      this.adjacencyIter(),
      ([_, adj]) => Array.from(adj.keys())
    ));
  }


  /**
   * Return an iterator of (node, adjacency dict) tuples for all nodes.
   *
   *
   * @return {!Iterator} An array of (node, adjacency dictionary)
   *      for all nodes in the graph.
   * @export
   */
  adjacencyIter() {
    return this.adj.entries();
  }


  /**
   * Return the degree of a node or nodes.
   *
   * The node degree is the number of edges adjacent to that node.
   *
   * WARNING: Since both parameters are optional, and the weight attribute
   * name could be equal to a node name, nbunch as to be set to null explicitly
   * to use the second argument as weight attribute name.
   *
   * @param {(Node|NodeContainer)=} opt_nbunch (default=all nodes)
   *      A container of nodes.  The container will be iterated
   *      through once.
   *
   * @param {string=} opt_weight (default=None)
   *      The edge attribute that holds the numerical value used
   *      as a weight.  If null or not defined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
   *
   * @return {!(number|Map)} A dictionary with nodes as keys and
   * degree as values or a number if a single node is specified.
   * @export
   */
  degree(optNbunch, optWeight) {
    if (optNbunch != null && this.hasNode(optNbunch)) {
      // return a single node
      return this.degreeIter(optNbunch,optWeight).next().value[1];
    }
    else {
      return new Map(this.degreeIter(optNbunch, optWeight));
    }
  }


  /**
   * Return an array for (node, degree).
   *
   *
   * @param {(Node|NodeContainer)=} opt_nbunch (default=all nodes)
   *       A container of nodes.  The container will be iterated
   *       through once.
   * @param {string=} opt_weight (default=None)
   *      The edge attribute that holds the numerical value used
   *      as a weight.  If null or not defined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
   *
   * WARNING: Since both parameters are optional, and the weight attribute
   * name could be equal to a node name, nbunch as to be set to null explicitly
   * to use the second argument as weight attribute name.
   *
   * @return {!Iterator} of two-tuples of (node, degree).
   *
   * @export
   */
  degreeIter(optNbunch, optWeight) {
    var nodesNbrs;
    var iterator;

    if (optNbunch == null) {
      nodesNbrs = this.adj.entries();
    }
    else {
      var adj = this.adj;
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, adj.get(n))
      );
    }

    if (!optWeight) {
      iterator = mapIterator(nodesNbrs, function([node, nbrs]) {
        return [node, nbrs.size + (+nbrs.has(node))];
      });
    }
    else {
      iterator = mapIterator(
        nodesNbrs,
        function([n, nbrs]) {
          var sum = 0;

          nbrs.forEach(function(data) {
            var weight = data[optWeight];
            sum += +(weight != null ? weight : 1);
          });

          if (nbrs.has(n)) {
            var weight = nbrs.get(n)[optWeight];
            sum += +(weight != null ? weight : 1);
          }

          return [n, sum];
        }
      );
    }

    return iterator;
  }


  /**
   * Remove all nodes and edges from the graph.
   *
   * This also removes the name, and all graph, node, and edge attributes.
   *
   * @export
   */
  clear() {
    this.name = '';
    this.adj.clear();
    this.node.clear();
    clear(this.graph);
  }


  /**
   * Return a copy of the graph.
   *
   * This makes a complete copy of the graph including all of the
   * node or edge attributes.
   *
   * @return {!Graph}
   * @export
   */
  copy() {
    return deepcopy(this);
  }


  /**
   * Return True if graph is a multigraph, False otherwise.
   *
   * @return {boolean} True if graph is a multigraph, False otherwise.
   * @export
   */
  isMultigraph() {
    return false;
  }


  /**
   * Return True if graph is directed, False otherwise.
   *
   * @return {boolean}  True if graph is directed, False otherwise.
   * @export
   */
  isDirected() {
    return false;
  }


  /**
   * Return a directed representation of the graph.
   *
   * This returns a "deepcopy" of the edge, node, and
   * graph attributes which attempts to completely copy
   * all of the data and references.
   *
   * This is in contrast to the similar D=DiGraph(G) which returns a
   * shallow copy of the data.
   *
   * @return {!DiGraph}
   * @export
   */
  toDirected() {
    var G = new require('./DiGraph')();
    G.name = this.name;
    G.addNodesFrom(this);
    G.addEdgesFrom((function*() {
      for (var nd of this.adjacencyIter()) {
        var u = nd[0];
        for (var nbr of nd[1]) {
          yield tuple3(u, nbr[0], deepcopy(nbr[1]));
        }
      }
    }.call(this)));
    G.graph = deepcopy(this.graph);
    G.node = deepcopy(this.node);

    return G;
  }


  /**
   * Return an undirected copy of the graph.
   *
   * This returns a "deepcopy" of the edge, node, and
   * graph attributes which attempts to completely copy
   * all of the data and references.
   *
   * This is in contrast to the similar G=DiGraph(D) which returns a
   * shallow copy of the data.
   *
   * @return {!Graph}
   * @export
   */
  toUndirected() {
    return deepcopy(this);
  }


  /**
   * Return the subgraph induced on nodes in nbunch.
   *
   * The induced subgraph of the graph contains the nodes in nbunch
   * and the edges between those nodes.
   *
   * The graph, edge or node attributes just point to the original graph.
   * So changes to the node or edge structure will not be reflected in
   * the original graph while changes to the attributes will.
   *
   * To create a subgraph with its own copy of the edge/node attributes use:
   * `jsnx.Graph(G.subgraph(nbunch))`.
   *
   * If edge attributes are containers, a deep copy can be obtained using:
   * `G.subgraph(nbunch).copy()`
   *
   * For an inplace reduction of a graph to a subgraph you can remove nodes:
   *
   * ```
   * G.removeNodesFrom(G.nodes().filter(function(n) {
   *      return nbunch.indexOf(n) > -1;
   * }))
   * ```
   *
   * @param {NodeContainer} nbunch
   *      A container of nodes which will be iterated through once.
   *
   * @return {Graph}
   * @export
   */
  subgraph(nbunch) {
    var bunch = this.nbunchIter(nbunch);
    var n;

    // create new graph and copy subgraph into it
    var H = new this.constructor();
    // copy node and attribute dictionaries
    for (n of bunch) {
      H.node.set(n, this.node.get(n));
    }
    // namespace shortcuts for speed
    var HAdj = H.adj;
    var thisAdj = this.adj;

    // add nodes and edges (undirected method)
    for (n of H) {
      var Hnbrs = new Map();
      HAdj.set(n, Hnbrs);

      for (var nbrdata of thisAdj.get(n)) {
        var nbr = nbrdata[0];
        var data = nbrdata[1];
        if (HAdj.has(nbr)) {
          // add both representations of edge: n-nbr and nbr-n
          Hnbrs.set(nbr, data);
          HAdj.get(nbr).set(n, data);
        }
      }
    }
    H.graph = this.graph;

    return H;
  }

  /**
   * Return a list of nodes with self loops.
   *
   * A node with a self loop has an edge with both ends adjacent
   * to that node.
   *
   * @return {Array.<string>} A list of nodes with self loops.
   * @export
   */
  nodesWithSelfloops() {
    var nodes = [];
    for (var nd of this.adj.entries()) {
      if (nd[1].has(nd[0])) {
        nodes.push(nd[0]);
      }
    }
    return nodes;
  }


  /**
   * Return a list of selfloop edges.
   *
   * A selfloop edge has the same node at both ends.
   *
   * @param {boolean=} opt_data (default=False)
   *      Return selfloop edges as two tuples (u,v) (data=False)
   *      or three-tuples (u,v,data) (data=True).
   *
   * @return {Array}  A list of all selfloop edges.
   * @export
   */
  selfloopEdges(optData) {
    var edges = [];

    for (var nd of this.adj.entries()) {
      var [node, nbrs] = nd;
      if (nbrs.has(node)) {
        if (optData) {
          edges.push(tuple3c(node, node, nbrs.get(node), nd));
        }
        else {
          edges.push(tuple2c(node, node, nd));
        }
      }
    }

    return edges;
  }


  /**
   * Return the number of selfloop edges.
   *
   * A selfloop edge has the same node at both ends.
   *
   * @return {number} The number of selfloops.
   * @export
   */
  numberOfSelfloops() {
    return this.selfloopEdges().length;
  }


  /**
   * Return the number of edges.
   *
   * @param {string=} opt_weight The edge attribute that holds the numerical
   *      value used as a weight.  If not defined, then each edge has weight 1.
   *
   * @return {number} The number of edges or sum of edge weights in the graph.
   * @export
   */
  size(optWeight) {
    var s = 0;
    for (var v of this.degree(null, optWeight).values()) {
      s += v;
    }
    s = s / 2;

    if (optWeight == null) {
      return Math.floor(s); // int(s)
    }
    else {
      return s; // no need to cast to float
    }
  }


  /**
   * Return the number of edges between two nodes.
   *
   * @param {!Node=} u node.
   * @param {!Node=} v node
   *       If u and v are specified, return the number of edges between
   *       u and v. Otherwise return the total number of all edges.
   *
   * @return {number} The number of edges in the graph.
   *      If nodes u and v are specified return the number of edges between
   *      those nodes.
   * @export
   */
  numberOfEdges(u, v) {
    if (u == null) {
      return Math.floor(this.size());
    }
    if (this.adj.get(u).has(v)) {
      return 1;
    }
    else {
      return 0;
    }
  }


  /**
   * Add a star.
   *
   * The first node in nodes is the middle of the star.  It is connected
   * to all other nodes.
   *
   * @param {NodeContainer} nodes A container of nodes.
   * @param {Object=} opt_attr  Attributes to add to every edge in star.
   * @export
   */
  addStar(nodes, optAttr) {
    var niter = toIterator(nodes);
    var v = niter.next().value;
    var edges = mapIterator(niter, n => tuple2(v, n));
    this.addEdgesFrom(edges, optAttr);
  }


  /**
   * Add a path.
   *
   * @param {NodeContainer} nodes A container of nodes.
   *      A path will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} opt_attr Attributes to add to every edge in path.
   * @export
   */
  addPath(nodes, optAttr) {
    var nlist = Array.from(nodes);
    var edges = zipSequence(
      nlist.slice(0, nlist.length - 1),
      nlist.slice(1)
    );
    this.addEdgesFrom(edges, optAttr);
  }


  /**
   * Add a cycle.
   *
   * @param {NodeContainer} nodes A container of nodes.
   *      A cycle will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} opt_attr  Attributes to add to every edge in cycle.
   * @export
   */
  addCycle(nodes, optAttr) {
    var nlist = Array.from(nodes);
    var edges = zipSequence(
      nlist,
      nlist.slice(1).concat([nlist[0]])
    );
    this.addEdgesFrom(edges, optAttr);
  }


  /**
   * Return an iterator of nodes contained in nbunch that are
   * also in the graph.
   *
   * The nodes in nbunch are checked for membership in the graph
   * and if not are silently ignored.
   *
   * Notes
   * -----
   * When nbunch is an iterator, the returned iterator yields values
   * directly from nbunch, becoming exhausted when nbunch is exhausted.
   *
   * To test whether nbunch is a single node, one can use
   * "if(this.has_node(nbunch)", even after processing with this routine.
   *
   * If nbunch is not a node or a (possibly empty) sequence/iterator
   * or not defined, an Error is raised.
   *
   * @param {(Node|NodeContainer)=} opt_nbunch (default=all nodes)
   *      A container of nodes.  The container will be iterated
   *      through once.
   *
   * @return {!Iterator} An iterator over nodes in nbunch
   *      that are also in the graph.
   *      If nbunch is null or not defined, iterate over all nodes in the graph.
   * @export
   */
  *nbunchIter(optNbunch) {
    if (optNbunch == null) { // include all nodes
      /*jshint expr:true*/
      yield* this.adj.keys();
    }
    else if (this.hasNode(optNbunch)) { // if nbunch is a single node
      yield optNbunch;
    }
    else { // if nbunch is a sequence of nodes
      var adj = this.adj;

      try {
        for (var n of toIterator(optNbunch)) {
          if (adj.has(n)) {
            yield n;
          }
        }
      }
      catch(ex) {
        if (ex instanceof TypeError) {
          throw new JSNetworkXError(
            'nbunch is not a node or a sequence of nodes'
          );
        }
      }
    }
  }

  [Symbol.iterator]() {
    return this.node.keys();
  }
}
