"use strict";

var KeyError = require('../exceptions/KeyError');
/* jshint ignore:start */
var Map = require('../_internals/Map');
var Set = require('../_internals/Set');
/* jshint ignore:end */
var JSNetworkXError = require('../exceptions/JSNetworkXError');

var assign = require('../_internals/assign');
var clear = require('../_internals/clear');
var clone = require('lodash-node/modern/objects/clone');
var convert = require('../convert');
var deepcopy = require('../_internals/deepcopy');
var forEach = require('../_internals/forEach');
var isArray = require('lodash-node/modern/objects/isArray');
var isBoolean = require('lodash-node/modern/objects/isBoolean');
var isPlainObject = require('../_internals/isPlainObject');
var isString = require('lodash-node/modern/objects/isString');
var iteratorSymbol = require('../_internals/iteratorSymbol');
var iteratorToArray = require('../_internals/itertools/toArray');
var mapIterator = require('../_internals/itertools/mapIterator');
var mapSequence = require('../_internals/mapSequence');
var toIterator = require('../_internals/itertools/toIterator');
var toArray = require('../_internals/itertools/toArray');
var size = require('../_internals/size');
var {tuple2, tuple2c, tuple3, tuple3c} = require('../_internals/tuple');
var zipSequence = require('../_internals/zipSequence');



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
class Graph {

