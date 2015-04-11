'use strict';
/**
 * This module provides functions to convert
 * NetworkX graphs to and from other formats.
 *
 * The preferred way of converting data to a NetworkX graph
 * is through the graph constuctor.  The constructor calls
 * the to_networkx_graph() function which attempts to guess the
 * input type and convert it automatically.
 */

import * as convertMap from './contrib/convert';
import prepCreateUsing from './contrib/prepCreateUsing';
import _mapValues from 'lodash/object/mapValues';

import {
  Map,
  Set,
  clone,
  forEach,
  isMap,
  isArrayLike,
  isPlainObject
} from './_internals';

var hasOwn = Object.prototype.hasOwnProperty;

/**
 * Make a JSNetworkX graph from a known data structure.
 *
 * The preferred way to call this is automatically from the class constructor
 *
 * ```
 * var data = {0: {1 : {weight: 1}}} // object of objects single edge (0,1)
 * var G = new jsnx.Graph(d);
 * ```
 *
 * instead of the equivalent
 *
 * ```
 * var G = jsnx.fromDictOfDicts(d);
 * ```
 *
 * @param {?} data An object to be converted
 *   Current accepts types are:
 *
 *   - any JSNetworkX graph
 *   - object of objects
 *   - object of lists
 *   - list of edges
 *
 * @param {Graph=} optCreateUsing NetworkX graph
 *     Use specified graph for result.  Otherwise a new graph is created.
 * @param {boolean=} optMultigraphInput
 *     If `true` and  `data` is an object of objects,
 *     try to create a multigraph assuming object of objects of lists
 *     If data and createUsing are both multigraphs then create
 *     a multigraph from a multigraph.
 * @return {Graph}
 */
export function toNetworkxGraph(
  data,
  optCreateUsing,
  optMultigraphInput=false
) {
  var result = null;

  // jsnx graph
  if (hasOwn.call(data, 'adj')) {
    try {
      result = convertMap.fromMapOfMaps(
        data.adj,
        optCreateUsing,
        data.isMultigraph()
      );
      if (hasOwn.call(data, 'graph') && typeof data.graph === 'object') {
        result.graph = clone(data.graph);
      }
      if (hasOwn.call(data, 'node') && isMap(data.node)) {
        result.node = new Map();
        data.node.forEach(
          (element, k) => result.node.set(k, clone(element))
        );
      }
      return result;
    }
    catch(ex) {
      throw ex;
    }
  }

  // map of maps / lists
  if (isMap(data)) {
    try {
      return convertMap.fromMapOfMaps(
        data,
        optCreateUsing,
        optMultigraphInput
      );
    }
    catch(e) {
      try {
        return convertMap.fromMapOfLists(data, optCreateUsing);
      }
      catch(ex) {
        throw new Error('Map data structure cannot be converted to a graph.');
      }
    }
  }

  // dict of dicts / lists
  if (isPlainObject(data)) {
    try {
      return fromDictOfDicts(
        data,
        optCreateUsing,
        optMultigraphInput
      );
    }
    catch(e) {
      try {
        return fromDictOfLists(data, optCreateUsing);
      }
      catch(ex) {
        throw new Error(
          'Object data structure cannot be converted to a graph.'
        );
      }
    }
  }

  // list of edges
  if (isArrayLike(data)) {
    try {
      return fromEdgelist(data, optCreateUsing);
    }
    catch(e) {
      throw new Error('Input is not a valid edge list');
    }
  }

  return result;
}

/**
 * Return a new undirected representation of the graph G.
 *
 * @param {Graph} G Graph to convert
 * @return {!Graph}
 */
export function convertToUndirected(G) {
  return G.toUndirected();
}

/**
 * Return a new directed representation of the graph G.
 *
 * @param {Graph} G Graph to convert
 * @return {!Graph}
 */
export function convertToDirected(G) {
  return G.toDirected();
}

/**
 * Return adjacency representation of graph as a dictionary of lists.
 *
 * Completely ignores edge data for MultiGraph and MultiDiGraph.
 *
 * @param {Graph} G A JSNetworkX graph
 * @param {Iterable=} optNodelist Use only nodes specified in nodelist
 *
 * @return {!Object.<Array>}
 */
