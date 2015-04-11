'use strict';

import KeyError from '../exceptions/KeyError';
import Map from '../_internals/Map';
import Set from '../_internals/Set';
import JSNetworkXError from '../exceptions/JSNetworkXError';

import isBoolean from 'lodash/lang/isBoolean';
import isString from 'lodash/lang/isString';

import * as convert from '../convert';
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
 * Nodes can be strings, numbers or any object with a custom `toString` method.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * ### Examples
 *
 * Create an empty graph (a "null graph") with no nodes and no edges.
 *
 * ```
 * var G = new jsnx.Graph();
 * ```
 *
 * G can be grown in several ways.
 *
 * #### Nodes
 *
 * Add one node at a time:
 *
 * ```
 * G.addNode(1);
 * ```
 *
 * Add the nodes from any iterable:
 *
 * ```
 * G.addNodesFrom([2, 3]);
 * G.addNodesFrom(new Set('foo', 'bar'));
 * var H = jsnx.completeGraph(10);
 * G.addNodesFrom(H);
 * ```
 *
 * In addition to strings, numbers and arrays, any object that implements a
 * custom `toString` method can be used as node.
 *
 * #### Edges
 *
 * `G` can also be grown by adding edges.
 *
 * Add one edge,
 *
 * ```
 * G.addEdge(1, 2);
 * ```
 *
 * a list of edges,
 *
 * ```
 * G.addEdgesFrom([[1,2], [1,3]]);
 * ```
 *
 * or a collection of edges,
 *
 * ```
 * G.addEdgesFrom(H.edges);
 * ```
 *
 * If some edges connect nodes not yet in the graph, the nodes are added
 * automatically. There are no errors when adding nodes or edges that already
 * exist.
 *
 * #### Attributes
 *
 * Each graph, node and edge can hold key/value attribute pairs in an associated
 * attribute object (keys must be strings or numbers).
 * By default these are empty, but can added or changed using `addEdge`,
 * `addNode`.
 *
 * ```
 * var G = new jsnx.Graph(null, {day: 'Friday'});
 * G.graph
 * // {day: 'Friday'}
 * ```
 *
 * Add node attributes using `addNode()` or `addNodesFrom()`:
 *
 * ```
 * G.addNode(1, {time: '5pm'});
 * G.addNodesFrom([2, [3, {time: '3pm'}]], {time: '2pm'});
 * G.nodes(true);
 * // [[1, {time: '5pm'}], [2, {time: '2pm'}], [3, {time: '3pm'}]]
 * ```
 *
 * Add edge attributes using `addEdge()`, or `addEdgesFrom()`:
 *
 * ```
 * G.addEdge(1, w, {weight: 4.7});
 * G.addEdgesFrom([[3,4], [4,5]], {color: 'red'});
 * ```
 *
 * @see DiGraph
 * @see MultiGraph
 * @see MultiDiGraph
 */
export default class Graph {

  /*
   * @param {Iterable} optData Data to initialize graph.  If `data` is not
   *    provided, an empty graph is created. The data can be an edge list, or
   *    any JSNetworkX graph object.
   * @param {Object=} optAttr (default=no attributes)
   *    Attributes to add to graph as key=value pairs.
   */
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
   * @return {(string|undefined)} Graph name if no parameter was passed.
   */
  get name() {
    return this.graph.name || '';
  }

  set name(name) {
    this.graph.name = name;
  }

  /**
   * Return the graph name
   *
   * @return {string} Graph name.
   */
  toString() {
    return this.name;
  }

