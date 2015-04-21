'use strict';

import Graph from './Graph';
import Map from '../_internals/Map';
import JSNetworkXError from '../exceptions/JSNetworkXError';

import * as convert from '../convert';
import {
  clear,
  clone,
  createTupleFactory,
  deepcopy,
  forEach,
  isBoolean,
  isPlainObject,
  mapIterator,
  next,
  size,
  sprintf,
  tuple2,
  tuple3,
  tuple3c,
  zipIterator
} from '../_internals';

/**
 * Base class for directed graphs.
 *
 * A DiGraph stores nodes and edges with optional data, or attributes.
 *
 * DiGraphs hold directed edges.  Self loops are allowed but multiple
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
 * var G = new jsnx.DiGraph();
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
 * var G = new jsnx.DiGraph(null, {day: 'Friday'});
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
 * @see Graph
 * @see MultiGraph
 * @see MultiDiGraph
 */
export default class DiGraph extends Graph {

  /**
   * @param {Iterable} optData
   *      Data to initialize graph.  If data=None (default) an empty
   *      graph is created.  The data can be an edge list, or any
   *      JSNetworkX graph object.
   *
   * @param {Object=} optAttr
   *       Attributes to add to graph as key=value pairs.
   */
  constructor(optData, optAttr) {
    super();
    this.graph = {}; // dictionary for graph attributes
    this.node = new Map(); // dictionary for node attributes
    // We store two adjacency lists:
    // the  predecessors of node n are stored in the dict self.pred
    // the successors of node n are stored in the dict self.succ=self.adj
    this.adj = new Map(); // empty adjacency dictionary
    this.pred = new Map(); // predecessor
    this.succ = this.adj; // successor

    //attempt to load graph with data
    if(optData != null) {
        convert.toNetworkxGraph(optData, this);
    }
    // load graph attributes (must be afte convert)
    Object.assign(this.graph, optAttr || {});
    this.edge = this.adj;
  }