export function toDictOfLists(G, optNodelist) {
  var contains = function(n) {
    return optNodelist.indexOf(n) > -1;
  };
  var d = Object.create(null);

  if (optNodelist == null) {
    optNodelist = G;
    contains = function(n) {
      return optNodelist.hasNode(n);
    };
  }
  else {
    optNodelist = Array.from(optNodelist);
  }

  for (let n of optNodelist) {
    d[n] = G.neighbors(n).filter(contains);
  }

  return d;
}

/**
 * Return a graph from a dictionary of lists.
 *
 * ### Examples
 *
 * ```
 * var data = {0: [1]}; // single edge (0,1)
 * var G = jsnx.fromDictOfLists(data);
 * // or
 * var G = new jsnx.Graph(data);
 * ```
 *
 * @param {!Object.<Array>} d A dictionary of lists adjacency representation.
 * @param {Graph=} optCreateUsing Use specified graph for result.
 *    Otherwise a new graph is created.
 * @return {!Graph}
 */
export function fromDictOfLists(d, optCreateUsing) {
  var G = prepCreateUsing(optCreateUsing);

  // Convert numeric property names to numbers
  G.addNodesFrom((function*() {
    for (var n in d) {
      yield isNaN(n) ? n : +n;
    }
  })());

  var node;
  var nbrlist;
  if(G.isMultigraph() && !G.isDirected()) {
    // a dict_of_lists can't show multiedges.  BUT for undirected graphs,
    // each edge shows up twice in the dict_of_lists.
    // So we need to treat this case separately.
    var seen = new Set();

    for (node in d) {
      nbrlist = d[node];
      // treat numeric keys like numbers
      node = isNaN(node) ? node : +node;
      /*eslint no-loop-func:0*/
      forEach(nbrlist, function(nbr) {
        if (!seen.has(nbr)) {
          G.addEdge(node, nbr);
        }
      });
      seen.add(node); // don't allow reverse edge to show up
    }
  }
  else {
    var edgeList = [];
    for (node in d) {
      nbrlist = d[node];
      // treat numeric keys like numbers
      node = isNaN(node) ? node : +node;
      forEach(nbrlist, function(nbr) {
        edgeList.push([node, nbr]);
      });
    }

    G.addEdgesFrom(edgeList);
  }

  return G;
}

/**
 * Return adjacency representation of graph as a dictionary of dictionaries.
 *
 * @param {Graph} G A jsnx Graph
 * @param {Iterable=} optNodelist Use only nodes specified in nodelist
 * @param {Object=} optEdgeData If provided,  the value of the dictionary will
 *      be set to edgeData for all edges.  This is useful to make
 *      an adjacency matrix type representation with 1 as the edge data.
 *      If edgedata is null or undefined, the edgedata in G is used to fill
 *      the values.
 *      If G is a multigraph, the edgedata is a dict for each pair (u,v).
 * @return {!Object.<Object>}
 */
export function toDictOfDicts(G, optNodelist, optEdgeData) {
  var dod = {};

  if (optNodelist != null) {
    optNodelist = Array.from(optNodelist);
    if(optEdgeData != null) {
      optNodelist.forEach(function(u) {
        dod[u] = {};
        G.get(u).forEach(function(data, v) {
          if (optNodelist.indexOf(v) > -1) {
            dod[u][v] = optEdgeData;
          }
        });
      });
    }
    else { // nodelist and edgeData are defined
      optNodelist.forEach(function(u) {
        dod[u] = {};
        G.get(u).forEach(function(data, v) {
          if (optNodelist.indexOf(v) > -1) {
            dod[u][v] = data;
          }
        });
      });
    }
  }
  else { // nodelist is undefined
    if(optEdgeData != null) {
      // dn = [nbrdict, u]
      for (let [nbrdict, u] of G.adjacencyIter()) {
        /*jshint loopfunc:true*/
        dod[u] = _mapValues(nbrdict, function() {
          return optEdgeData;
        });
      }
    }
    else { // edge_data is defined
      // dn = [nbrdict, u]
      for (let [nbrdict, u] of G.adjacencyIter()) {
        dod[u] = clone(nbrdict);
      }
    }
  }

  return dod;
}