  /**
   * Return a Map of neighbors of node n.
   *
   * @param {Node} n  A node in the graph.
   *
   * @return {!Map} The adjacency dictionary for nodes connected to n.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addNode(1);
   * G.addNode('Hello');
   * G.numberOfNodes();
   * 2
   * ```
   *
   * @see #addNodesFrom
   *
   * @param {Node} n Node
   * @param {Object=} opt_attr_dict Dictionary of node attributes.
   *      Key/value pairs will update existing data associated with the node.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph(); // or DiGraph, MultiGraph, MultiDiGraph
   * G.addNodesFrom([1,2,3]);
   * G.nodes();
   * // [1,2,3]
   * ```
   *
   * Use the second argument to update specific node attributes for every node.
   *
   * ```
   * G.addNodesFrom([1,2], {size: 10});
   * G.addNodesFrom([2,3], {weight: 0.4});
   * ```
   *
   * Use `(node, object)` tuples to update attributes for specific nodes.
   *
   * ```
   * G.addNodesFrom([[1, {size: 11}], [2, {color: 'blue'}]]);
   * G.node.get(1).size
   * // 11
   * var H = new jsnx.Graph();
   * H.addNodesFrom(G.nodes(true));
   * H.node.get(1).size
   * // 11
   * ```
   *
   * @see #addNode
   *
   * @param {Iterable} nodes
   *      An iterable of nodes
   *      OR
   *      An iterable of (node, object) tuples.
   *
   * @param {Object=} optAttr  Update attributes for all nodes in nodes.
   *       Node attributes specified in nodes as a tuple
   *       take precedence over attributes specified generally.
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
   * ### Example
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.edges();
   * // [[0,1], [1,2]]
   * G.removeNode(1);
   * G.edges();
   * // []
   * ```
   *
   * @see #removeNodesFrom
   *
   * @param {Node} n  A node in the graph
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * var e = G.nodes(); // [0,1,2]
   * G.removeNodesFrom(e);
   * G.nodes();
   * // []
   * ```
   *
   * @see #removeNode
   *
   * @param {Iterable} nodes  A container of nodes.
   *      If a node in the container is not in the graph it is silently ignored.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * var data = [];
   * Array.from(G.nodesIter(true)).map(([node, data]) => data);
   * // [{}, {}, {}]
   * ```
   *
   * ### Notes
   *
   * If the node is not required, it is simpler and equivalent to use `G`, e.g.
   * `Array.from(G)` or `for (var node of G)`.
   *
   * @param {boolean=} optData If false the iterator returns
   *   nodes. If true return a two-tuple of node and node data dictionary.
   *
   * @return {Iterator} of nodes If data=true the iterator gives
   *           two-tuples containing (node, node data, dictionary).
   */
  nodesIter(optData=false) {
    if (optData) {
      return toIterator(this.node);
    }
    return this.node.keys();
  }

  /**
   * Return a list of the nodes in the graph.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.nodes();
   * // [0,1,2]
   * G.addNode(1, {time: '5pm'});
   * G.nodes(true);
   * // [[0,{}], [1,{time: '5pm'}], [2,{}]]
   * ```
   *
   * @param {boolean=} optData If false the iterator returns
   *   nodes. If true return a two-tuple of node and node data dictionary.
   *
   * @return {!Array} of nodes If data=true a list of two-tuples containing
   *           (node, node data object).
   */
  nodes(optData=false) {
    return Array.from(optData ? this.node.entries() : this.node.keys());
  }

  /**
   * Return the number of nodes in the graph.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.numberOfNodes();
   * // 3
   * ```
   *
   * @see #order
   *
   * @return {number} The number of nodes in the graph.
   */
  numberOfNodes() {
    return this.node.size;
  }


  /**
   * Return the number of nodes in the graph.
   *
   * @see #numberOfNodes
   *
   * @return {number} The number of nodes in the graph.
   */
  order() {
    return this.node.size;
  }


