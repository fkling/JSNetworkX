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


goog.provide('jsnx.convert');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');
goog.require('goog.structs.Set');
goog.require('goog.iter');
goog.require('jsnx.contrib.convert');
goog.require('jsnx.contrib.Map');


/**
 * Return a graph object ready to be populated.
 *
 * If create_using is null or undefined return the default (just jsnx.Graph())
 * If create_using.clear() works, assume it returns a graph object.
 * Otherwise raise an exception because create_using is not a jsnx graph.
 *
 * @param {jsnx.classes.Graph=} opt_create_using
 *
 * @return {jsnx.classes.Graph}
 */
jsnx.convert.prep_create_using_ = function(opt_create_using) {
    var G;

    if(!goog.isDefAndNotNull(opt_create_using)) {
        G = new jsnx.classes.Graph();
    }
    else {
        G = opt_create_using;

        try {
            G.clear();
        }
        catch(e) {
            throw new Error("Input graph is not a jsnx graph type");
        }
    }
    return G;
};


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
 * @param {jsnx.classes.Graph=} opt_create_using NetworkX graph
 *     Use specified graph for result.  Otherwise a new graph is created.
 *
 * @param {boolean=} opt_multigraph_input (default false)
 *     If true and  data is a dict_of_dicts,
 *     try to create a multigraph assuming dict_of_dict_of_lists.
 *     If data and create_using are both multigraphs then create
 *     a multigraph from a multigraph.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.convert.to_networkx_graph = function(data, opt_create_using, opt_multigraph_input) {
    var result = null;

    // jsnx graph
    if (data.hasOwnProperty('adj')) {
      /** @preserveTry */
       try {
            result = jsnx.contrib.convert.from_map_of_maps(
                data['adj'],
                opt_create_using,
                data.is_multigraph()
            );
            if (goog.object.containsKey(data, 'graph') &&
                goog.typeOf(data['graph']) === 'object')
            {
                result['graph'] = goog.object.clone(data['graph']);
            }
            if (goog.object.containsKey(data, 'node') &&
                data['node'] instanceof jsnx.contrib.Map)
            {
                result['node'] = new jsnx.contrib.Map();
                data['node'].forEach(function(k, element) {
                  result['node'].set(k, goog.object.clone(element));
                });
            }
            return result;
       }
       catch(ex) {
           throw ex;
       }
    }

    // map of maps / lists
    if (data instanceof jsnx.contrib.Map) {
      try {
        return jsnx.contrib.convert.from_map_of_maps(
          data,
          opt_create_using,
          opt_multigraph_input
        );
      }
      catch(e) {
        try {
          return jsnx.contrib.convert.from_map_of_lists(data, opt_create_using);
        }
        catch(ex) {
          throw new Error('Input is not known type.');
        }
      }
    }

    // dict of dicts / lists
    if(goog.typeOf(data) === 'object') {
        try {
            return jsnx.convert.from_dict_of_dicts(
              data,
              opt_create_using,
              opt_multigraph_input
            );
        }
        catch(e) {
            /** @preserveTry */
            try {
                return jsnx.convert.from_dict_of_lists(data, opt_create_using);
            }
            catch(ex) {
                throw new Error('Input is not known type.');
            }
        }
    }

    // list of edges
    if(goog.isArrayLike(data)) {
        /** @preserveTry */
        try {
            return jsnx.convert.from_edgelist(data, opt_create_using);
        }
        catch(e) {
            throw new Error('Input is not valid edge list');
        }
    }

    return result;
};
goog.exportSymbol('jsnx.to_networkx_graph', jsnx.convert.to_networkx_graph);


/**
 * Return a new undirected representation of the graph G.
 *
 * @param {jsnx.classes.Graph} G Graph to convert
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
jsnx.convert.convert_to_undirected = function(G) {
    return G.to_undirected();
};
goog.exportSymbol('jsnx.convert_to_undirected', jsnx.convert.convert_to_undirected);


/**
 * Return a new directed representation of the graph G.
 *
 * @param {jsnx.classes.Graph} G Graph to convert
 * @return {!jsnx.classes.Graph}
 * @export
 */
jsnx.convert.convert_to_directed = function(G) {
    return G.to_directed();
};
goog.exportSymbol('jsnx.convert_to_undirected', jsnx.convert.convert_to_directed);


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
jsnx.convert.to_dict_of_lists = function(G, opt_nodelist) {

    var contains = function(/**jsnx.Node*/n) {
        return goog.array.contains(goog.asserts.assertArray(opt_nodelist), n);
    };
    var d = {};

    if(!goog.isDefAndNotNull(opt_nodelist)) {
        opt_nodelist = G;
        contains = function(/**jsnx.Node*/n) {
            return opt_nodelist.has_node(n);
        };
    }
    else {
      opt_nodelist = jsnx.helper.toArray(opt_nodelist);
    }

    jsnx.helper.forEach(opt_nodelist, function(/**jsnx.Node*/n) {
        d[n] = goog.array.filter(G.neighbors(n), contains);
    });

    return d;
};
goog.exportSymbol('jsnx.to_dict_of_lists', jsnx.convert.to_dict_of_lists);


