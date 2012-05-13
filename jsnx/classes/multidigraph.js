/*jshint strict:false*/
goog.provide('jsnx.classes.MultiDiGraph');

goog.require('goog.object');
goog.require('goog.iter');
goog.require('jsnx.classes.DiGraph');
goog.require('jsnx.classes.MultiGraph');
goog.require('jsnx.helper');
goog.require('jsnx.exception');

/**
 * A directed graph class that can store multiedges.
 *
 * Multiedges are multiple edges between two nodes.  Each edge
 * can hold optional data or attributes.
 *
 * Nodes can be arbitrary (hashable) objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.DiGraph
 * @see jsnx.classes.MultiGraph
 *
 * @param {?=} opt_data Data to initialize graph.
 *         If data=None (default) an empty graph is created.  
 *         The data can be an edge list, or any NetworkX graph object. 
 * @param {Object=} opt_attr Attributes to add to graph as key=value pairs.
 *
 * @extends jsnx.classes.DiGraph
 * @borrows jsnx.classes.MultiGraph
 *
 * @constructor
 * @export
 */
jsnx.classes.MultiDiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.MultiDiGraph)) {
        return new jsnx.classes.MultiDiGraph(opt_data, opt_attr);
    }

    goog.base(this, opt_data, opt_attr);
};
goog.inherits(jsnx.classes.MultiDiGraph, jsnx.classes.DiGraph);
jsnx.helper.mixin(jsnx.classes.MultiDiGraph.prototype, jsnx.classes.MultiGraph.prototype);

goog.exportSymbol('jsnx.MultiDiGraph', jsnx.classes.MultiDiGraph);

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.MultiDiGraph['__name__'] = 'MultiDiGraph';


/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 *
 * Edge attributes can be specified with keywords or by providing
 * a dictionary with key/value pairs.
 *
 * Notes:
 *
 * To replace/update edge data, use the optional key argument
 * to identify a unique edge.  Otherwise a new edge will be created.
 *
 * NetworkX algorithms designed for weighted graphs cannot use
 * multigraphs directly because it is not clear how to handle
 * multiedge weights.  Convert to Graph using edge attribute
 * 'weight' to enable weighted graph algorithms.

 *
 * @see #add_edges_from
 *
 * @param {(number|string)=} opt_key identifier
 *      Used to distinguish multiedges between a pair of nodes. Default is
 *      the lowest unused integer.
 * @param {Object} opt_attr_dict  Dictionary of edge attributes.  
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.add_edge = function(u, v, opt_key, opt_attr_dict) {
    var datadict, keydict;

    if(goog.isDefAndNotNull(opt_key) && !(goog.isString(opt_key) || goog.isNumber(opt_key))) {
        opt_attr_dict = opt_key;
        opt_key = null;
    }

    // set up attribute dict
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    // add nodes
    if(!goog.object.containsKey(this['succ'], u)) {
        this['succ'][u] = {};
        this['pred'][u] = {};
        this['node'][u] = {};
    }
    if(!goog.object.containsKey(this['succ'], v)) {
        this['succ'][v] = {};
        this['pred'][v] = {};
        this['node'][v] = {};
    }
    if(goog.object.containsKey(this['succ'][u], v)) {
        keydict = this['adj'][u][v];
        if(!goog.isDefAndNotNull(opt_key)) {
            // find a unique integer key
            // other methods might be better here?
            opt_key = goog.object.getCount(keydict);
            while(goog.object.containsKey(keydict, opt_key)) {
                opt_key += 1;
            }
        }
        datadict = goog.object.get(keydict, opt_key, {});
        goog.object.extend(datadict, opt_attr_dict);
        keydict[opt_key] = datadict;
    }
    else {
        // selfloops work this way without special treatment
        if(!goog.isDefAndNotNull(opt_key)) {
            opt_key = 0;
        }
        datadict = {};
        goog.object.extend(datadict, opt_attr_dict);
        keydict = goog.object.create(opt_key, datadict);
        this['succ'][u][v] = keydict;
        this['pred'][v][u] = keydict;
    }
};