  /**
   * Return true if the graph contains the node n.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.hasNode(0);
   * // true
   * ```
   *
   * @param {Node} n node.
   * @return {boolean}
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
   * Edge attributes can be specified with keywords or by providing
   * a object with key/value pairs as third argument.
   *
   *
   * ### Examples
   *
   * The following all add the edge `(1,2)` to graph `G`:
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdge(1,2);
   * G.addEdgesFrom([[1,2]]);
   * ```
   *
   * Associate data to edges using an object:
   *
   * ```
   * G.addEdge(1, 2, {weight: 3});
   * G.addEdge(1, 3, {weight: 7, capacity: 15, length: 342.7});
   * ```
   *
   * ### Notes
   *
   * Adding an edge that already exists updates the edge data.
   *
   * Many algorithms designed for weighted graphs use as the edge weight a
   * numerical value assigned to an attribute which by default is 'weight'.
   *
   * @see #addEdgesFrom
   *
   * @param {Node} u Node
   * @param {Node} v Node
   * @param {Object=} optAttrDict Object of edge attributes.
   *      Key/value pairs will update existing data associated with the edge.
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
   * Add all the edges in `ebunch`.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdgesFrom([[0,1], [1,2]]); // using a list of edges
   * ```
   *
   * Associate data to edges
   *
   * ```
   * G.addEdgesFrom([[1,2], [2,3]], {weight: 3});
   * G.addEdgesFrom([[3,4], [1,4]], {label: 'WN2898'});
   * ```
   *
   * ### Notes
   *
   * Adding the same edge twice has no effect but any edge data
   * will be updated when each duplicate edge is added.
   *
   * @see #add_edge
   * @see #addWeightedEdgesFrom
   *
   * @param {Iterable} ebunch container of edges
   *      Each edge given in the container will be added to the
   *      graph. The edges must be given as as 2-tuples (u,v) or
   *      3-tuples (u,v,d) where d is a dictionary containing edge data.
   *
   * @param {Object=} optAttrDict Object of edge attributes.
   *      Dictionary of edge attributes.  Key/value pairs will
   *      update existing data associated with each edge.
   */
  addEdgesFrom(ebunch, optAttrDict) {
    if (optAttrDict && !isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The attr_dict argument must be an object.');
    }

    // process ebunch
    for (var tuple of ebunch) {
      if (tuple.length == null) {
        throw new JSNetworkXError(
          sprintf('Edge tuple %j must be a 2-tuple or 3-tuple.', tuple)
        );
      }

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
    }
  }


  /**
   * Add all the edges in `ebunch` as weighted edges with specified weights.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addWeightedEdgesFrom([[0,1,3.0], [1,2,7.5]]);
   * ```
   *
   * ### Note
   *
   * Adding the same edge twice for Graph/DiGraph simply updates
   * the edge data.  For MultiGraph/MultiDiGraph, duplicate edges
   * are stored.
   *
   * @see #addEdge
   * @see #addEdgesFrom
   *
   * @param {Iterable} ebunch  container of edges
   *      Each edge given in the list or container will be added
   *      to the graph. The edges must be given as 3-tuples (u,v,w)
   *      where w is a number.
   * @param {string=} optWeight (default 'weight')
   *      The attribute name for the edge weights to be added.
   * @param {Object=} optAttr Edge attributes to add/update for all edges.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.removeEdge(0,1);
   * ```
   *
   * @see #removeEdgesFrom
   *
   * @param {Node} u Node
   * @param {Node} v Node
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
   * Remove all edges specified in `ebunch`.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * var ebunch = [[1,2], [2,3]];
   * G.removeEdgesFrom(ebunch);
   * ```
   *
   * ### Notes
   *
   * Will fail silently if an edge in `ebunch` is not in the graph.
   *
   * @param {Iterable} ebunch Iterable of edge tuples
   *      Each edge given in the list or container will be removed
   *      from the graph. The edges can be:
   *        - 2-tuples (u,v) edge between u and v.
   *        - 3-tuples (u,v,k) where k is ignored.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.hasEdge(0, 1);
   * // true
   * var edge = [0, 1];
   * G.hasEdge.apply(G, edge);
   * // true
   * ```
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   *
   * @return {boolean} True if edge is in the graph, False otherwise.
   */
  hasEdge(u, v) {
    var unode = this.adj.get(u);
    return unode && unode.has(v);
  }

  /**
   * Return a list of the nodes connected to the node n.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.neighbors(0);
   * // [1]
   * ```
   *
   * ### Notes
   *
   * It can be more convenient to access the adjacency map as `G.get(n)`:
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdge('a', 'b', {weight: 7});
   * G.get('a');
   * // Map {'b': {weight: 7}}
   * ```
   *
   * @param {!Node} n A node in the graph.
   * @return {!Array} A list of nodes that are adjacent to n.
   */
  neighbors(n) {
    return Array.from(this.neighborsIter(n));
  }