/**
 * Return a graph from a dictionary of lists.
 * *
 * @param {!Object.<Array>} d A dictionary of lists adjacency representation.
 * @param {jsnx.classes.Graph=} opt_create_using Use specified graph for result.
 *    Otherwise a new graph is created.
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
jsnx.convert.from_dict_of_lists = function(d, opt_create_using) {
    var G = jsnx.convert.prep_create_using_(opt_create_using);
    G.add_nodes_from(goog.iter.map(
      jsnx.helper.iteritems(d),
      function(d) {
        return isNaN(d[0]) ? d[0] : +d[0];
      }
    ));

    if(G.is_multigraph() && !G.is_directed()) {
        // a dict_of_lists can't show multiedges.  BUT for undirected graphs,
        // each edge shows up twice in the dict_of_lists.
        // So we need to treat this case separately.
        var seen = {};

        goog.object.forEach(d, function(nbrlist, node) {
            // treat numeric keys like numbers
            node = isNaN(node) ? node : +node;
            goog.array.forEach(nbrlist, function(nbr) {
                if (!goog.object.containsKey(seen, nbr)) {
                    G.add_edge(node, nbr);
                }
            });
            seen[node] = 1; // don't allow reverse edge to show up
        });

    }
    else {
        var edge_list = [];
        goog.object.forEach(d, function(nbrlist, node) {
            // treat numeric keys like numbers
            node = isNaN(node) ? node : +node;
            goog.array.forEach(nbrlist, function(nbr) {
                edge_list.push([node, nbr]);
            });
        });

        G.add_edges_from(edge_list);
    }

    return G;
};


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
 jsnx.convert.to_dict_of_dicts = function(G, opt_nodelist, opt_edge_data) {
     var dod = {};

     if (goog.isDefAndNotNull(opt_nodelist)) {
         opt_nodelist = jsnx.helper.toArray(opt_nodelist);
         if(goog.isDefAndNotNull(opt_edge_data)) {
             goog.array.forEach(opt_nodelist, function(u) {
                 dod[u] = {};
                 goog.object.forEach(G.get(u), function(data, v) {
                     goog.asserts.assertArray(opt_nodelist);
                     if(goog.array.contains(opt_nodelist, v)) {
                         dod[u][v] = opt_edge_data;
                     }
                 });
             });
         }
         else { // nodelist and edge_data are defined
            goog.array.forEach(opt_nodelist, function(u) {
                dod[u] = {};
                goog.object.forEach(G.get(u), function(data, v) {
                    goog.asserts.assertArray(opt_nodelist);
                    if(goog.array.contains(opt_nodelist, v)) {
                        dod[u][v] = data;
                    }
                });
            });
         }
     }
     else { // nodelist is undefined
         if(goog.isDefAndNotNull(opt_edge_data)) {
            goog.iter.forEach(G.adjacency_iter(), function(nbrdict, u) {
                dod[u] = goog.object.map(nbrdict, function() {
                    return opt_edge_data;
                });
            });
         }
         else { // edge_data is defined
             goog.iter.forEach(G.adjacency_iter(), function(nbrdict, u) {
                 dod[u] = goog.object.clone(nbrdict);
             });
         }
     }

     return dod;
};


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
jsnx.convert.from_dict_of_dicts = function(d, opt_create_using, opt_multigraph_input) {
    var G = jsnx.convert.prep_create_using_(opt_create_using), edgelist, seen;
    G.add_nodes_from(goog.iter.map(
      jsnx.helper.iteritems(d),
      function(d) {
        return isNaN(d[0]) ? d[0] : +d[0];
      }
    ));

    // is dict a MultiGraph or MultiDiGraph?
    if (opt_multigraph_input) {
        // make a copy  of the list of edge data (but not the edge data)
        if (G.is_directed()) {
            if (G.is_multigraph()) {
                edgelist = [];
                goog.object.forEach(d, function(nbrs, u) {
                    if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                        throw new Error();
                    }
                    // treat numeric keys like numbers
                    u = isNaN(u) ? u : +u;
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // treat numeric keys like numbers
                        v = isNaN(v) ? v : +v;
                        goog.object.forEach(datadict, function(data, key) {
                            edgelist.push([u, v, key, data]);
                        });
                    });
                });
                G.add_edges_from(edgelist);
            }
            else {
                edgelist = [];
                goog.object.forEach(d, function(nbrs, u) {
                    if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                        throw new Error();
                    }
                    // treat numeric keys like numbers
                    u = isNaN(u) ? u : +u;
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // treat numeric keys like numbers
                        v = isNaN(v) ? v : +v;
                        goog.object.forEach(datadict, function(data, key) {
                            edgelist.push([u, v, data]);
                        });
                    });
                });
                G.add_edges_from(edgelist);
            }
        }
        else { // undirected
            if(G.is_multigraph()) {
                seen = new goog.structs.Set(); // don't add both directions of undirected graph
                goog.object.forEach(d, function(nbrs, u) {
                    if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                        throw new Error();
                    }
                    // treat numeric keys like numbers
                    u = isNaN(u) ? u : +u;
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // the original implementation uses tuples here
                        // but since only primitive types are supported by
                        // goog.structs.Set and nodes can only be numbers or strings,
                        // we concatenate both nodes here

                        // treat numeric keys like numbers
                        v = isNaN(v) ? v : +v;
                        if(!seen.contains([u, v].toString())) {
                            edgelist = [];
                            goog.object.forEach(datadict, function(data, key) {
                                edgelist.push([u, v, key, data]);
                            });
                            G.add_edges_from(edgelist);
                            seen.add([v, u].toString());
                        }
                    });
                });
            }
            else {
                seen = new goog.structs.Set(); // don't add both directions of undirected graph
                goog.object.forEach(d, function(nbrs, u) {
                    if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                        throw new Error();
                    }
                    // treat numeric keys like numbers
                    u = isNaN(u) ? u : +u;
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // the original implementation uses tuples here
                        // but since only primitive types are supported by
                        // goog.structs.Set and nodes can only be numbers or strings,
                        // we concatenate both nodes here

                        // treat numeric keys like numbers
                        v = isNaN(v) ? v : +v;
                        if(!seen.contains([u, v].toString())) {
                            edgelist = [];
                            goog.object.forEach(datadict, function(data, key) {
                                edgelist.push([u, v, data]);
                            });
                            G.add_edges_from(edgelist);
                            seen.add([v, u].toString());
                        }
                    });
                });
            }
        }
    }
    else { // not a multigraph to multigraph transfer
        if(G.is_multigraph() && !G.is_directed()) {
            // d can have both representations u-v, v-u in dict.  Only add one.
            // We don't need this check for digraphs since we add both directions,
            // or for Graph() since it is done implicitly (parallel edges not allowed)
            seen = new goog.structs.Set();
            goog.object.forEach(d, function(nbrs, u) {
                if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                    throw new Error();
                }
                // treat numeric keys like numbers
                u = isNaN(u) ? u : +u;
                goog.object.forEach(nbrs, function(data, v) {
                    // the original implementation uses tuples here
                    // but since only primitive types are supported by
                    // goog.structs.Set and nodes can only be numbers or strings,
                    // we concatenate both nodes here

                    // treat numeric keys like numbers
                    v = isNaN(v) ? v : +v;
                    if(!seen.contains([u, v].toString())) {
                        G.add_edge(u, v, data);
                        seen.add([v, u].toString());
                    }
                });
            });
        }
        else {
            edgelist = [];
            goog.object.forEach(d, function(nbrs, u) {
                if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                    throw new Error();
                }
                // treat numeric keys like numbers
                u = isNaN(u) ? u : +u;
                goog.object.forEach(nbrs, function(data, v) {
                    // treat numeric keys like numbers
                    v = isNaN(v) ? v : +v;
                    edgelist.push([u, v, data]);
                });
            });
            G.add_edges_from(edgelist);
        }
    }

    return G;
};


/**
 * Return a list of edges in the graph.
 *
 * @param {jsnx.classes.Graph} G A jsnx graph
 * @param {jsnx.NodeContainer=} opt_nodelist Use only nodes specified in nodelist
 *
 * @return {!Array}
 * @export
 */
jsnx.convert.to_edgelist = function(G, opt_nodelist) {
    if(goog.isDefAndNotNull(opt_nodelist)) {
        return G.edges(opt_nodelist, true);
    }
    else {
        return G.edges(null, true);
    }
};


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
jsnx.convert.from_edgelist = function(edgelist, opt_create_using) {
    var G = jsnx.convert.prep_create_using_(opt_create_using);
    G.add_edges_from(edgelist);
    return G;
};


// NOT IMPLEMENTED

// to_numpy_matrix
// from_numpy_matrix
// to_numpy_recarray
// to_scipy_sparse_matrix
// from_scipy_sparse_matrix
// setup_module