/**
 * Return a graph from a dictionary of dictionaries.
 *
 *
 * ### Examples
 *
 * ```
 * var data = {0: {1: {weight: 1}}}; // single edge (0,1)
 * var G = jsnx.fromDictOfDicts(data);
 * // or
 * var G = new jsnx.Graph(data);
 * ```
 *
 * @param {!Object.<!Object>} d A dictionary of dictionaries adjacency
 *      representation.
 * @param {Graph=} optCreateUsing Use specified graph for result.
 *      Otherwise a new graph is created.
 * @param {boolean=} optMultigraphInput
 *      When `true`, the values of the inner object are assumed
 *      to be containers of edge data for multiple edges.
 *      Otherwise this routine assumes the edge data are singletons.
 *
 * @return {Graph}
 */
export function fromDictOfDicts(d, optCreateUsing, optMultigraphInput=false) {
  var G = prepCreateUsing(optCreateUsing);
  var seen = new Set();

  // Convert numeric property names to numbers
  G.addNodesFrom((function*() {
    for (var n in d) {
      yield isNaN(n) ? n : +n;
    }
  })());

  // is dict a MultiGraph or MultiDiGraph?
  if (optMultigraphInput) {
    // make a copy  of the list of edge data (but not the edge data)
    if (G.isDirected()) {
      for (let u in d) {
        let nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (let v in nbrs) {
          let datadict = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          for (let key in datadict) {
            if (G.isMultigraph()) {
              G.addEdge(u, v, key, datadict[key]);
            }
            else {
              G.addEdge(u, v, datadict[key]);
            }
          }
        }
      }
    }
    else { // undirected
      // don't add both directions of undirected graph
      for (let u in d) {
        let nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (let v in nbrs) {
          let datadict = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          if(!seen.has([u, v])) {
            for (let key in datadict) {
              if (G.isMultigraph()) {
                G.addEdge(u, v, key, datadict[key]);
              }
              else {
                G.addEdge(u, v, datadict[key]);
              }
            }
            seen.add([v, u]);
          }
        }
      }
    }
  }
  else { // not a multigraph to multigraph transfer
    if(G.isMultigraph() && !G.isDirected()) {
      // d can have both representations u-v, v-u in dict.  Only add one.
      // We don't need this check for digraphs since we add both directions,
      // or for Graph() since it is done implicitly (parallel edges not allowed)
      for (let u in d) {
        let nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (let v in nbrs) {
          let data = nbrs[v];
          v = isNaN(v) ? v : +v;
          if (!seen.has([u, v])) {
            G.addEdge(u, v, data);
            seen.add([v, u]);
          }
        }
      }
    }
    else {
      for (let u in d) {
        let nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (let v in nbrs) {
          let data = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          G.addEdge(u, v, data);
        }
      }
    }
  }

  return G;
}

/**
 * Return a list of edges in the graph.
 *
 * @param {Graph} G A JSNetworkX graph
 * @param {Iterable=} optNodelist Use only nodes specified in nodelist
 * @return {!Array}
 */
export function toEdgelist(G, optNodelist) {
  if (optNodelist != null) {
    return G.edges(optNodelist, true);
  }
  else {
    return G.edges(null, true);
  }
}


/**
 * Return a graph from a list of edges.
 *
 * @param {Array.<Array>} edgelist Edge tuples
 * @param {Graph=} optCreateUsing Use specified graph for result.
 *      Otherwise a new graph is created.
 * @return {!Graph}
 */
export function fromEdgelist(edgelist, optCreateUsing) {
  var G = prepCreateUsing(optCreateUsing);
  G.addEdgesFrom(edgelist);
  return G;
}


// NOT IMPLEMENTED

// to_numpy_matrix
// from_numpy_matrix
// to_numpy_recarray
// to_scipy_sparse_matrix
// from_scipy_sparse_matrix
// setup_module