  /**
   * Return an iterator over all neighbors of node n.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * Array.from(G.neighborsIter(0));
   * // [1]
   * ```
   *
   * You could also iterate over the adjacency map instead:
   *
   * ```
   * Array.from(G.get(0).keys());
   * ```
   *
   * @param {!Node} n A node in the graph.
   * @return {!Iterator} A list of nodes that are adjacent to n.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.addEdge(2, 3, {weight: 5});
   * G.edges();
   * // [[0,1], [1,2], [2,3]]
   * G.edges(true);
   * // [[0,1,{}], [1,2,{}], [2,3, {weight: 5}]
   * G.edges([0,3]);
   * // [[0,1], [3,2]]
   * G.edges(0);
   * // [[0,1]]
   * ```
   *
   * ### Note
   *
   * Nodes in `nbunch` that are not in the graph will be (quietly) ignored.
   * For directed graphs this returns the out-edges.
   *
   * @param {?(Node|Iterable)=} optNbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} optData Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   * @return {!Array} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   */
  edges(optNbunch, optData=false) {
    return Array.from(this.edgesIter(optNbunch, optData));
  }

  /**
   * Return an iterator over the edges.
   *
   * Edges are returned as tuples with optional data
   * in the order (node, neighbor, data).
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2]);
   * G.addEdge(2, 3, {weight: 5});
   * Array.from(G.edgesIter());
   * // [[0,1], [1,2], [2,3]]
   * Array.from(G.edgesIter(true));
   * // [[0,1,{}], [1,2,{}], [2,3, {weight: 5}]
   * Array.from(G.edgesIter([0,3]));
   * // [[0,1], [3,2]]
   * Array.from(G.edgesIter(0));
   * // [[0,1]]
   * ```
   *
   * ### Note
   *
   * Nodes in `nbunch` that are not in the graph will be (quietly) ignored.
   * For directed graphs this returns the out-edges.
   *
   * @param {?(Node|Iterable)=} optNbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} optData Return two tuples (u,v) (False)
   *      or three-tuples (u,v,data) (True).
   * @return {!Iterator} iterater if `(u,v)` or `(u,v,d)` edge tuples
   */
  *edgesIter(optNbunch, optData=false) {

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
   * Return the attribute object associated with edge (u,v).
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.getEdgeData(0,1);
   * // {}
   * ```
   *
   * If the edge exists, it may be simpler to access `G.get(0).get(1)`.
   *
   * @param {Node} u Node.
   * @param {Node} v Node.
   * @param {*} optDefault
   *   Value to return if the edge (u,v) is not found.
   * @return {*} The edge attribute object.
   */
  getEdgeData(u, v, optDefault=null) {
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.adjacencyList();
   * // [[1], [0,2], [1,3], [2]]
   * ```
   *
   * @return {!Array.<Array>} The adjacency structure of the graph as a
   *      list of lists.
   */
  adjacencyList() {
    /*eslint no-unused-vars:0*/
    return Array.from(mapIterator(
      this.adjacencyIter(),
      ([_, adj]) => Array.from(adj.keys())
    ));
  }

  /**
   * Return an iterator of (node, adjacency map) tuples for all nodes.
   *
   * For directed graphs, only outgoing adjacencies are included.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * Array.from(G.adjacencyIter());
   * // [
   * //   [0, Map {1: {}}],
   * //   [1, Map {0: {}, 2: {}}],
   * //   [2, Map {1: {}, 3: {}}],
   * //   [3, Map {2: {}]]
   * // ]
   * ```
   *
   * @return {!Iterator} An array of (node, adjacency map) tuples
   *      for all nodes in the graph.
   */
  adjacencyIter() {
    return this.adj.entries();
  }

  /**
   * Return the degree of a node or nodes.
   *
   * The node degree is the number of edges adjacent to that node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();  // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3])
   * G.degree(0)
   * // 1
   * G.degree([0,1])
   * // Map {0: 1, 1: 2}
   * Array.from(G.degree([0,1]).values())
   * // [1, 2]
   * ```
   *
   * @param {(Node|Iterable)=} optNbunch (default=all nodes)
   *      An iterable of nodes.  The iterable will be iterated
   *      through once.
   * @param {string=} optWeight
   *      The edge attribute that holds the numerical value used
   *      as a weight.  If null or not defined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
   * @return {!(number|Map)} A dictionary with nodes as keys and
   *      degree as values or a number if a single node is specified.
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
   * The node degree is the number of edges adjacent to that node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();  // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3])
   * Array.from(G.degreeIter(0));
   * // [[0, 1]]
   * Array.from(G.degreeIter([0,1]));
   * // [[0, 1], [1, 2]]
   * ```
   *
   * @param {(Node|Iterable)=} optNbunch (default=all nodes)
   *       A container of nodes.  The container will be iterated
   *       through once.
   * @param {string=} optWeight
   *      The edge attribute that holds the numerical value used
   *      as a weight.  If null or not defined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
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
      let adj = this.adj;
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
          let sum = 0;

          nbrs.forEach(function(data) {
            let weight = data[optWeight];
            sum += +(weight != null ? weight : 1);
          });

          if (nbrs.has(n)) {
            let weight = nbrs.get(n)[optWeight];
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph(); // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.clear();
   * G.nodes();
   * // []
   * G.edges();
   * // []
   * ```
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph(); // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * var H = G.copy();
   * ```
   *
   * ### Notes
   *
   * This makes a complete copy of the graph including all of the
   * node or edge attributes.
   *
   * @return {!Graph}
   */
  copy() {
    return deepcopy(this);
  }

  /**
   * Return True if graph is a multigraph, False otherwise.
   *
   * @return {boolean} True if graph is a multigraph, False otherwise.
   */
  isMultigraph() {
    return false;
  }


  /**
   * Return True if graph is directed, False otherwise.
   *
   * @return {boolean}  True if graph is directed, False otherwise.
   */
  isDirected() {
    return false;
  }


  /**
   * Return a directed representation of the graph.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph(); // or MultiGraph, etc
   * G.addPath([0,1]);
   * var H = G.toDirected();
   * H.edges();
   * // [[0,1], [1,0]]
   * ```
   *
   * If already directed, return a (deep) copy
   *
   * ```
   * var G = new jsnx.DiGraph(); // or MultiDiGraph, etc
   * G.addPath([0,1]);
   * var H = G.toDirected();
   * H.edges();
   * // [[0,1]]
   * ```
   *
   * ### Notes
   *
   * This returns a "deepcopy" of the edge, node, and
   * graph attributes which attempts to completely copy
   * all of the data and references.
   *
   * This is in contrast to the similar `var H = new jsnx.DiGraph(G)` which
   * returns a shallow copy of the data.
   *
   * @return {!DiGraph}
   *   A directed graph with the same name, same nodes, and with
   *   each edge (u,v,data) replaced by two directed edges
   *   (u,v,data) and (v,u,data).
   */
  toDirected() {
    var G = new (require('./DiGraph'))();
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph(); // or MultiGraph, etc
   * G.addPath([0,1]);
   * var H = G.toDirected();
   * G.edges();
   * // [[0,1], [1,0]]
   * var G2 = H.toUndirected();
   * G2.edges();
   * // [[0,1]]
   * ```
   *
   * ### Notes
   *
   * This returns a "deepcopy" of the edge, node, and
   * graph attributes which attempts to completely copy
   * all of the data and references.
   *
   * This is in contrast to the similar `var H = new jsnx.Graph(G);` which
   * returns a shallow copy of the data.
   *
   * @return {!Graph} A deepcopy of the graph.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * var H = G.subgraph([0,1,2]);
   * H.edges();
   * // [[0,1], [1,2]]
   * ```
   *
   * ### Notes
   *
   * The graph, edge or node attributes just point to the original graph.
   * So changes to the node or edge structure will not be reflected in
   * the original graph while changes to the attributes will.
   *
   * To create a subgraph with its own copy of the edge/node attributes use:
   * `new jsnx.Graph(G.subgraph(nbunch))`.
   *
   * For an inplace reduction of a graph to a subgraph you can remove nodes:
   *
   * ```
   * G.removeNodesFrom(G.nodes().filter(function(n) {
   *      return nbunch.indexOf(n) > -1;
   * }))
   * ```
   *
   * @param {Iterable} nbunch
   *      An iterable of nodes which will be iterated through once.
   * @return {Graph}
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdge(1, 1)
   * G.addEdge(1, 2)
   * G.nodesWithSelfloops()
   * // [1]
   * ```
   *
   * @return {Array} A list of nodes with self loops.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdge(1,1)
   * G.addEdge(1,2)
   * G.selfloopEdges()
   * // [(1, 1)]
   * G.selfloop_edges(true)
   * // [(1, 1, {})]
   * ```
   *
   * @param {boolean=} optData
   *      Return selfloop edges as two tuples (u,v) (data=False)
   *      or three-tuples (u,v,data) (data=True).
   *
   * @return {Array}  A list of all selfloop edges.
   */
  selfloopEdges(optData=false) {
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.add_edge(1,1)
   * G.add_edge(1,2)
   * G.number_of_selfloops()
   * // 1
   * ```
   *
   * @return {number} The number of selfloops.
   */
  numberOfSelfloops() {
    return this.selfloopEdges().length;
  }

  /**
   * Return the number of edges.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3])
   * G.size()
   * // 3
   *
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addEdge('a',' b', {weight: 2});
   * G.addEdge('b', 'c', {weight: 4});
   * G.size()
   * // 2
   * G.size('weight');
   * // 6.0
   * ```
   *
   * @param {string=} optWeight The edge attribute that holds the numerical
   *      value used as a weight.  If not defined, then each edge has weight 1.
   * @return {number} The number of edges or sum of edge weights in the graph.
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
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.numberOfEdges();
   * // 3
   * G.number_of_edges(0,1);
   * // 1
   * ```
   *
   * @param {!Node=} u node.
   * @param {!Node=} v node
   *       If u and v are both specified, return the number of edges between
   *       u and v. Otherwise return the total number of all edges.
   * @return {number} The number of edges in the graph.
   *      If nodes u and v are specified return the number of edges between
   *      those nodes.
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
   * ### Examples
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addStar([0,1,2,3]);
   * G.addStar([10,11,12], {weight: 2});
   * ```
   *
   * The first node in nodes is the middle of the star.  It is connected
   * to all other nodes.
   *
   * @param {Iterable} nodes A container of nodes.
   * @param {Object=} optAttr  Attributes to add to every edge in the star.
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
   * ### Examples
   *
   * ```
   * var G= new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.addPath([10,11,12], {weight: 7});
   * ```
   *
   * @param {Iterable} nodes A container of nodes.
   *      A path will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} optAttr Attributes to add to every edge in path.
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
   * ### Examples
   *
   * ```
   * var G= new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addCycle([0,1,2,3]);
   * G.addCycle([10,11,12], {weight: 7});
   * ```
   *
   * @param {Iterable} nodes A container of nodes.
   *      A cycle will be constructed from the nodes (in order)
   *      and added to the graph.
   * @param {Object=} optAttr  Attributes to add to every edge in cycle.
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
   * Return an iterator of nodes contained in `nbunch` that are
   * also in the graph.
   *
   * The nodes in `nbunch` are checked for membership in the graph
   * and if not are silently ignored.
   *
   * ### Notes
   *
   * When `nbunch` is an iterator, the returned iterator yields values
   * directly from `nbunch`, becoming exhausted when `nbunch` is exhausted.
   *
   * To test whether `nbunch` is a single node, one can use
   * `if (this.hasNode(nbunch))`, even after processing with this routine.
   *
   * If `nbunch` is not a node or a (possibly empty) sequence/iterator
   * or not defined, an Error is raised.
   *
   * @param {(Node|Iterable)=} optNbunch (default=all nodes)
   *      A container of nodes.  The container will be iterated
   *      through once.
   * @return {!Iterator} An iterator over nodes in nbunch
   *      that are also in the graph.
   *      If nbunch is null or not defined, iterate over all nodes in the graph.
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

  /**
   * A graph is an iterable over its nodes.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.Graph();   // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addNodesFrom([0,1,2,3]);
   * for (var node of G) {
   *   console.log(node);
   * }
   * ```
   *
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return this.node.keys();
  }
}