/**
 * Remove an edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u
 * @param {jsnx.Node} v
 * @param {(number|string)} opt_key
 *      Used to distinguish multiple edges between a pair of nodes.
 *      If null or undefined remove a single (abritrary) edge between u and v.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.remove_edge = function(u, v, opt_key) {
    if(!goog.object.containsKey(this['adj'], u) ||
       !goog.object.containsKey(this['adj'][u], v)) {
        throw new jsnx.exception.JSNetworkXError(
            'The edge ' + u + '-' + v + ' is not in the graph'
        );
    }

    var d = this['adj'][u][v];

    // remove the edge with specified data
    if(!goog.isDefAndNotNull(opt_key)) {
        goog.object.remove(d, goog.object.getAnyKey(d));
    }
    else {
        if(!goog.object.containsKey(d, opt_key)) {
            throw new jsnx.exception.JSNetworkXError(
                'The edge ' + u + '-' + v + ' with key ' + opt_key + ' is not in the graph'
            );
        }
        goog.object.remove(d, opt_key);
    }
    if(goog.object.getCount(d) === 0) {
        // remove the key entries if last edge
        goog.object.remove(this['succ'][u], v);
        goog.object.remove(this['pred'][v], u);
    }
};

/**
 * Return an iterator over edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *       For directed graphs edges() is the same as out_edges().
 *
 * @see #edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.edges_iter = function(opt_nbunch, opt_data, opt_keys) {
    if(goog.isBoolean(opt_nbunch)) {
        if(goog.isBoolean(opt_data)) {
            opt_keys = opt_data;
        }
        opt_data = opt_nbunch;
        opt_nbunch = null;
    }

    var nodes_nrbs, n, nbr;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nrbs = jsnx.helper.items(this['adj']);
    }
    else {
        nodes_nrbs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['adj'][n]];
        }, this);
    }

    if(opt_data) {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrsd) {
            nbr = nbrsd[0];
            return jsnx.helper.iteritems(nbrsd[1]);
        }, function(keydictd) {
            if(opt_keys) {
                return [n, nbr, keydictd[0], keydictd[1]];
            }
            else {
                return [n, nbr, keydictd[1]];
            }
        });
    }
    else {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrsd) {
            nbr = nbrsd[0];
            return jsnx.helper.iteritems(nbrsd[1]);
        }, function(keydictd) {
            if(opt_keys) {
                return [n, nbr, keydictd[0]];
            }
            else {
                return [n, nbr];
            }
        });
    }
};


/**
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_edges_iter = jsnx.classes.MultiDiGraph.prototype.edges_iter;


/**
 * Return a list of the outgoing edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *      Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *      For directed graphs edges() is the same as out_edges().
 *
 * @see #in_edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {Array}
 *      A list of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_edges = function(opt_nbunch, opt_data, opt_keys) {
    return goog.iter.toArray(this.out_edges_iter(opt_nbunch, opt_data, opt_keys));
};


/**
 * Return an iterator over the incoming edges.
 *
 * @see #edges_iter
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.in_edges_iter = function(opt_nbunch, opt_data, opt_keys) {
     // handle calls with opt_data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
        opt_data = opt_nbunch;
        opt_nbunch = null;
    }

    var nodes_nrbs, n, nbr;

    if(!goog.isDefAndNotNull) {
        nodes_nrbs = jsnx.helper.items(this['pred']);
    }
    else {
        nodes_nrbs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['pred'][n]];
        }, this);
    }

    if(opt_data) {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrsd) {
            nbr = nbrsd[0];
            return jsnx.helper.iteritems(nbrsd[1]);
        }, function(keydictd) {
            if(opt_keys) {
                return [nbr, n, keydictd[0], keydictd[1]];
            }
            else {
                return [nbr, n, keydictd[1]];
            }
        });
    }
    else {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrsd) {
            nbr = nbrsd[0];
            return jsnx.helper.iteritems(nbrsd[1]);
        }, function(keydictd) {
            if(opt_keys) {
                return [nbr, n, keydictd[0]];
            }
            else {
                return [nbr, n];
            }
        });
    }
};


/**
 * Return a list of the incoming edges.
 *
 * @see #in_edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {Array}
 *      A list  of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.in_edges = function(opt_nbunch, opt_data, opt_keys) {
    return goog.iter.toArray(this.in_edges_iter(opt_nbunch, opt_data, opt_keys));
};


/**
 * Return an iterator for (node, degree).
 *
 * The node degree is the number of edges adjacent to the node.
 *
 * @see #degree
 *
 *
 * @param {jsnx.NodeContainer} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.zip(jsnx.helper.iteritems(this['succ']),
                                     jsnx.helper.iteritems(this['pred']));
    }
    else {
        nodes_nbrs = jsnx.helper.zip(
            goog.iter.map(this.nbunch_iter(opt_nbunch), function(n) {
                return [n, this['succ'][n]];
            }, this),
            goog.iter.map(this.nbunch_iter(opt_nbunch), function(n) {
                return [n, this['pred'][n]];
            }, this)
        );
    }

    if(!goog.isDefAndNotNull(opt_weight)) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var indeg = 0,
                outdeg = 0;

            goog.object.forEach(nd[1][1], function(data) {
                indeg += jsnx.helper.len(data);
            });
            goog.object.forEach(nd[0][1], function(data) {
                outdeg += jsnx.helper.len(data);
            });

            return [nd[0][0], indeg + outdeg];
        });
    }
    else {
        // edge weighted graph - degree is sum of nbr edge weights
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var succ = nd[0][1],
                pred = nd[1][1],
                sum = 0;

            goog.object.forEach(pred, function(data) {
                goog.object.forEach(data, function(d) {
                    sum += +goog.object.get(d, opt_weight, 1);
                });
            });
            goog.object.forEach(succ, function(data) {
                goog.object.forEach(data, function(d) {
                    sum += +goog.object.get(d, opt_weight, 1);
                });
            });

            return [nd[0][0], sum];
        });
    }
};


/**
 * Return an iterator for (node, in-degree).
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #out_degree_iter
 *
 *
 * @param {jsnx.NodeContainer} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, in-degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.in_degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.iteritems(this['pred']);
    }
    else {
        nodes_nbrs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['pred'][n]];
        }, this);
    }

    if(!goog.isDefAndNotNull(opt_weight)) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0;
            goog.object.forEach(nd[1], function(data) {
                sum += goog.object.getCount(data);
            });
            return [nd[0], sum];
        });
    }
    else {
        // edge weighted graph - degree is sum of nbr edge weights
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0;

            goog.object.forEach(nd[1], function(data) {
                goog.object.forEach(data, function(d) {
                    sum += +goog.object.get(d, opt_weight, 1);
                });
            });

            return [nd[0][0], sum];
        });
    }
};


/**
 * Return an iterator for (node, out-degree).
 *
 * The node out-degree is the number of edges pointing out of the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 *
 * @param {jsnx.NodeContainer} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, out-degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.iteritems(this['succ']);
    }
    else {
        nodes_nbrs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['succ'][n]];
        }, this);
    }

    if(!goog.isDefAndNotNull(opt_weight)) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0;
            goog.object.forEach(nd[1], function(data) {
                sum += goog.object.getCount(data);
            });
            return [nd[0], sum];
        });
    }
    else {
        // edge weighted graph - degree is sum of nbr edge weights
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0;

            goog.object.forEach(nd[1], function(data) {
                goog.object.forEach(data, function(d) {
                    sum += +goog.object.get(d, opt_weight, 1);
                });
            });

            return [nd[0][0], sum];
        });
    }
};


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.is_multigraph = function() {
    return true;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.is_directed = function() {
    return true;
};


/**
 * Return a directed copy of the graph.
 *
 * Notes:
 *
 *      If edges in both directions (u,v) and (v,u) exist in the
 *      graph, attributes for the new undirected edge will be a combination of
 *      the attributes of the directed edges.  The edge data is updated
 *      in the (arbitrary) order that the edges are encountered.  For
 *      more customized control of the edge attributes use add_edge().
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar G=DiGraph(D) which returns a
 *      shallow copy of the data.
 *
 * @return {jsnx.DiGraph} A deepcopy of the graph
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.to_directed = function() {
    return jsnx.helper.deepcopy_instance(this);    
};


/**
 * Return an undirected representation of the digraph.
 *
 * Notes:
 *
 * If edges in both directions (u,v) and (v,u) exist in the
 * graph, attributes for the new undirected edge will be a combination of
 * the attributes of the directed edges.  The edge data is updated
 * in the (arbitrary) order that the edges are encountered.  For
 * more customized control of the edge attributes use add_edge().
 *
 * This returns a "deepcopy" of the edge, node, and
 * graph attributes which attempts to completely copy
 * all of the data and references.
 *
 * This is in contrast to the similar G=DiGraph(D) which returns a
 * shallow copy of the data.
 *
 * @param {boolean=} opt_reciprocal 
 *      If True only keep edges that appear in both directions 
 *      in the original digraph. 
 *
 * @return {jsnx.MultiGraph} 
 *      An undirected graph with the same name and nodes and
 *      with edge (u,v,data) if either (u,v,data) or (v,u,data)
 *      is in the digraph.  If both edges exist in digraph and
 *      their edge data is different, only one edge is created
 *      with an arbitrary choice of which edge data to use.
 *      You must check and correct for this manually if desired.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.to_undirected = function(opt_reciprocal) {
    var H = new jsnx.classes.MultiGraph();
    H.name(this.name());
    H.add_nodes_from(this);

    var self = this,
        u, v;

    if(opt_reciprocal) {
        H.add_edges_from(jsnx.helper.nested_chain(this.adjacency_iter(), function(nd) {
            u = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrd) {
            v = nbrd[0];
            return jsnx.helper.iteritems(nbrd[1]);
        }, function(keydictd) {
            if(self.has_edge(v, u, keydictd[0])) {
                return [u, v, keydictd[0], jsnx.helper.deepcopy(keydictd[1])];
            }
        }));
    }
    else {
        H.add_edges_from(jsnx.helper.nested_chain(this.adjacency_iter(), function(nd) {
            u = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrd) {
            v = nbrd[0];
            return jsnx.helper.iteritems(nbrd[1]);
        }, function(keydictd) {
            return [u, v, keydictd[0], jsnx.helper.deepcopy(keydictd[1])];
        }));
    }

    H['graph'] = jsnx.helper.deepcopy(this['graph']);
    H['node'] = jsnx.helper.deepcopy(this['node']);
    return H;
};


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * Notes:
 *
 * The graph, edge or node attributes just point to the original graph.
 * So changes to the node or edge structure will not be reflected in
 * the original graph while changes to the attributes will.
 *
 * To create a subgraph with its own copy of the edge/node attributes use:
 * nx.Graph(G.subgraph(nbunch))
 *
 * If edge attributes are containers, a deep copy can be obtained using:
 * G.subgraph(nbunch).copy()
 *
 * For an inplace reduction of a graph to a subgraph you can remove nodes:
 * G.remove_nodes_from([ n in G if n not in set(nbunch)])
 *
 * @param {jsnx.NodeContainer} nbunch  
 *      A container of nodes which will be iterated through once.
 *
 * @return {jsnx.MultiDiGraph} A subgraph of the graph with the same edge attributes.
 *
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor(),
        // namespace shortcuts for speed
        H_succ = H['succ'],
        H_pred = H['pred'],
        this_succ = this['succ'];

    // add nodes
    goog.iter.forEach(bunch, function(n) {
        H_succ[n] = {};
        H_pred[n] = {};
    });
    // add edges
    jsnx.helper.forEach(H_succ, function(u) {
        var Hnbrs = H_succ[u];
        goog.object.forEach(this_succ[u], function(edgedict, v) {
            if(goog.object.containsKey(H_succ,v)) {
                // add both representations of edge: u-v and v-u
                // they share the same edgedict
                var ed = goog.object.clone(edgedict);
                Hnbrs[v] = ed;
                H_pred[v][u] = ed;
            }
        });
    });
    jsnx.helper.forEach(H, function(n) {
        H['node'][n] = this['node'][n];
    }, this);
    H['graph'] = this['graph'];
    return H;
};


/**
 * Return the reverse of the graph.
 *
 * The reverse is a graph with the same nodes and edges
 * but with the directions of the edges reversed.
 *
 * @param {boolean=} opt_copy (default=True)
 *      If True, return a new DiGraph holding the reversed edges.
 *      If False, reverse the reverse graph is created using
 *      the original graph (this changes the original graph).
 *
 * @return {!jsnx.MultiDiGraph} A copy of the graph or the graph itself
 *
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.reverse = function(opt_copy) {
    opt_copy = !goog.isDef(opt_copy) || opt_copy;
    var H;

    if(opt_copy) {
        H = new this.constructor(null, {name: 'Reverse of (' + this.name() + ')'});
        H.add_nodes_from(this);
        H.add_edges_from(goog.iter.map(this.edges_iter(true, true), function(ed) {
            return [ed[1], ed[0], ed[2], jsnx.helper.deepcopy(ed[3])];
        }));
        H['graph'] = jsnx.helper.deepcopy(this['graph']);
        H['node'] = jsnx.helper.deepcopy(this['node']);
    }
    else {
        var this_pred = this['pred'],
            this_succ = this['succ'];

        this['succ'] = this_pred;
        this['pred'] = this_succ;
        this['adj'] = this['succ'];
        H = this;
    }
    return H;
};