  constructor(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof Graph)) {
        return new Graph(opt_data, opt_attr);
    }

    this.graph = {}; // dictionary for graph attributes
    this.node = new Map(); // empty node dict (created before convert)
    this.adj = new Map(); // empty adjacency dict

    // attempt to load graph with data
    if (opt_data != null) {
        var result = convert.to_networkx_graph(opt_data, this);
    }

    // load graph attributes (must be after convert)
    if (opt_attr) {
      assign(this.graph, opt_attr);
    }
    this.edge = this.adj;
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
  forEach(callback, opt_this_value) {
    for (var n of this.adj.keys()) {
      if (opt_this_value) {
        callback.call(opt_this_value, n);
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
   * @param {jsnx.Node} n  A node in the graph.
   *
   * @return {!jsnx.contrib.Map} The adjacency dictionary for nodes connected to n.
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
   * @param {!jsnx.Node} n A node.
   * @param {Object=} opt_attr_dict Dictionary of node attributes.
   *      Key/value pairs will update existing data associated with the node.
   * @export
   */
  add_node(n, opt_attr_dict={}) {
    if (!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    if (!this.adj.has(n)) {
      this.adj.set(n, new Map());
      this.node.set(n, opt_attr_dict);
    }
    else { // update attr even if node already exists
      assign(this.node.get(n), opt_attr_dict);
    }
  }


  /**
   * Add multiple nodes.
   *
   * Since JavaScript does not provide keyword arguments,
   * all attributes must be passed in an object as second
   * argument.
   *
   * @param {!jsnx.NodeContainer} nodes
   *       A container of nodes (Array, Object, Array-like).
   *       OR
   *       A container of (node, attribute dict) tuples.
   *
   * @param {Object=} opt_attr  Update attributes for all nodes in nodes.
   *       Node attributes specified in nodes as a tuple
   *       take precedence over attributes specified generally.
   * @export
   */
  add_nodes_from(nodes, opt_attr={}) {
    forEach(nodes, function(node) {
      if (isArray(node) && node.length === 2 && isPlainObject(node[1])) {
        var [nn, ndict] = node;

        if (!this.adj.has(nn)) {
          this.adj.set(nn, new Map());
          var newdict = clone(opt_attr);
          this.node.set(nn, assign(newdict, ndict));
        }
        else {
          var olddict = this.node.get(nn);
          assign(olddict, opt_attr, ndict);
        }
        return; // continue next iteration
      }
      var newnode = !this.adj.has(node);
      if (newnode) {
        this.adj.set(node, new Map());
        this.node.set(node, clone(opt_attr));
      }
      else {
        assign(this.node.get(node), opt_attr);
      }
    }, this);
  }


  /**
   * Remove node n.
   *
   * Removes the node n and all adjacent edges.
   * Attempting to remove a non-existent node will raise an exception.
   *
   * @param {jsnx.Node} n A node in the graph.
   * @export
   */
  remove_node(n) {
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
   * @param {jsnx.NodeContainer} nodes A container of nodes 
   *      If a node in the container is not in the graph it is silently ignored.
   *
   * @export
   */
  remove_nodes_from(nodes) {
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
   * @param {boolean=} opt_data (default false) If false the iterator returns nodes.
   *      If true return a two-tuple of node and node data dictionary.
   *
   * @return {Iterator} of nodes If data=true the iterator gives
   *           two-tuples containing (node, node data, dictionary).
   * @export
   */
  nodes_iter(opt_data) {
    if (opt_data) {
      return toIterator(this.node);
    }
    return this.adj.keys();
  }


  /**
   * Return a list of the nodes in the graph.
   *
   * @param {boolean=} opt_data (default false) If false the iterator returns nodes.
   *      If true return a two-tuple of node and node data dictionary.
   *
   * @return {!Array} of nodes If data=true a list of two-tuples containing
   *           (node, node data dictionary).
   * @export
   */
  nodes(opt_data) {
    return iteratorToArray(opt_data ? this.node.entries() : this.node.keys());
  }


  /**
   * Return the number of nodes in the graph.
   *
   * @return {number} The number of nodes in the graph.
   * @export
   */
  number_of_nodes() {
    return this.adj.size;
  }


  /**
   * Return the number of nodes in the graph.
   *
   * @return {number} The number of nodes in the graph.
   * @export
   */
  order() {
    return this.adj.size;
  }


  /**
   * Return true if the graph contains the node n.
   *
   * @param {!(jsnx.Node|jsnx.NodeContainer)} n node.
   *
   * @return {boolean}
   * @export
   */
  has_node(n) {
    return this.adj.has(n);
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
   * @param {jsnx.Node} u Node.
   * @param {jsnx.Node} v Node.
   * @param {?Object=} opt_attr_dict Dictionary of edge attributes.
   *      Key/value pairs will update existing data associated with the edge.
   *
   * @export
   */
  add_edge(u, v, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    if (!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    // add nodes
    if (!this.adj.has(u)) {
      this.adj.set(u, new Map());
      this.node.set(u, {});
    }
    if (!this.adj.has(v)) {
      this.adj.set(v, new Map());
      this.node.set(v, {});
    }

    // add the edge
    var datadict = this.adj.get(u).get(v) || {};
    assign(datadict, opt_attr_dict);
    this.adj.get(u).set(v, datadict);
    this.adj.get(v).set(u, datadict);
  }


  /**
   * Add all the edges in ebunch.
   *
   * Adding the same edge twice has no effect but any edge data
   * will be updated when each duplicate edge is added.
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
  add_edges_from(ebunch, opt_attr_dict={}) {
    if (!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    // process ebunch
    forEach(ebunch, function(tuple) {
      var [u, v, data] = tuple;
      if (!isPlainObject(data)) {
        data = {};
      }
      if (v == null || tuple[3] != null) {
        throw new JSNetworkXError(
          'Edge tuple %s must be a 2-tuple or 3-tuple.',
          tuple
        );
      }

      if (!this.adj.has(u)) {
        this.adj.set(u, new Map());
        this.node.set(u, {});
      }
      if (!this.adj.has(v)) {
        this.adj.set(v, new Map());
        this.node.set(v, {});
      }

      // add the edge
      var datadict = this.adj.get(u).get(v) || {};
      assign(datadict, opt_attr_dict, data);
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
  add_weighted_edges_from(ebunch, opt_weight, opt_attr) {
    opt_attr = opt_attr || {};
    if (!isString(opt_weight)) {
      opt_attr = opt_weight;
      opt_weight = 'weight';
    }

    this.add_edges_from(mapSequence(ebunch, function(e) {
      var attr = {};
      attr[opt_weight] = e[2];
      if (attr[opt_weight] == null) { // simulate too few value to unpack error
        throw new TypeError('Values must consist of three elements: %s.', e);
      }
      return [e[0], e[1], attr];
    }), opt_attr);
  }


  /**
   * Remove the edge between u and v.
   *
   * @param {jsnx.Node} u Node.
   * @param {jsnx.Node} v Node.
   *
   * @export
   */
  remove_edge(u, v) {
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
  remove_edges_from(ebunch) {
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
   * @param {jsnx.Node} u Node.
   * @param {jsnx.Node} v Node.
   *
   * @return {boolean} True if edge is in the graph, False otherwise.
   * @export
   */
  has_edge(u, v) {
    var unode = this.adj.get(u);
    return unode && unode.has(v);
  }


  /**
   * Return a list of the nodes connected to the node n.
   *
   * @param {!jsnx.Node} n A node in the graph.
   *
   * @return {!Array} A list of nodes that are adjacent to n.
   * @export
   */
  neighbors(n) {
    return iteratorToArray(this.neighbors_iter(n));
  }


  /**
   * Return an iterator over all neighbors of node n.
   *
   * @param {!jsnx.Node} n A node in the graph.
   *
   * @return {!Iterator} A list of nodes that are adjacent to n.
   * @export
   */
  neighbors_iter(n) {
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
   *
   * @param {?jsnx.NodeContainer=} opt_nbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} opt_data Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   *
   * @return {!Array} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   * @export
   */
  edges(opt_nbunch, opt_data) {
    return iteratorToArray(this.edges_iter(opt_nbunch, opt_data));
  }


  /**
   * Return an iterator over the edges.
   *
   * Edges are returned as tuples with optional data
   * in the order (node, neighbor, data).
   *
   * Note: Nodes in nbunch that are not in the graph will be (quietly) ignored.
   *
   * @param {?(jsnx.NodeContainer|boolean)=} opt_nbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} opt_data Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   *
   * @return {!Iterator} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   * @export
   */
  *edges_iter(opt_nbunch, opt_data) {

    // handle calls with data being the only argument
    if (isBoolean(opt_nbunch)) {
      opt_data = opt_nbunch;
      opt_nbunch = null;
    }

    // helper dict to keep track of multiply stored edges
    var seen = new Set();
    var nodes_nbrs;

    if (opt_nbunch == null) {
      nodes_nbrs = this.adj.entries();
    }
    else {
      var adj = this.adj;
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, adj.get(n))
      );
    }

    for (var node_data of nodes_nbrs) {
      var node = node_data[0];

      for (var neighbors_data of node_data[1].entries()) {
        if (!seen.has(neighbors_data[0])) {
          if (opt_data) {
            neighbors_data.unshift(node);
            yield neighbors_data;
          }
          else {
            yield [node, neighbors_data[0]];
          }
        }
      }
      seen.add(node);
      node_data.length = 0;
    }
  }


  /**
   * Return the attribute dictionary associated with edge (u,v).
   *
   * @param {jsnx.Node} u Node.
   * @param {jsnx.Node} v Node.
   * @param {T=} opt_default (default=null)
   *      Value to return if the edge (u,v) is not found.
   *
   * @return {(Object|T)} The edge attribute dictionary.
   * @template T
   * 
   * @export
   */
  get_edge_data(u, v, opt_default) {
    var nbrs = this.adj.get(u);
    if (nbrs != null) {
      var data = nbrs.get(v);
      if (data != null) {
        return data;
      }
    }
    return opt_default;
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
  adjacency_list() {
    return iteratorToArray(mapIterator(
      this.adjacency_iter(),
      nd => iteratorToArray(nd[1].keys())
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
  adjacency_iter() {
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
   * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
   *      A container of nodes.  The container will be iterated
   *      through once.
   *
   * @param {string=} opt_weight (default=None)
   *      The edge attribute that holds the numerical value used
   *      as a weight.  If null or not defined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
   *
   * @return {!(number|jsnx.contrib.Map)} A dictionary with nodes as keys and 
   * degree as values or a number if a single node is specified.
   * @export
   */
  degree(opt_nbunch, opt_weight) {
    if (opt_nbunch != null && this.has_node(opt_nbunch)) {
      // return a single node
      return this.degree_iter(opt_nbunch,opt_weight).next().value[1];
    }
    else {
      return new Map(this.degree_iter(opt_nbunch, opt_weight));
    }
  }


  /**
   * Return an array for (node, degree).
   *
   *
   * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
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
  degree_iter(opt_nbunch, opt_weight) {
    var nodes_nbrs;
    var iterator;

    if (opt_nbunch == null) {
      nodes_nbrs = this.adj.entries();
    }
    else {
      var adj = this.adj;
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, adj.get(n))
      );
    }

    if (!opt_weight) {
      iterator = mapIterator(nodes_nbrs, function([node, nbrs]) {
        return [node, nbrs.size + (+nbrs.has(node))];
      });
    }
    else {
      iterator = mapIterator(
        nodes_nbrs,
        function(nd) {
          var [n, nbrs] = nd;
          var sum = 0;

          nbrs.forEach(function(data) {
            var weight = data[opt_weight];
            sum += +(weight != null ? weight : 1);
          });

          if (nbrs.has(n)) {
            var weight = nbrs.get(n)[opt_weight];
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
  is_multigraph() {
    return false;
  }


  /**
   * Return True if graph is directed, False otherwise.
   *
   * @return {boolean}  True if graph is directed, False otherwise.
   * @export
   */
  is_directed() {
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
  to_directed() {
    var G = new require('./digraph')();
    G.name(this.name());
    G.add_nodes_from(this);
    G.add_edges_from((function*() {
      for (var nd of this.adjacency_iter()) {
        var [u, nbrs] = nd;
        for (var nbr of nbrs.entries()) {
          var [v, data] = nbr;
          yield tuple3(u, v, deepcopy(data));
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
  to_undirected() {
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
   * jsnx.Graph(G.subgraph(nbunch))
   *
   * If edge attributes are containers, a deep copy can be obtained using:
   * G.subgraph(nbunch).copy()
   *
   * For an inplace reduction of a graph to a subgraph you can remove nodes:
   * G.remove_nodes_from(jsnx.array.filter(G.nodes(), function(n) {
   *      return jsnx.array.contains(nbunch, n);
   * }))
   *
   * @param {jsnx.NodeContainer} nbunch
   *      A container of nodes which will be iterated through once.
   *
   * @return {Graph}
   * @export
   */
  subgraph(nbunch) {
    var bunch = this.nbunch_iter(nbunch);

    // create new graph and copy subgraph into it
    var H = new this.constructor();
    // namespace shortcuts for speed
    var H_adj = H.adj;
    var this_adj = this.adj;

    // add nodes and edges (undirected method)
    for (var n of bunch) {
      var Hnbrs = new Map();
      H_adj.set(n, Hnbrs);

      for (var nbrdata of this_adj.get(n)) {
        var nbr = nbrdata[0];
        var data = nbrdata[1];
        if (H_adj.has(nbr)) {
          // add both representations of edge: n-nbr and nbr-n
          Hnbrs.set(nbr, data);
          H_adj.get(nbr).set(n, data);
        }
      }
    }

    // copy node and attribute dictionaries
    for (n of H) {
      H.node.set(n, this.node.get(n));
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
  nodes_with_selfloops() {
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
  selfloop_edges(opt_data) {
    var edges = [];

    for (var nd of this.adj.entries()) {
      var [node, nbrs] = nd;
      if (nbrs.has(node)) {
        if (opt_data) {
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
  number_of_selfloops() {
    return this.selfloop_edges().length;
  }


  /**
   * Return the number of edges.
   *
   * @param {string=} opt_weight The edge attribute that holds the numerical
   *      value used as a weight.  If not defined, then each edge has weight 1.
   *
   * @return {number} The number of edges of sum of edge weights in the graph.
   * @export
   */
  size(opt_weight) {
    var s = 0;
    for (var v of this.degree(null, opt_weight).values()) {
      s += v;
    }
    s = s / 2;

    if (opt_weight == null) {
      return Math.floor(s); // int(s)
    }
    else {
      return s; // no need to cast to float
    }
  }


  /**
   * Return the number of edges between two nodes.
   *
   * @param {!jsnx.Node=} u node.
   * @param {!jsnx.Node=} v node
   *       If u and v are specified, return the number of edges between
   *       u and v. Otherwise return the total number of all edges.
   *
   * @return {number} The number of edges in the graph.
   *      If nodes u and v are specified return the number of edges between
   *      those nodes.
   * @export
   */
  number_of_edges(u, v) {
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
   * @param {jsnx.NodeContainer} nodes A container of nodes.
   * @param {Object=} opt_attr  Attributes to add to every edge in star.
   * @export
   */
  add_star(nodes, opt_attr) {
    var niter = toIterator(nodes);
    var v = niter.next().value;
    var edges = mapIterator(niter, n => tuple2(v, n));
    this.add_edges_from(edges, opt_attr);
  }


  /**
   * Add a path.
   *
   * @param {jsnx.NodeContainer} nodes A container of nodes.
   *      A path will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} opt_attr Attributes to add to every edge in path.
   * @export
   */
  add_path(nodes, opt_attr) {
    var nlist = toArray(nodes);
    var edges = zipSequence(
      nlist.slice(0, nlist.length - 1),
      nlist.slice(1)
    );
    this.add_edges_from(edges, opt_attr);
  }


  /**
   * Add a cycle.
   *
   * @param {jsnx.NodeContainer} nodes A container of nodes.
   *      A cycle will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} opt_attr  Attributes to add to every edge in cycle.
   * @export
   */
  add_cycle(nodes, opt_attr) {
    var nlist = toArray(nodes);
    var edges = zipSequence(
      nlist,
      nlist.slice(1).concat([nlist[0]])
    );
    this.add_edges_from(edges, opt_attr);
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
   * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
   *      A container of nodes.  The container will be iterated
   *      through once.
   *
   * @return {!Iterator} An iterator over nodes in nbunch
   *      that are also in the graph.
   *      If nbunch is null or not defined, iterate over all nodes in the graph.
   * @export
   */
  *nbunch_iter(opt_nbunch) {
    if (opt_nbunch == null) { // include all nodes
      /*jshint expr:true*/
      yield* this.adj.keys();
    }
    else if (this.has_node(opt_nbunch)) { // if nbunch is a single node
      yield opt_nbunch;
    }
    else { // if nbunch is a sequence of nodes
      var adj = this.adj;

      try {
        for (var n of toIterator(opt_nbunch)) {
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

}

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
Graph.__name__ = 'Graph';


/**
 * Dictionary for graph attributes
 *
 * @dict
 * @export
 */
Graph.prototype.graph = null;


/**
 * Node dict
 *
 * @type {jsnx.contrib.Map}
 * @export
 */
Graph.prototype.node = null;


/**
 * Adjacency dict
 *
 * @type {jsnx.contrib.Map}
 * @export
 */
Graph.prototype.adj = null;


/**
 * Edge dict
 *
 * @type {jsnx.contrib.Map}
 * @export
 */
Graph.prototype.edge = null;

Graph.prototype[iteratorSymbol] = function() {
  return this.adj.keys();
};

module.exports = Graph;