  /**
   * Holds the graph type (class) name for information.
   *
   * @type {string}
   */
  static get __name__() {
    return 'DiGraph';
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
    if(!isPlainObject(optAttrDict)) {
      throw new JSNetworkXError(
        'The opt_attr_dict argument must be an object.'
      );
    }

    if(!this.succ.has(n)) {
      this.succ.set(n, new Map());
      this.pred.set(n, new Map());
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
    // if an object, only iterate over the keys
    forEach(nodes, function(n) {
      var newnode = !this.succ.has(n);

      // test whether n is a (node, attr) tuple
      if (Array.isArray(n) && n.length === 2 && isPlainObject(n[1])) {
        var nn = n[0];
        var ndict = n[1];

        if (!this.succ.has(nn)) {
          this.succ.set(nn, new Map());
          this.pred.set(nn, new Map());
          var newdict = clone(optAttr);
          Object.assign(newdict, ndict);
          this.node.set(nn, newdict);
        }
        else {
          var olddict = this.node.get(nn);
          Object.assign(olddict, optAttr, ndict);
        }
      } else if (newnode) {
        this.succ.set(n, new Map());
        this.pred.set(n, new Map());
        this.node.set(n, clone(optAttr));
      }
      else {
        Object.assign(this.node.get(n), optAttr);
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
    if (this.node.delete(n)) {
      var nbrs = this.succ.get(n);
      nbrs.forEach(function(_, u) {
        this.pred.get(u).delete(n); // remove all edges n-u in digraph
      }, this);
      this.succ.delete(n); // remove node from succ
      this.pred.get(n).forEach(function(_, u) {
        this.succ.get(u).delete(n); // remove all edges n-u in digraph
      }, this);
      this.pred.delete(n); // remove node from pred
    }
    else {
      throw new JSNetworkXError(
        sprintf('The node "%j" is not in the graph', n)
      );
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
    forEach(nodes, function(n) {
      if (this.succ.has(n)) {
        var succs = this.succ.get(n);

        this.node.delete(n);
        succs.forEach(function(_, u) {
          // remove all edges n-u in digraph
          this.pred.get(u).delete(n);
        }, this);
        this.succ.delete(n); // remove node from succ
        this.pred.get(n).forEach(function(_, u) {
          // remove all edges n-u in digraph
          this.succ.get(u).delete(n);
        }, this);
        this.pred.delete(n); // remove node from pred
      }
    }, this);
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
  addEdge(u, v, optAttrDict={}) {
    if (!isPlainObject(optAttrDict)) {
      throw new JSNetworkXError(
        'The optAttrDict argument must be a plain object.'
      );
    }

    // add nodes
    if (!this.succ.has(u)) {
      this.succ.set(u, new Map());
      this.pred.set(u, new Map());
      this.node.set(u, {});
    }

    if (!this.succ.has(v)) {
      this.succ.set(v, new Map());
      this.pred.set(v, new Map());
      this.node.set(v, {});
    }

    // add the edge
    var datadict = this.adj.get(u).get(v) || {};
    Object.assign(datadict, optAttrDict);
    this.succ.get(u).set(v, datadict);
    this.pred.get(v).set(u, datadict);
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
  addEdgesFrom(ebunch, optAttrDict={}) {
    if (!isPlainObject(optAttrDict)) {
      throw new JSNetworkXError(
        'The opt_attr_dict argument must be an object.'
      );
    }

    // process ebunch
    forEach(ebunch, function(edge) {
      var length = size(edge);
      var u, v, edgeData;
      if (length === 3) {
        u = edge[0];
        v = edge[1];
        edgeData = edge[2];
      }
      else if (length === 2) {
        u = edge[0];
        v = edge[1];
        edgeData = {};
      }
      else {
        throw new JSNetworkXError(
          sprintf('Edge tuple "%j" must be a 2-tuple or 3-tuple.', edge)
        );
      }

      if (!this.succ.has(u)) {
        this.succ.set(u, new Map());
        this.pred.set(u, new Map());
        this.node.set(u, {});
      }
      if (!this.succ.has(v)) {
        this.succ.set(v, new Map());
        this.pred.set(v, new Map());
        this.node.set(v, {});
      }

      var datadict = this.adj.get(u).get(v) || {};
      Object.assign(datadict, optAttrDict, edgeData);
      this.succ.get(u).set(v, datadict);
      this.pred.get(v).set(u, datadict);
    }, this);
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
    var edge = this.succ.get(u);
    if (edge !== undefined && edge.delete(v)) {
      this.pred.get(v).delete(u);
    }
    else {
      throw new JSNetworkXError(
        sprintf('The edge "%j-%j" is not in the graph', u, v)
      );
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
    forEach(ebunch, function(edge) {
      var u = edge[0]; // ignore edge data if present
      var v = edge[1];

      try {
        this.succ.get(u).delete(v);
        this.pred.get(v).delete(u);
      }
      catch(ex) {
        /*eslint no-empty:0*/
        // pass
      }
    }, this);
  }

  /**
   * Return True if node u has successor v.
   *
   * This is true if graph has the edge u->v.
   *
   * @param {Node} u Node
   * @param {Node} v Node
   * @return {boolean} True if node u has successor v
   */
  hasSuccessor(u, v) {
    return this.succ.has(u) && this.succ.get(u).has(v);
  }

  /**
   * Return True if node u has predecessor v.
   *
   * This is true if graph has the edge u<-v.
   *
   * @param {Node} u Node
   * @param {Node} v Node
   * @return {boolean} True if node u has predecessor v
   */
  hasPredecessor(u, v) {
    return this.pred.has(u) && this.pred.get(u).has(v);
  }

  /**
   * Return an iterator over successor nodes of n.
   *
   * `neighborsIter()` and `successorsIter()` are the same.
   *
   * @param {Node} n Node
   * @return {!Iterator} Iterator over successor nodes of n
   */
  successorsIter(n) {
    var nbrs = this.succ.get(n);
    if (nbrs !== undefined) {
      return nbrs.keys();
    }
    throw new JSNetworkXError(
      sprintf('The node "%j" is not in the digraph.', n)
    );
  }

  /**
   * Return an iterator over predecessor nodes of n.
   *
   * @param {Node} n Node
   * @return {!Iterator} Iterator over predecessor nodes of n
   */
  predecessorsIter(n) {
    var nbrs = this.pred.get(n);
    if (nbrs !== undefined) {
      return nbrs.keys();
    }
    throw new JSNetworkXError(
      sprintf('The node "%j" is not in the digraph.', n)
    );
  }

  /**
   * Return a list of successor nodes of n.
   *
   * `neighbors()` and `successors()` are the same.
   *
   * @param {Node} n Node
   * @return {!Array} List of successor nodes of n
   */
  successors(n) {
    return Array.from(this.successorsIter(n));
  }

  /**
   * Return list of predecessor nodes of n.
   *
   * @param {Node} n Node
   * @return {!Array} List of predecessor nodes of n
   */
  predecessors(n) {
    return Array.from(this.predecessorsIter(n));
  }


  // digraph definitions
  /**
   * @alias successors
   */
  neighbors(n) {
    return this.successors(n);
  }

  /**
   * @alias successorsIter
   */
  neighborsIter(n) {
    return this.successorsIter(n);
  }

  /**
   * Return an iterator over the edges.
   *
   * Edges are returned as tuples with optional data in the order
   * `(node, neighbor, data)`.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph() // or MultiDiGraph, etc
   * G.addPath([0,1,2]);;
   * G.addEdge(2, 3, {weight: 5});
   * Array.from(G.edgesIter());
   * // [[0,1], [1,2], [2,3]]
   * Array.from(G.edgeIter(true)); // default data is {}
   * // [[0,1,{}], [1,2,{}], [2,3,{weight: 5}]]
   * Array.from(G.edgesIter([0,2]));
   * // [[0,1], [2,3]]
   * Array.from(G.edgesIter(0));
   * // [[0,1]]
   * ```
   *
   *
   * ### Notes
   *
   * Nodes in `nbunch` that are not in the graph will be (quietly) ignored.
   *
   * @see #edges
   *
   * @param {?boolean=} optNbunch A container of nodes.
   *       The container will be iterated through once.
   * @param {?boolean=} optData
   *      If True, return edge attribute dict in 3-tuple (u,v,data).
   * @return {!Iterator} An iterator of (u,v) or (u,v,d) tuples of edges.
   */
  *edgesIter(optNbunch, optData=false) {
    // handle calls with opt_data being the only argument
    if (isBoolean(optNbunch)) {
      optData = optNbunch;
      optNbunch = undefined;
    }

    var nodesNbrs;

    if (optNbunch === undefined) {
      nodesNbrs = this.adj;
    }
    else {
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, this.adj.get(n))
      );
    }

    for (var nodeNbrs of nodesNbrs) {
      for (var nbrData of nodeNbrs[1]) {
        var result = [nodeNbrs[0], nbrData[0]];
        if (optData) {
          result[2] = nbrData[1];
        }
        yield result;
      }
    }
  }

  // alias out_edges to edges

  /**
   * @alias edgesIter
   */
  outEdgesIter(optNbunch, optData) {
    return this.edgesIter(optNbunch, optData);
  }

  /**
   * @alias edges
   */
  outEdges(optNbunch, optData) {
    return this.edges(optNbunch, optData);
  }

  /**
   * Return an iterator over the incoming edges.
   *
   * @see edgesIter
   *
   * @param {?boolean=} optNbunch A container of nodes.
   *       The container will be iterated through once.
   * @param {?boolean=} optData
   *      If True, return edge attribute dict in 3-tuple (u,v,data).
   * @return {!Iterator} An iterator of (u,v) or (u,v,d) tuples of
   *      incoming edges.
   */
  *inEdgesIter(optNbunch, optData=false) {
    // handle calls with opt_data being the only argument
    if (isBoolean(optNbunch)) {
      optData = optNbunch;
      optNbunch = undefined;
    }

    var nodesNbrs;

    if(optNbunch === undefined) {
      nodesNbrs = this.pred;
    }
    else {
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, this.pred.get(n))
      );
    }

    for (var nodeNbrs of nodesNbrs) {
      for(var nbrData of nodeNbrs[1]) {
        var result = [nbrData[0], nodeNbrs[0]];
        if (optData) {
          result[2] = nbrData[1];
        }
        yield result;
      }
    }
  }

  /**
   * Return a list of the incoming edges.
   *
   * @see #edges
   *
   * @param {?Iterable=} optNbunch A container of nodes.
   *       The container will be iterated through once.
   * @param {?boolean=} opt_data
   *      If True, return edge attribute dict in 3-tuple (u,v,data).
   * @return {!Array} A list of incoming edges
   */
  inEdges(optNbunch, optData=false) {
    return Array.from(this.inEdgesIter(optNbunch, optData));
  }

  /**
   * Return an iterator for (node, degree).
   *
   * The node degree is the number of edges adjacent to the node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph() // or MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * Array.from(G.degreeIter(0));
   * // [[0, 1]]
   * Array.from(G.degreeIter([0,1]));
   * // [[0, 1], [1, 2]]
   * ```
   *
   * @see #degree
   * @see #inDegree
   * @see #outDegree
   * @see #inDegreeIter
   * @see #outDegreeIter
   *
   * @param {(Node|Iterable)=} optNbunch  A container of nodes.
   *       The container will be iterated through once.
   * @param {string=} optWeight
   *       The edge attribute that holds the numerical value used
   *       as a weight.  If None, then each edge has weight 1.
   *       The degree is the sum of the edge weights adjacent to the node.
   * @return {!Iterator}  The iterator returns two-tuples of (node, degree).
   */
  degreeIter(optNbunch, optWeight) {
    var nodesNbrs;

    if(optNbunch == null) {
      nodesNbrs = zipIterator(this.succ.entries(), this.pred.entries());
    }
    else {
      var tuple2Succ = createTupleFactory(2);
      var tuple2Pred = createTupleFactory(2);
      nodesNbrs = zipIterator(
        mapIterator(
          this.nbunchIter(optNbunch),
          n => tuple2Succ(n, this.succ.get(n))
        ),
        mapIterator(
          this.nbunchIter(optNbunch),
          n => tuple2Pred(n, this.pred.get(n))
        )
      );
    }

    if (optWeight == null) {
      /*eslint no-unused-vars:0*/
      return mapIterator(
        nodesNbrs,
        ([[node, succ], [u, pred]]) => [node, pred.size + succ.size]
      );
    }
    else {
      // edge weighted graph - degree is sum of edge weights
      return mapIterator(
        nodesNbrs,
        ([[node, succ], [_, pred]]) => {
          var sum = 0;

          function sumData(data) {
            var weight = data[optWeight];
            sum += weight != null ? +weight : 1;
          }

          succ.forEach(sumData);
          pred.forEach(sumData);

          return [node, sum];
        }
      );
    }
  }

  /**
   * Return an iterator for (node, in-degree).
   *
   * The node in-degree is the number of edges pointing in to the node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph();
   * G.addPath([0,1,2,3]);
   * Array.from(G.inDegreeIter(0));
   * // [[0, 0]]
   * Array.from(G.inDegreeIter([0,1]));
   * // [[0, 0], [1, ]]
   * ```
   *
   * @see #degree
   * @see #inDegree
   * @see #outDegree
   * @see #outDegreeIter
   *
   * @param {(Node|Iterable)=} optNbunch  A container of nodes.
   *       The container will be iterated through once.
   *
   * @param {string=} optWeight
   *       The edge attribute that holds the numerical value used
   *       as a weight.  If null or undefined, then each edge has weight 1.
   *       The degree is the sum of the edge weights adjacent to the node.
   * @return {Iterator}  The iterator returns two-tuples of (node, in-degree).
   */
  inDegreeIter(optNbunch, optWeight) {
    var nodesNbrs;

    if(optNbunch == null) {
      nodesNbrs = this.pred;
    }
    else {
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, this.pred.get(n))
      );
    }

    if (optWeight == null) {
      return mapIterator(
        nodesNbrs,
        ([node, pred]) => [node, pred.size]
      );
    }
    else {
      return mapIterator(
        nodesNbrs,
        function([node, pred]) {
          var sum = 0;
          pred.forEach(function(data) {
            var weight = data[optWeight];
            sum += weight != null ? +weight : 1;
          });
          return [node, sum];
        }
      );
    }
  }

  /**
   * Return an iterator for (node, out-degree).
   *
   * The node out-degree is the number of edges pointing in to the node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph();
   * G.addPath([0,1,2,3]);
   * Array.from(G.outDegreeIter(0));
   * // [[0, 1]]
   * Array.from(G.outDegreeIter([0,1]));
   * // [[0, 1], [1, ]]
   *
   *
   * @see #degree
   * @see #inDegree
   * @see #outDegree
   * @see #inDegreeIter
   *
   * @param {(Node|Iterable)=} opt_nbunch  A container of nodes.
   *       The container will be iterated through once.
   * @param {string=} optWeight
   *       The edge attribute that holds the numerical value used
   *       as a weight.  If None, then each edge has weight 1.
   *       The degree is the sum of the edge weights adjacent to the node.
   * @return {Iterator}  The iterator returns two-tuples of (node, out-degree).
   */
  outDegreeIter(optNbunch, optWeight) {
    var nodesNbrs;

    if (optNbunch == null) {
      nodesNbrs = this.succ;
    }
    else {
      nodesNbrs = mapIterator(
        this.nbunchIter(optNbunch),
        n => tuple2(n, this.succ.get(n))
      );
    }

    if(optWeight == null) {
      return mapIterator(
        nodesNbrs,
        ([node, succ]) => [node, succ.size]
      );
    }
    else {
      return mapIterator(
        nodesNbrs,
        function([node, succ]) {
          var sum = 0;
          succ.forEach(function(data) {
            var weight = data[optWeight];
            sum += weight != null ? +weight : 1;
          });
          return [node, sum];
        }
      );
    }
  }

  /**
   * Return the in-degree of a node or nodes.
   *
   * The node in-degree is the number of edges pointing in to the node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph(); // or MultiDiGraph
   * G.addPath([0,1,2,3]);
   * G.inDegree(0);
   * // 0
   * G.inDegree([0,1]);
   * // Map {0: 0, 1: 1}
   * Array.from(G.inDegree([0,1]).values());
   * // [0, 1]
   * ```
   *
   * @see #degree
   * @see #outDegree
   * @see #inDegreeIter
   *
   *
   * @param {(Node|Iterable)=} optNbunch  A container of nodes.
   *       The container will be iterated through once.
   * @param {string=} opt_weight
   *       The edge attribute that holds the numerical value used
   *       as a weight.  If None, then each edge has weight 1.
   *       The degree is the sum of the edge weights adjacent to the node.
   * @return {(number|Map)}
   *       A dictionary with nodes as keys and in-degree as values or
   *       a number if a single node is specified.
   */
  inDegree(optNbunch, optWeight) {
    if (optNbunch != null && this.hasNode(optNbunch)) {
      // return a single node
      return next(this.inDegreeIter(optNbunch, optWeight))[1];
    }
    else {
      return new Map(this.inDegreeIter(optNbunch, optWeight));
    }
  }


  /**
   * Return the out-degree of a node or nodes.
   *
   * The node out-degree is the number of edges pointing out of the node.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.DiGraph(); // or MultiDiGraph
   * G.addPath([0,1,2,3]);
   * G.outDegree(0);
   * // 1
   * G.outDegree([0,1]);
   * // Map {0: 1, 1: 1}
   * Array.from(G.inDegree([0,1]).values());
   * // [1, 1]
   * ```
   *
   * @see #degree
   * @see #out_degree
   * @see #in_degree_iter
   *
   * @param {(Node|Iterable)=} optNbunch  A container of nodes.
   *       The container will be iterated through once.
   * @param {string=} optWeight
   *       The edge attribute that holds the numerical value used
   *       as a weight.  If None, then each edge has weight 1.
   *       The degree is the sum of the edge weights adjacent to the node.
   * @return {(number|Map)}
   *       A dictionary with nodes as keys and in-degree as values or
   *       a number if a single node is specified.
   */
  outDegree(optNbunch, optWeight) {
    if (optNbunch != null && this.hasNode(optNbunch)) {
      // return a single node
      return next(this.outDegreeIter(optNbunch, optWeight))[1];
    }
    else {
      return new Map(this.outDegreeIter(optNbunch, optWeight));
    }
  }

  /**
   * Remove all nodes and edges from the graph.
   *
   * This also removes the name, and all graph, node, and edge attributes.
   *
   * ### Examples
   *
   * ```
   * var G = new jsnx.Graph() // or DiGraph, MultiGraph, MultiDiGraph, etc
   * G.addPath([0,1,2,3]);
   * G.clear();
   * G.nodes();
   * // []
   * G.edges();
   * // []
   * ```
   */
  clear() {
    this.succ.clear();
    this.pred.clear();
    this.node.clear();
    clear(this.graph);
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
    return true;
  }

  /**
   * Return a directed copy of the graph.
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
   * @return {!DiGraph} A deepcopy of the graph
   */
  toDirected() {
    return deepcopy(this);
  }

  /**
   * Return an undirected representation of the digraph.
   *
   * ### Notes
   *
   * If edges in both directions (u,v) and (v,u) exist in the
   * graph, attributes for the new undirected edge will be a combination of
   * the attributes of the directed edges.  The edge data is updated
   * in the (arbitrary) order that the edges are encountered.  For
   * more customized control of the edge attributes use `addEdge()`.
   *
   * This returns a "deepcopy" of the edge, node, and graph attributes which
   * attempts to completely copy all of the data and references.
   *
   * This is in contrast to the similar `var H = new jsnx.Graph(G)`
   * which returns a shallow copy of the data.
   *
   * @param {boolean=} optReciprocal
   *      If True only keep edges that appear in both directions
   *      in the original digraph.
   * @return {!Graph}
   *      An undirected graph with the same name and nodes and
   *      with edge (u,v,data) if either (u,v,data) or (v,u,data)
   *      is in the digraph.  If both edges exist in digraph and
   *      their edge data is different, only one edge is created
   *      with an arbitrary choice of which edge data to use.
   *      You must check and correct for this manually if desired.
   */
  toUndirected(optReciprocal) {
    var H = new Graph();
    H.name = this.name;
    H.addNodesFrom(this);

    var thisPred = this.pred;

    if(optReciprocal) {
      H.addEdgesFrom((function*() {
        for (var nodeData of this.adjacencyIter()) {
          var node = nodeData[0];
          var predecessors = thisPred.get(node);
          for (var nbrData of nodeData[1]) {
            if (predecessors.has(nbrData[0])) {
              yield tuple3(node, nbrData[0], deepcopy(nbrData[1]));
            }
          }
        }
      }.call(this)));
    }
    else {
      H.addEdgesFrom((function*() {
        for (var nodeData of this.adjacencyIter()) {
          for (var nbrData of nodeData[1]) {
            yield tuple3(nodeData[0], nbrData[0], deepcopy(nbrData[1]));
          }
        }
      }.call(this)));
    }

    H.graph = deepcopy(this.graph);
    H.node = deepcopy(this.node);
    return H;
  }

  /**
   * Return the reverse of the graph.
   *
   * The reverse is a graph with the same nodes and edges
   * but with the directions of the edges reversed.
   *
   * @param {boolean=} optCopy (default=True)
   *      If True, return a new DiGraph holding the reversed edges.
   *      If False, reverse the reverse graph is created using
   *      the original graph (this changes the original graph).
   *
   * @return {!DiGraph} A copy of the graph or the graph itself
   */
  reverse(optCopy=true) {
    var H;
    if(optCopy) {
      H = new this.constructor(null, {name: 'Reverse of (' + this.name + ')'});
      H.addNodesFrom(this);
      H.addEdgesFrom(mapIterator(
        this.edgesIter(null, true),
        edge => tuple3c(edge[1], edge[0], deepcopy(edge[2]), edge)
      ));
      H.graph = deepcopy(this.graph);
      H.node = deepcopy(this.node);
    }
    else {
      var thisPred = this.pred;
      var thisSucc = this.succ;

      this.succ = thisPred;
      this.pred = thisSucc;
      this.adj = this.succ;
      H = this;
    }
    return H;
  }

  /**
   * Return the subgraph induced on nodes in `nbunch`.
   *
   * The induced subgraph of the graph contains the nodes in `nbunch`
   * and the edges between those nodes.
   *
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
   *      A container of nodes which will be iterated through once.
   * @return {DiGraph} A subgraph of the graph with the same edge
   *   attributes.
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
    var HSucc = H.succ;
    var HPred = H.pred;

    // add nodes
    for (n of H) {
      HSucc.set(n, new Map());
      HPred.set(n, new Map());
    }
    // add edges
    for (var unbrs of HSucc) {
      var [u, Hnbrs] = unbrs;
      for (var vdataddict of this.succ.get(u)) {
        var [v, datadict] = vdataddict;
        if (HSucc.has(v)) {
          // add both representations of edge: u-v and v-u
          Hnbrs.set(v, datadict);
          HPred.get(v).set(u, datadict);
        }
      }
    }
    H.graph = this.graph;
    return H;
  }
}
