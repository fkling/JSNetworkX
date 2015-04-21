'use strict';

import Graph from './Graph';
import JSNetworkXError from '../exceptions/JSNetworkXError';

import {
  Map,
  Set,
  clone,
  deepcopy,
  forEach,
  getDefault,
  isArrayLike,
  isPlainObject,
  mapIterator,
  nodesAreEqual,
  sprintf,
  tuple2
} from '../_internals';

/**
 * An undirected graph class that can store multiedges.
 *
 * Multiedges are multiple edges between two nodes.  Each edge
 * can hold optional data or attributes. A MultiGraph holds undirected edges.
 * Self loops are allowed.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * ### Examples
 *
 * Create an empty graph structure (a "null graph") with no nodes and no edges.
 *
 * ```
 * var G = jsnx.MultiGraph();
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
 * var H = jsnx.Graph();
 * H.addPath([0,1,2,3,4,5,6,7,8,9]);
 * G.addNodesFrom(h);
 * ```
 *
 * In addition to strings and integers, any object that implements a custom
 * `toString` method can be used as node. For example, arrays:
 *
 * ```
 * G.addNode([1,2]);
 * ```
 *
 * #### Edges
 *
 * A graph can also be grown by adding edges.
 *
 * Add one edge,
 *
 * ```
 * G.addEdge(1, 2);
 * ```
 *
 * a list or collection of edges,
 *
 * ```
 * G.addEdgesFrom([[1,2], [1,3]]);
 * G.addEdgesFrom(H.edges());
 * ```
 *
 * If some edges connect nodes not yet in the graph, the nodes are added
 * automatically. If an edge already exists, an addition edge is created and
 * stored using a key to identify the edge. By default, the key is the lowest
 * unused integer.
 *
 * ```
 * G.addEdgesFrom([[4,5,{route: 282}], [4,5,{route: 37}]]);
 * G.get(4);
 * // Map { 3: {0: {}}, 5: {0: {}, 1: {route: 282}, 2: {route: 37}}}
 * ```
 *
 * #### Attributes
 *
 * Each graph, node and edge can hold key/value attribute pairs in an associated
 * attribute "dictionary" (object). By defauly these are empty, but can be added
 * or changed using `addEdge` or `addNode`.
 *
 * ```
 * var G = jsnx.MultiGraph(null, {day: Friday}):
 * G.graph
 * // {day: 'Friday'}
 *
 * G.addNode(1, {time: '5pm'});
 * G.addNodesFrom([3], {time: '2pm'});
 * G.nodes(true);
 * // [[1, {time: '5pm'}], [3, {time: '2pm'}]]
 * ```
 *
 * @see Graph
 * @see DiGraph
 * @see MultiDiGraph
 *
 */
export default class MultiGraph extends Graph {

  /**
   * @param {?} optData Data to initialze graph.
   *      If no data is provided, an empty graph is created. The data can be
   *      an edge list or any graph object.
   * @param {Object=} optAttr Attributes to add to graph as key=value pairs.
   */
  constructor(optData, optAttr) {
    super(optData, optAttr);
  }

  /**
   * Holds the graph type (class) name for information.
   * This is compatible to Pythons __name__ property.
   *
   * @type {string}
   */
  static get __name__() {
    return 'MultiGraph';
  }

