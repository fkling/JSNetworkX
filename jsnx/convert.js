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

goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.structs.Set');
goog.require('goog.iter');


/**
 * Return a graph object ready to be populated.
 *
 * If create_using is null or undefined return the default (just jsnx.Graph())
 * If create_using.clear() works, assume it returns a graph object.
 * Otherwise raise an exception because create_using is not a jsnx graph.
 *
 * @return {jsnx.Graph}
 * @private
 */
jsnx.convert.prep_create_using_ = function(create_using) {
    var G;

    if(!goog.isDefAndNotNull(create_using)) {
        G = new jsnx.Graph();
    }
    else {
        G = create_using;

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
 * @param {Object} data An object to be converted
 *     Current known types are:
 *        any jsnx graph
 *        dict-of-dicts
 *        dict-of-lists
 *        list of edges
 *
 * @param {jsnx.Graph} create_using NetworkX graph
 *     Use specified graph for result.  Otherwise a new graph is created.
 * 
 * @param {boolean} multigraph_input (default false)
 *     If true and  data is a dict_of_dicts,
 *     try to create a multigraph assuming dict_of_dict_of_lists.
 *     If data and create_using are both multigraphs then create
 *     a multigraph from a multigraph.
 *
 * @return {jsnx.Graph}
 */
jsnx.convert.to_networkx_graph = function(data, create_using, multigraph_input) {
    var result;

    // jsnx graph
    if(data.hasOwnProperty('adj')) {
       try {
            result = jsnx.convert.from_dict_of_dicts(data['adj'], create_using, data.is_multigraph());
            if(goog.object.containsKey(data, 'graph') && goog.typeOf(data['graph']) === 'object') {
                result['graph'] = goog.object.clone(data['graph']);
            }
            if(goog.object.containsKey(data, 'node') && goog.typeOf(data['node']) === 'object') {
                result['node'] = goog.object.map(data['node'], function(element) {
                    return goog.object.clone(element);
                });
            }
            return result;
       }
       catch(e) {
           throw new Error('Input is not a correct jsnx graph');
       }
    }

    // dict of dicts / lists
    if(goog.typeOf(data) === 'object') {
        try {
            return jsnx.convert.from_dict_of_dicts(data, create_using, multigraph_input);
        }
        catch(e) {
            try {
                return jsnx.convert.from_dict_of_lists(data, create_using);
            }
            catch(e) {
                throw new Error('Input is not known type.');
            }
        }
    }

    // list of edges
    if(goog.isArrayLike(data)) {
        try {
            return jsnx.convert.from_edgelist(data, create_using);
        }
        catch(e) {
            throw new Error('Input is not valid edge list');
        }
    }
};
goog.exportSymbol('jsnx.to_networkx_graph', jsnx.convert.to_networkx_graph);


/**
 * Return a new undirected representation of the graph G.
 *
 * @param {jsnx.Graph} G Graph to convert
 *
 * @return {jsnx.Graph}
 */
jsnx.convert.convert_to_undirected = function(G) {
    return G.to_undirected();
};
goog.exportSymbol('jsnx.convert_to_undirected', jsnx.convert_to_undirected);


/**
 * Return a new directed representation of the graph G.
 *
 * @param {jsnx.Graph} G Graph to convert
 * @return {jsnx.Graph}
 */
jsnx.convert.convert_to_directed = function(G) {
    return G.to_directed();
};
goog.exportSymbol('jsnx.convert_to_undirected', jsnx.convert_to_directed);


/**
 * Return adjacency representation of graph as a dictionary of lists.
 *
 * Completely ignores edge data for MultiGraph and MultiDiGraph.
 *
 * @param {jsnx.Graph} G A jsnx graph
 * @param {goog.iter.Iterable} nodelist Use only nodes specified in nodelist
 *
 * @return {Object.<(string|number), Array>} 
 */
jsnx.convert.to_dict_of_lists = function(G, nodelist) {

    // assume that nodelist is an array
    var contains = function(n) {
            return goog.array.contains(nodelist, n);
        },
        d = {};

    if(!goog.isDef(nodelist)) {
        nodelist = G;
        
        contains = function(n) {
            return nodelist.contains(n);
        };
    }

    jsnx.helper.forEach(nodelist, function(n) {
        d[n] = goog.array.filter(G.neighbors(n), contains);
    });

    return d;
};
goog.exportSymbol('jsnx.to_dict_of_lists', jsnx.to_dict_of_lists);


/**
 * Return a graph from a dictionary of lists.
 * *
 * @param {Object.<(number|string), Array>} d A dictionary of lists adjacency representation.
 * @param {jsnx.Graph} create_using Use specified graph for result.  Otherwise a new graph is created.
 *
 * @return {jsnx.Graph} 
 */
jsnx.convert.from_dict_of_lists = function(d, create_using) {
    var G = jsnx.convert.prep_create_using_(create_using);
    G.add_nodes_from(d);

    if(G.is_multigraph() && !G.is_directed()) {
        // a dict_of_lists can't show multiedges.  BUT for undirected graphs,
        // each edge shows up twice in the dict_of_lists.  
        // So we need to treat this case separately.
        var seen = {};

        goog.object.forEach(d, function(nbrlist, node) {
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
 * @param {jsnx.Graph} G A jsnx Graph
 * @param {Array} nodelist Use only nodes specified in nodelist
 * @param {Array} edge_data If provided,  the value of the dictionary will be
 *      set to edge_data for all edges.  This is useful to make
 *      an adjacency matrix type representation with 1 as the edge data.
 *      If edgedata is null or undefined, the edgedata in G is used to fill the values.
 *      If G is a multigraph, the edgedata is a dict for each pair (u,v).
 *
 * @return {Object.<Object>}
 */
 jsnx.convert.to_dict_of_dicts = function(G, nodelist, edge_data) {
     var dod = {};

     if(!goog.isDef(nodelist)) {
         if(!goog.isDef(edge_data)) {
             goog.iter.forEach(G.adjacency_iter(), function(nbrdict, u) {
                 dod[u] = goog.object.clone(nbrdict);
             });
         }
         else { // edge_data is not undefined
            goog.iter.forEach(G.adjacency_iter(), function(nbrdict, u) {
                dod[u] = goog.object.map(nbrdict, function() {
                    return edge_data;
                });
            });
         }
     }
     else { // nodelist is not undefined
         if(!goog.isDef(edge_data)) {
            goog.array.forEach(nodelist, function(u) {
                dod[u] = {};
                goog.object.forEach(G.get_node(u), function(data, v) {
                    if(goog.array.contains(nodelist, v)) {
                        dod[u][v] = data;
                    }
                });
            });
         }
         else { // nodelist and edge_data are not undefined
             goog.array.forEach(nodelist, function(u) {
                 dod[u] = {};
                 goog.object.forEach(G.get_node(u), function(data, v) {
                     if(goog.array.contains(nodelist, v)) {
                         dod[u][v] = edge_data;
                     }
                 });
             });
         }
     }

     return dod;
};


/**
 * Return a graph from a dictionary of dictionaries.
 *
 * @param {Object.<Object>} d A dictionary of dictionaries adjacency representation.
 * @param {jsnx.Graph} create_using Use specified graph for result.  
 *      Otherwise a new graph is created.
 * @param {boolean} multigraph_input (default=False)  
 *      When True, the values of the inner dict are assumed 
 *      to be containers of edge data for multiple edges.
 *      Otherwise this routine assumes the edge data are singletons.
 *
 * @return {jsnx.Graph}
 */
jsnx.convert.from_dict_of_dicts = function(d, create_using, multigraph_input) {
    var G = jsnx.convert.prep_create_using_(create_using), edgelist, seen;
    G.add_nodes_from(d);

    // is dict a MultiGraph or MultiDiGraph?
    if (multigraph_input) {
        // make a copy  of the list of edge data (but not the edge data)
        if (G.is_directed()) {
            if (G.is_multigraph()) {
                edgelist = [];
                goog.object.forEach(d, function(nbrs, u) {
                    if(goog.isArrayLike(nbrs)) { // throw expectio of not dict (object)
                        throw new Error();
                    }
                    goog.object.forEach(nbrs, function(datadict, v) {
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
                    goog.object.forEach(nbrs, function(datadict, v) {
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
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // the original implementation uses tuples here
                        // but since only primitive types are supported by
                        // goog.structs.Set and nodes can only be numbers or strings,
                        // we concatenate both nodes here
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
                    goog.object.forEach(nbrs, function(datadict, v) {
                        // the original implementation uses tuples here
                        // but since only primitive types are supported by
                        // goog.structs.Set and nodes can only be numbers or strings,
                        // we concatenate both nodes here
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
                goog.object.forEach(nbrs, function(data, v) {
                    // the original implementation uses tuples here
                    // but since only primitive types are supported by
                    // goog.structs.Set and nodes can only be numbers or strings,
                    // we concatenate both nodes here
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
                goog.object.forEach(nbrs, function(data, v) {
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
 * @param {jsnx.Graph} G A jsnx graph
 * @param {Array} nodelist Use only nodes specified in nodelist
 *  
 * @return {Array}  
 */
jsnx.convert.to_edgelist = function(G, nodelist) {
    if(!goog.isDef(nodelist)) {
        return G.edges(true);
    }
    else {
        return G.edges(nodelist, true);
    }
};


/**
 * Return a graph from a list of edges.
 *
 * @param {Array} edgelist Edge tuples 
 * @param {jsnx.Graph} create_using Use specified graph for result.  
 *      Otherwise a new graph is created.
 *
 * @return {jsnx.Graph}
 */
jsnx.convert.from_edgelist = function(edgelist, create_using) {
    var G = jsnx.convert.prep_create_using_(create_using);
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
