/*jshint latedef:false*/
"use strict";
/**
 * This module provides functions to convert
 * NetworkX graphs to and from other formats.
 *
 * The preferred way of converting data to a NetworkX graph
 * is through the graph constuctor.  The constructor calls
 * the to_networkx_graph() function which attempts to guess the
 * input type and convert it automatically.
 */

/*jshint ignore:start*/
var Map = require('./_internals/Map');
var Set = require('./_internals/Set');
/*jshint ignore:end*/

var convertMap = require('./contrib/convert');
var clone = require('./_internals/clone');
var forEach = require('./_internals/forEach');
var hasOwn = Object.prototype.hasOwnProperty;
var isMap = require('./_internals/isMap');
var isArrayLike = require('./_internals/isArrayLike');
var isPlainObject = require('./_internals/isPlainObject');
var mapIterator = require('./_internals/itertools/mapIterator');
var prep_create_using = require('./contrib/prep_create_using');
var toArray = require('./_internals/toArray');
var toIterator = require('./_internals/itertools/toIterator');
var _mapValues = require('lodash-node/modern/objects/mapValues');

/**
 * Make a jsnx graph from a known data structure.
 *
 * @param {?} data An object to be converted
 *     Current known types are:
 *        any jsnx graph
 *        dict-of-dicts
 *        dict-of-lists
 *        list of edges
 *
 * @param {Graph=} opt_create_using NetworkX graph
 *     Use specified graph for result.  Otherwise a new graph is created.
 *
 * @param {boolean=} opt_multigraph_input (default false)
 *     If true and  data is a dict_of_dicts,
 *     try to create a multigraph assuming dict_of_dict_of_lists.
 *     If data and create_using are both multigraphs then create
 *     a multigraph from a multigraph.
 *
 * @return {Graph}
 * @export
 */