  /**
   * Add an edge between u and v.
   *
   * The nodes u and v will be automatically added if they are
   * not already in the graph.
   *
   * Edge attributes can be specified with keywords or by providing
   * a dictionary with key/value pairs.
   *
   * ### Notes:
   *
   * To replace/update edge data, use the optional key argument
   * to identify a unique edge.  Otherwise a new edge will be created.
   *
   * NetworkX algorithms designed for weighted graphs cannot use
   * multigraphs directly because it is not clear how to handle
   * multiedge weights.  Convert to Graph using edge attribute
   * 'weight' to enable weighted graph algorithms.
   *
   * ### Example
   *
   * The following all add the edge [1,2] to the graph G:
   *
   * ```
   * var G = jsnx.MultiGraph();
   * var e = [1,2];
   * G.addEdge(1, 2);
   * G.addEdge.apply(G, e);
   * G.addEdgesFrom([e]);
   * ```
   * Associate data to edges by passing a data object:
   *
   * ```
   * G.addEdge(1, 2, {weight: 3});
   * G.addEdge(1, 2, 0, {weight: 4}); // update data for key=0
   * G.addEdge(1, 3, {weight: 7, capacity: 15, length: 342.7});
   * ```
   * @see #addEdgesFrom
   *
   * @param {Node} u node
   * @param {Node} v node
   * @param {?(number|string)=} optKey identifier
   *      Used to distinguish multiedges between a pair of nodes. Default is
   *      the lowest unused integer.
   * @param {?Object=} optAttrDict  Dictionary of edge attributes.
   *      Key/value pairs will update existing data associated with the edge.
   */
  addEdge(u, v, optKey, optAttrDict) {
    var type = typeof optKey;
    if (optKey != null && type !== 'number' && type !== 'string') {
      optAttrDict = optKey;
      optKey = null;
    }

    // set up attribute dict
    if (optAttrDict && !isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The optAttrDict argument must be an object.');
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

    var keydict;
    if (this.adj.get(u).has(v)) {
      keydict = this.adj.get(u).get(v);
      if (optKey == null) {
        // find a unique integer key
        // other methods might be better here?
        optKey = Object.keys(keydict).length;
        while (keydict[optKey]) { // ok, because values are objects only
          optKey += 1;
        }
      }
      var datadict = keydict[optKey] || {};
      keydict[optKey] = Object.assign(datadict, optAttrDict);
    }
    else {
      // selfloops work this way without special treatment
      if (optKey == null) {
        optKey = 0;
      }
      keydict = Object.create(null);
      keydict[optKey] = Object.assign({}, optAttrDict);
      this.adj.get(u).set(v, keydict);
      this.adj.get(v).set(u, keydict);
    }
  }

  /**
   * Add all the edges in `ebunch`.
   *
   * Adding the same edge twice has no effect but any edge data will be updated
   * when each duplicate edge is added.
   *
   * Edge attributes specified in edges as a tuple take precedence over the
   * attributes specified generally.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addEdgesFrom([[0,1], [1,2]]);
   * ```
   *
   * Associate data to edges
   *
   * ```
   * G.addEdgesFrom([[1,2], [2,3]], {weight: 3});
   * G.addEdgesFrom([[1,2], [2,3]], {label: 'WN2898'});
   * ```
   *
   * @see #addEdge
   * @see #addWeightedEdgesFrom
   *
   *
   * @param {Iterable} ebunch container of edges
   *      Each edge given in the container will be added to the
   *      graph. The edges can be:
   *
   *          - 2-tuples (u,v) or
   *          - 3-tuples (u,v,d) for an edge attribute dict d or
   *          - 4-tuples (u,v,k,d) for an edge identified by key k
   *
   * @param {Object=} optAttrDict Dictionary of edge attributes.
   *       Key/value pairs will update existing data associated with each edge.
   */
  addEdgesFrom(ebunch, optAttrDict) {
    if (optAttrDict && !isPlainObject(optAttrDict)) {
      throw new JSNetworkXError('The optAttrDict argument must be an object.');
    }

    // process ebunch
    forEach(ebunch, edge => {
      var u;
      var v;
      var key;
      var data;

      switch (edge.length) {
        case 4:
          u = edge[0];
          v = edge[1];
          key = edge[2];
          data = edge[3];
          break;
        case 3:
          u = edge[0];
          v = edge[1];
          data = edge[2];
          break;
        case 2:
          u = edge[0];
          v = edge[1];
          break;
        default:
          if (!isArrayLike(edge)) {
            throw new TypeError('Elements in edgelists must be tuples.');
          }
          throw new JSNetworkXError(sprintf(
            'Edge tuple %j must be a 2-tuple, 3-tuple or 4-tuple.',
            edge
          ));
      }

      var keydict = this.adj.has(u) ?
        this.adj.get(u).get(v) || Object.create(null) :
        Object.create(null);

      if (key == null) {
        // find a unique integer key
        // other methods might be better here?
        key = Object.keys(keydict).length;
        while (keydict[key]) {
          key += 1;
        }
      }
      var datadict = keydict[key] || {};
      Object.assign(datadict, optAttrDict, data);
      this.addEdge(u, v, key, datadict);
    });
  }

  /**
   * Remove an edge between u and v.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * G.removeEdge(0, 1);
   * ```
   *
   * For multiple edges
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addEdgesFrom([[1,2], [1,2], [1,2]]);
   * G.removeEdge(1, 2); // remove a single edge
   * ```
   *
   * For edges with keys
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addEdge(1, 2, 'first');
   * G.addEdge(1, 2, 'second');
   * G.removeEdge(1, 2, 'second');
   * ```
   *
   * @see #removeEdgesFrom
   *
   * @param {Node} u
   * @param {Node} v
   * @param {(number|string)=} optKey
   *      Used to distinguish multiple edges between a pair of nodes.
   *      If null or undefined remove a single (arbitrary) edge between u and v.
   */
  removeEdge(u, v, optKey) {
    var keydict;
    var neightborsOfU = this.adj.get(u);
    if (neightborsOfU) {
      keydict = neightborsOfU.get(v);
    }
    if (keydict == null) {
      throw new JSNetworkXError(
        sprintf('The edge %j-%j is not in the graph', u, v)
      );
    }

    // remove the edge with specified data
    if (optKey == null) {
      for (var key in keydict) {
        delete keydict[key];
        break;
      }
    }
    else {
      if (!keydict[optKey]) {
        throw new JSNetworkXError(sprintf(
          'The edge %j-%j with key %j is not in the graph',
          u,
          v,
          optKey
        ));
      }
      delete keydict[optKey];
    }
    if (Object.keys(keydict).length === 0) {
      // remove the key entries if last edge
      neightborsOfU.delete(v);
      if (!nodesAreEqual(u, v)) {
        this.adj.get(v).delete(u);
      }
    }
  }

  /**
   * Remove all edges specified in `ebunch`.
   *
   * Will fail silently if an edge in `ebunch` is not in the graph.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * var ebunch = [[1,2], [2,3]];
   * G.removeEdgesFrom(ebunch);
   * ```
   *
   * Removing multiple copies of edges.
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addEdgesFrom([[1,2], [1,2], [1,2]]);
   * G.removeEdgesFrom([[1,2], [1,2]]);
   * G.edges();
   * // [[1,2]]
   * ```
   *
   * @see #removeEdge
   *
   * @param {?} ebunch list or container of edge tuples
   *      Each edge given in the list or container will be removed
   *      from the graph. The edges can be:
   *
   *        - 2-tuples (u,v) All edges between u and v are removed.
   *        - 3-tuples (u,v,key) The edge identified by key is removed.
   */
  removeEdgesFrom(ebunch) {
   forEach(ebunch, edge => {
      try {
        this.removeEdge(edge[0], edge[1], edge[2]);
      }
      catch(ex) {
        if (!(ex instanceof JSNetworkXError)) {
          throw ex;
        }
      }
    });
  }

  /**
   * Return True if the graph has an edge between nodes u and v.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * G.hasEdge(0,1);
   * // true
   * G.addEdge(0, 1, 'a');
   * G.hasEdge(0, 1, 'a');
   * // true
   * ```
   *
   * The following syntax are equivalent:
   *
   * ```
   * G.hasEdge(0, 1);
   * // true
   * G.get(0).has(1);
   * // true
   * ```
   *
   * @param {Node} u node
   * @param {Node} v node
   * @param {(string|number)=} optKey If specified return true only
   *      if the edge with key is found.
   *
   * @return {boolean} true if edge is in the graph, false otherwise.
   */
  hasEdge(u, v, optKey) {
    var neighborsOfU = this.adj.get(u);
    if (neighborsOfU) {
      return neighborsOfU.has(v) &&
        (optKey == null || !!neighborsOfU.get(v)[optKey]);
    }
    return false;
  }

  /**
   * Return a list of edges.
   *
   * Edges are returned as tuples with optional data and keys in the order
   * (node, neighbor, key, data).
   *
   * Nodes in `nbunch` that are not in the graph will be (quietly) ignored.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * G.edges();
   * // [[0,1], [1,2], [2,3]]
   * G.edges(true);
   * // [[0,1,{}], [1,2,{}], [2,3,{}]]
   * G.edges(false, true);
   * // [[0,1,0], [1,2,0], [2,3,0]]
   * G.edges(true, true);
   * // [[0,1,0,{}], [1,2,0,{}], [2,3,0,{}]]
   * G.edges([0,3]);
   * // [[0,1], [3, 2]]
   * G.edges(0);
   * // [[0,1]]
   * ```
   *
   * @see #edgesIter
   *
   * @param {?NodeContainer=} optNbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} optData (default=False)
   *      Return two tuples (u,v) (False) or three-tuples (u,v,data) (True).
   * @param {?boolean=} optKeys (default=False)
   *      Return two tuples (u,v) (False) or three-tuples (u,v,key) (True).
   *
   * @return {!Array} list of edge tuples
   *      Edges that are adjacent to any node in nbunch, or a list
   *      of all edges if nbunch is not specified.
   */
  edges(optNbunch, optData, optKeys) {
    return Array.from(this.edgesIter(optNbunch, optData, optKeys));
  }


  /**
   * Return an iterator over edges.
   *
   * Edges are returned as tuples with optional data and keys
   * in the order (node, neighbor, key, data).
   *
   * Nodes in nbunch that are not in the graph will be (quietly) ignored.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * Array.from(G.edgesIter);
   * // [[0,1], [1,2], [2,3]]
   * Array.from(G.edges(true));
   * // [[0,1,{}], [1,2,{}], [2,3,{}]]
   * Array.from(G.edges(false, true));
   * // [[0,1,0], [1,2,0], [2,3,0]]
   * Array.from(G.edges(true, true));
   * // [[0,1,0,{}], [1,2,0,{}], [2,3,0,{}]]
   * Array.from(G.edges([0,3]));
   * // [[0,1], [3, 2]]
   * Array.from(G.edges(0));
   * // [[0,1]]
   * ```
   *
   * @see #edges
   *
   * @param {?(NodeContainer|boolean)=} optNbunch A container of nodes.
   *      The container will be iterated through once.
   * @param {?boolean=} optData (default=False)
   *      If True, return edge attribute dict with each edge.
   * @param {?boolean=} optKeys (default=False)
   *      If True, return edge keys with each edge.
   *
   * @return {!Iterator}
   *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
   *
   * @override
   * @export
   */
  *edgesIter(optNbunch, optData=false, optKeys=false) {
    if (typeof optNbunch === 'boolean') {
      optKeys = optData;
      optData = optNbunch;
      optNbunch = null;
    }

    var seen = new Set();

    var nodesNbrs = optNbunch == null ?
      this.adj :
      mapIterator(this.nbunchIter(optNbunch), n => tuple2(n, this.adj.get(n)));

    for (var [n, nbrs] of nodesNbrs) {
      for (var [nbr, keydict] of nbrs) {
        if (!seen.has(nbr)) {
          for (var key in keydict) {
            var tuple = [n, nbr];
            if (optKeys) {
              tuple[2] = key;
            }
            if (optData) {
              tuple.push(keydict[key]);
            }
            yield tuple;
          }
          seen.add(n);
        }
      }
    }
  }

  /**
   * Return the attribute dictionary associated with edge (u,v).
   *
   * ### Example
   *
   * ```
   * var G = jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * G.getEdgeData(0, 1);
   * // {0: {}}
   * G.getEdgeData('a', 'b', null, 0); // edge not in graph, return 0
   * // 0
   * ```
   *
   * @param {Node} u node
   * @param {Node} v node
   * @param {(string|number)=} optKey Return data only for the edge with
   *      specified key.
   * @param {T=} optDefault Value to return if the edge (u,v) is not found.
   *
   * @return {(Object|T)} The edge attribute dictionary.
   * @template T
   */
  getEdgeData(u, v, optKey, optDefault) {
    var neightborsOfU = this.adj.get(u);
    if (neightborsOfU) {
      if (optKey == null) {
        return neightborsOfU.get(v) || optDefault;
      }
      return neightborsOfU.has(v) && neightborsOfU.get(v)[optKey] || optDefault;
    }
  }

  /**
   * Return an iterator for (node, degree).
   *
   * The node degree is the number of edges adjacent to the node.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.Graph();
   * G.addPath([0,1,2,3]);
   * Array.from(G.degreeIter(0));
   * // [[0,1]]  // node 0 with degree 1
   * Array.from(G.degreeIter([0,1]));
   * // [[0,1], [1,2]]
   *
   * @see #degree
   *
   * @param {?(Node|NodeContainer)=} optNbunch  A container of nodes
   *      The container will be iterated through once.
   * @param {?string=} optWeight  The edge attribute that holds the numerical
   *      value used as a weight.  If undefined, then each edge has weight 1.
   *      The degree is the sum of the edge weights adjacent to the node.
   *
   * @return {!Iterator} The iterator returns two-tuples of (node, degree).
   */
  *degreeIter(optNbunch, optWeight) {
    if (typeof optNbunch === 'string') {
      optWeight = optNbunch;
      optNbunch = null;
    }
    var nodesNbrs = optNbunch == null ?
      this.adj :
      mapIterator(this.nbunchIter(optNbunch), n => tuple2(n, this.adj.get(n)));

    for (let [n, nbrs] of nodesNbrs) {
      /*eslint no-loop-func:0*/
      var deg = 0;
      if (optWeight == null) {
        nbrs.forEach(keydict => deg += Object.keys(keydict).length);
        yield [n, deg + (+(nbrs.has(n) && Object.keys(nbrs.get(n)).length))];
      } else {
        // edge weighted graph - degree is sum of nbr edge weights
        nbrs.forEach(keydict => {
          for (var key in keydict) {
            deg += getDefault(keydict[key][optWeight], 1);
          }
        });

        if (nbrs.has(n)) {
          var keydict = nbrs.get(n);
          for (var key in keydict) {
            deg += getDefault(keydict[key][optWeight], 1);
          }
        }

        yield [n, deg];
      }
    }
  }

  /**
   * Return true if graph is a multigraph, false otherwise.
   *
   * @return {boolean} true if graph is a multigraph, false otherwise.
   */
  isMultigraph() {
    return true;
  }

  /**
   * Return true if graph is directed, false otherwise.
   *
   * @return {boolean}  True if graph is directed, False otherwise.
   */
  isDirected() {
    return false;
  }

  /**
   * Return a directed representation of the graph.
   *
   * ### Notes
   *
   * This returns a "deepcopy" of the edge, node, and graph attributes which
   * attempts to completely copy all of the data and references.
   *
   * This is in contrast to the similar D = DiGraph(G) which returns a shallow
   * copy of the data.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1]);
   * var H = G.toDirected();
   * G.edges();
   * // [[0,1], [1,0]]
   * ```
   *
   * If already directed, return a (deep) copy
   *
   * ```
   * var G = new jsnx.MultiDiGraph();
   * G.addPath([0,1]);
   * var H = G.toDirected();
   * G.edges();
   * // [[0,1]]
   * ```
   *
   * @return {!MultiDiGraph}
   *      A directed graph with the same name, same nodes, and with
   *      each edge (u,v,data) replaced by two directed edges
   *      (u,v,data) and (v,u,data).
   */
  toDirected() {
    var G = new (require('./MultiDiGraph'))();
    G.addNodesFrom(this);
    for (var [u, nbrs] of this.adjacencyIter()) {
      for (var [v, keydict] of nbrs) {
        for (var key in keydict) {
            G.addEdge(u, v, key, deepcopy(keydict[key]));
        }
      }
    }
    G.graph = deepcopy(this.graph);
    G.node = deepcopy(this.node);
    return G;
  }

  /**
   * Return a list of selfloop edges.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addEdge(1, 1);
   * G.addEdge(1, 2);
   * G.selfloopEdges();
   * // [[1,1]]
   * G.selfloopEdges(true);
   * // [[1,1,{}]]
   * G.selfloopEdges(false, true);
   * // [[1,1,0]]
   * G.selfloopEdges(true, true);
   * // [[1,1,0,{}]]
   * ```
   *
   * @see #nodesWithSelfloops
   * @see #numberOfSelfloops
   *
   *
   * @param {boolean=} optData  (default=False)
   *      Return selfloop edges as two tuples (u,v) (data=False)
   *      or three-tuples (u,v,data) (data=True)
   * @param {boolean=} optKeys  (default=False)
   *       If True, return edge keys with each edge
   *
   * @return {Array} A list of all selfloop edges
   */
  selfloopEdges(optData=false, optKeys=false) {
    var edges = [];
    for (var [n, nbrs] of this.adj)
      if (nbrs.has(n)) {
        var keydict = nbrs.get(n);
        for (var key in keydict) {
          var edge = [n, n];
          if (optKeys) {
            edge[2] = key;
          }
          if (optData) {
            edge.push(keydict[key]);
          }
          edges.push(edge);
        }
      }
    return edges;
  }

  /**
   * Return the number of edges between two nodes.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.MultiGraph();
   * G.addPath([0,1,2,3]);
   * G.numberOfEdges();
   * // 3
   * G.numberOfEdges(0,1);
   * // 1
   * ```
   *
   * @see #size
   *
   * @param {Node=} optU node
   * @param {Node=} optV node
   *      If u and v are specified, return the number of edges between
   *      u and v. Otherwise return the total number of all edges.
   *
   * @return {number} The number of edges in the graph.
   *      If nodes u and v are specified return the number of edges between
   *      those nodes.
   */
  numberOfEdges(optU, optV) {
    if (optU == null || optV == null) {
      return this.size();
    }

    var neightborsOfU = this.get(optU);
    if (neightborsOfU) {
      return neightborsOfU.has(optV) ?
        Object.keys(neightborsOfU.get(optV)).length :
        0;
    }
    return 0;
  }

  /**
   * Return the subgraph induced on nodes in nbunch.
   *
   * The induced subgraph of the graph contains the nodes in nbunch and the
   * edges between those nodes.
   *
   * ### Notes
   *
   * The graph, edge or node attributes just point to the original graph.
   * So changes to the node or edge structure will not be reflected in
   * the original graph while changes to the attributes will.
   *
   * To create a subgraph with its own copy of the edge/node attributes use:
   * `jsnx.Graph(G.subgraph(nbunch))`
   *
   * If edge attributes are containers, a deep copy can be obtained using:
   * `G.subgraph(nbunch).copy()`.
   *
   * ### Example
   *
   * ```
   * var G = new jsnx.Graph();
   * G.addPath([0,1,2,3]);
   * var H = G.subgraph([0,1,2]);
   * H.edges();
   * // [[0,1], [1,2]]
   * ```
   *
   * @param {NodeContainer=} nbunch A container of nodes which will be
   *      iterated through once.
   * @return {MultiGraph} A subgraph of the graph with the same edge attributes.
   */
  subgraph(nbunch) {
    var bunch = this.nbunchIter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor();
    // copy node and attribute dictionaries
    this.node.forEach((d, n) => H.node.set(n, d));
    // namespace shortcuts for speed
    var HAdj = H.adj,
    thisAdj = this.adj;

    // add nodes and edges (undirected method)
    for (var n of bunch) {
      var Hnbrs = new Map();
      HAdj.set(n, Hnbrs);

      for (var [nbr, edgedict] of thisAdj.get(n)) {
        if (HAdj.has(nbr)) {
          // add both representations of edge: n-nbr and nbr-n
          // they share the same edgedict
          var ed = clone(edgedict);
          Hnbrs.set(nbr, ed);
          HAdj.get(nbr).set(n, ed);
        }
      }
    }
    H.graph = this.graph;
    return H;
  }
}