function to_networkx_graph(data, opt_create_using, opt_multigraph_input) {
  var result = null;

  // jsnx graph
  if (hasOwn.call(data, 'adj')) {
    try {
      result = convertMap.from_map_of_maps(
        data.adj,
        opt_create_using,
        data.is_multigraph()
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
      return convertMap.from_map_of_maps(
        data,
        opt_create_using,
        opt_multigraph_input
      );
    }
    catch(e) {
      try {
        return convertMap.from_map_of_lists(data, opt_create_using);
      }
      catch(ex) {
        throw new Error('Map data structure cannot be converted to a graph.');
      }
    }
  }

  // dict of dicts / lists
  if (isPlainObject(data)) {
    try {
      return from_dict_of_dicts(
        data,
        opt_create_using,
        opt_multigraph_input
      );
    }
    catch(e) {
      try {
        return from_dict_of_lists(data, opt_create_using);
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
      return from_edgelist(data, opt_create_using);
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
 * @param {jsnx.classes.Graph} G Graph to convert
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
function convert_to_undirected(G) {
  return G.to_undirected();
}

/**
 * Return a new directed representation of the graph G.
 *
 * @param {jsnx.classes.Graph} G Graph to convert
 * @return {!jsnx.classes.Graph}
 * @export
 */
function convert_to_directed(G) {
  return G.to_directed();
}

/**
 * Return adjacency representation of graph as a dictionary of lists.
 *
 * Completely ignores edge data for MultiGraph and MultiDiGraph.
 *
 * @param {jsnx.classes.Graph} G A jsnx graph
 * @param {jsnx.NodeContainer=} opt_nodelist Use only nodes specified in nodelist
 *
 * @return {!Object.<Array>}
 * @export
 */
function to_dict_of_lists(G, opt_nodelist) {
  var contains = function(n) {
    return opt_nodelist.indexOf(n) > -1;
  };
  var d = Object.create(null);

  if (opt_nodelist == null) {
    opt_nodelist = G;
    contains = function(n) {
      return opt_nodelist.has_node(n);
    };
  }
  else {
    opt_nodelist = toArray(opt_nodelist);
  }

  for (var n of opt_nodelist) {
    d[n] = G.neighbors(n).filter(contains);
  }

  return d;
}

/**
 * Return a graph from a dictionary of lists.
 * *
 * @param {!Object.<Array>} d A dictionary of lists adjacency representation.
 * @param {Graph=} opt_create_using Use specified graph for result.
 *    Otherwise a new graph is created.
 *
 * @return {!Graph}
 * @export
 */
function from_dict_of_lists(d, opt_create_using) {
  var G = prep_create_using(opt_create_using);

  // Convert numeric property names to numbers
  G.add_nodes_from((function*() {
    for (var n in d) {
      yield isNaN(n) ? n : +n;
    }
  })());

  var node;
  var nbrlist;
  if(G.is_multigraph() && !G.is_directed()) {
    // a dict_of_lists can't show multiedges.  BUT for undirected graphs,
    // each edge shows up twice in the dict_of_lists.
    // So we need to treat this case separately.
    var seen = new Set();

    for (node in d) {
      nbrlist = d[node];
      // treat numeric keys like numbers
      node = isNaN(node) ? node : +node;
      /*jshint loopfunc:true*/
      forEach(nbrlist, function(nbr) {
        if (!seen.has(nbr)) {
          G.add_edge(node, nbr);
        }
      });
      seen.add(node); // don't allow reverse edge to show up
    }
  }
  else {
    var edge_list = [];
    for (node in d) {
      nbrlist = d[node];
      // treat numeric keys like numbers
      node = isNaN(node) ? node : +node;
      forEach(nbrlist, function(nbr) {
        edge_list.push([node, nbr]);
      });
    }

    G.add_edges_from(edge_list);
  }

  return G;
}

/**
 * Return adjacency representation of graph as a dictionary of dictionaries.
 *
 * @param {jsnx.classes.Graph} G A jsnx Graph
 * @param {jsnx.NodeContainer=} opt_nodelist Use only nodes specified in nodelist
 * @param {Object=} opt_edge_data If provided,  the value of the dictionary will be
 *      set to edge_data for all edges.  This is useful to make
 *      an adjacency matrix type representation with 1 as the edge data.
 *      If edgedata is null or undefined, the edgedata in G is used to fill
 *      the values.
 *      If G is a multigraph, the edgedata is a dict for each pair (u,v).
 *
 * @return {!Object.<Object>}
 * @export
 */
function to_dict_of_dicts(G, opt_nodelist, opt_edge_data) {
  var dod = {};

  if (opt_nodelist != null) {
    opt_nodelist = toArray(opt_nodelist);
    if(opt_edge_data != null) {
      opt_nodelist.forEach(function(u) {
        dod[u] = {};
        G.get(u).forEach(function(data, v) {
          if (opt_nodelist.indexOf(v) > -1) {
            dod[u][v] = opt_edge_data;
          }
        });
      });
    }
    else { // nodelist and edge_data are defined
      opt_nodelist.forEach(function(u) {
        dod[u] = {};
        G.get(u).forEach(function(data, v) {
          if (opt_nodelist.indexOf(v) > -1) {
            dod[u][v] = data;
          }
        });
      });
    }
  }
  else { // nodelist is undefined
    if(opt_edge_data != null) {
      // dn = [nbrdict, u]
      for (var dn of G.adjacency_iter()) {
        /*jshint loopfunc:true*/
        dod[dn[1]] = _mapValues(dn[0], function() {
          return opt_edge_data;
        });
      }
    }
    else { // edge_data is defined
      // dn = [nbrdict, u]
      for (var dn of G.adjacency_iter()) {
        dod[dn[1]] = clone(dn[0]);
      }
    }
  }

  return dod;
}

/**
 * Return a graph from a dictionary of dictionaries.
 *
 * @param {!Object.<!Object>} d A dictionary of dictionaries adjacency 
 *      representation.
 * @param {jsnx.classes.Graph=} opt_create_using Use specified graph for result.
 *      Otherwise a new graph is created.
 * @param {boolean=} opt_multigraph_input (default=False)
 *      When True, the values of the inner dict are assumed
 *      to be containers of edge data for multiple edges.
 *      Otherwise this routine assumes the edge data are singletons.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
function from_dict_of_dicts(d, opt_create_using, opt_multigraph_input) {
  var G = prep_create_using(opt_create_using);
  var seen = new Set();

  // Convert numeric property names to numbers
  G.add_nodes_from((function*() {
    for (var n in d) {
      yield isNaN(n) ? n : +n;
    }
  })());

  // is dict a MultiGraph or MultiDiGraph?
  if (opt_multigraph_input) {
    // make a copy  of the list of edge data (but not the edge data)
    if (G.is_directed()) {
      for (var u in d) {
        var nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (var v in nbrs) {
          var datadict = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          for (var key in datadict) {
            if (G.is_multigraph()) {
              G.add_edge(u, v, key, datadict[key]);
            }
            else {
              G.add_edge(u, v, datadict[key]);
            }
          }
        }
      }
    }
    else { // undirected
      // don't add both directions of undirected graph
      for (var u in d) {
        var nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (var v in nbrs) {
          var datadict = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          if(!seen.has([u, v])) {
            for (var key in datadict) {
              if (G.is_multigraph()) {
                G.add_edge(u, v, key, datadict[key]);
              }
              else {
                G.add_edge(u, v, datadict[key]);
              }
            }
            seen.add([v, u]);
          }
        }
      }
    }
  }
  else { // not a multigraph to multigraph transfer
    if(G.is_multigraph() && !G.is_directed()) {
      // d can have both representations u-v, v-u in dict.  Only add one.
      // We don't need this check for digraphs since we add both directions,
      // or for Graph() since it is done implicitly (parallel edges not allowed)
      for (var u in d) {
        var nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (var v in nbrs) {
          var datadict = nbrs[v];
          v = isNaN(v) ? v : +v;
          if (!seen.has([u, v])) {
            G.add_edge(u, v, data);
            seen.add([v, u]);
          }
        }
      }
    }
    else {
      for (var u in d) {
        var nbrs = d[u];
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Inner object seems to be an array');
        }
        // treat numeric keys like numbers
        u = isNaN(u) ? u : +u;
        for (var v in nbrs) {
          var datadict = nbrs[v];
          // treat numeric keys like numbers
          v = isNaN(v) ? v : +v;
          G.add_edge(u, v, data);
        }
      }
    }
  }

  return G;
}

/**
 * Return a list of edges in the graph.
 *
 * @param {jsnx.classes.Graph} G A jsnx graph
 * @param {jsnx.NodeContainer=} opt_nodelist Use only nodes specified in nodelist
 *
 * @return {!Array}
 * @export
 */
function to_edgelist(G, opt_nodelist) {
  if (opt_nodelist != null) {
    return G.edges(opt_nodelist, true);
  }
  else {
    return G.edges(null, true);
  }
}


/**
 * Return a graph from a list of edges.
 *
 * @param {Array.<Array>} edgelist Edge tuples
 * @param {jsnx.classes.Graph=} opt_create_using Use specified graph for result.
 *      Otherwise a new graph is created.
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
function from_edgelist(edgelist, opt_create_using) {
  var G = prep_create_using(opt_create_using);
  G.add_edges_from(edgelist);
  return G;
}


// NOT IMPLEMENTED

// to_numpy_matrix
// from_numpy_matrix
// to_numpy_recarray
// to_scipy_sparse_matrix
// from_scipy_sparse_matrix
// setup_module

module.exports = {
  to_networkx_graph,
  convert_to_undirected,
  convert_to_directed,
  to_dict_of_lists,
  from_dict_of_lists,
  to_dict_of_dicts,
  from_dict_of_dicts,
  to_edgelist,
  from_edgelist
};

