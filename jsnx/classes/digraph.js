'use strict';
goog.provide('jsnx.classes.DiGraph');

goog.require('goog.object');
goog.require('jsnx.convert');
goog.require('jsnx.exception');
goog.require('jsnx.classes.Graph');

/**
 * Base class for directed graphs.
 *
 * A DiGraph stores nodes and edges with optional data, or attributes.
 *
 * DiGraphs hold directed edges.  Self loops are allowed but multiple
 * (parallel) edges are not.
 *
 * Nodes can be arbitrary (hashable) Python objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.Graph
 * @see jsnx.MultiGraph
 * @see jsnx.MultiDiGraph
 *
 * @param {?=} opt_data 
 *      Data to initialize graph.  If data=None (default) an empty
 *      graph is created.  The data can be an edge list, or any
 *      NetworkX graph object.
 *
 * @param {Object=} opt_attr 
 *       Attributes to add to graph as key=value pairs.
 *
 * WARNING: If only {@code opt_attr} is provided, it will be interpreted as
 * {@code opt_data}, since both arguments can be of the same type. Hence you
 * have to pass {@code null} explicitly:
 *
 * var G = new jsnx.DiGraph(null, {name: 'test'});
 *
 * @extends jsnx.Graph
 * @constructor
 * @export
 */
jsnx.classes.DiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.DiGraph)) {
        return new jsnx.classes.DiGraph(opt_data, opt_attr);
    }

    this['graph'] = {}; // dictionary for graph attributes
    this['node'] = {}; // dictionary for node attributes
    // We store two adjacency lists:
    // the  predecessors of node n are stored in the dict self.pred
    // the successors of node n are stored in the dict self.succ=self.adj
    this['adj'] = {}; // empty adjacency dictionary
    this['pred'] = {}; // predecessor
    this['succ'] = this['adj']; // successor

    //attempt to load graph with data
    if(goog.isDefAndNotNull(opt_data)) {
        jsnx.convert.to_networkx_graph(opt_data,this);
    }
    // load graph attributes (must be afte convert)
    goog.object.extend(this['graph'], opt_attr || {});
    this['edge'] = this['adj'];
};
goog.exportSymbol('jsnx.DiGraph', jsnx.classes.DiGraph);
goog.inherits(jsnx.classes.DiGraph, jsnx.classes.Graph);


/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.DiGraph['__name__'] = 'DiGraph';


/**
 * @type {!Object}
 */
jsnx.classes.DiGraph.prototype.pred = null;


/**
 * @type {!Object}
 */
jsnx.classes.DiGraph.prototype.succ = null;


/**
 * Add a single node n and update node attributes.
 *
 * @see #add_nodes_from
 *
 * @param {jsnx.Node} n Node
 * @param {Object=} opt_attr_dict Dictionary of node attributes.
 *      Key/value pairs will update existing data associated with the node.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_node = function(n, opt_attr_dict) {
    // set up attribute dict
    if(!goog.isDefAndNotNull(opt_attr_dict)) {
        opt_attr_dict = {};
    }

    if(goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    if(!goog.object.containsKey(this['succ'], n)) {
        this['succ'][n] = {};
        this['pred'][n] = {};
        this['node'][n] = opt_attr_dict;
    }
    else { // update attr even if node already exists
        goog.object.extend(this['node'][n], opt_attr_dict);
    }
};


/**
 * Add multiple nodes.
 *
 * @see #add_node
 *
 * @param {jsnx.NodeContainer} nodes 
 *      A container of nodes (list, dict, set, etc.).
 *      OR
 *      A container of (node, attribute dict) tuples. 
 *
 * @param {Object=} opt_attr  Update attributes for all nodes in nodes.
 *       Node attributes specified in nodes as a tuple
 *       take precedence over attributes specified generally.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_nodes_from = function(nodes, opt_attr) {
    var newnode, nn, ndict, newdict, olddict;

    opt_attr = opt_attr || {};

    // if an object, only iterate over the keys
    jsnx.helper.forEach(jsnx.helper.iter(nodes), function(n) {
        newnode = !goog.object.containsKey(this['succ'], n);

        // test whether n is a (node, attr) tuple
        if (goog.isArray(n)) {
            nn = n[0];
            ndict = n[1];

            if (!goog.object.containsKey(this['succ'], nn)) {
                this['succ'][nn] = {};
                this['pred'][nn] = {};
                newdict = goog.object.clone(opt_attr);
                goog.object.extend(newdict, ndict);
                this['node'][nn] = newdict;
            }
            else {
                olddict = this['node'][nn];
                goog.object.extend(olddict, opt_attr, ndict);
            }
            return; // continue next iteration
        }
        if (newnode) {
            this['succ'][n] = {};
            this['pred'][n] = {};
            this['node'][n] = goog.object.clone(opt_attr);
        }
        else {
            goog.object.extend(this['node'][n], opt_attr);
        }
    }, this);
};

/**
 * Remove node n.
 *
 * Removes the node n and all adjacent edges.
 * Attempting to remove a non-existent node will raise an exception.
 *
 * @see #remove_nodes_from
 *
 * @param {jsnx.Node} n  A node in the graph
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_node = function(n) {
    if (!goog.object.containsKey(this['node'], n)) {
        throw new jsnx.exception.JSNetworkXError(
            'The node ' + n + ' is not in the graph'
        );
    }

    var nbrs = this['succ'][n];
    goog.object.remove(this['node'], n);

    goog.object.forEach(nbrs, function(_, u) {
        goog.object.remove(this['pred'][u], n); // remove all edges n-u in digraph
    }, this);
    goog.object.remove(this['succ'], n); // remove node from succ
    goog.object.forEach(this['pred'][n], function(_, u) {
        goog.object.remove(this['succ'][u], n); // remove all edges n-u in digraph
    }, this);
    goog.object.remove(this['pred'], n); // remove node from pred
};


/**
 * Remove multiple nodes.
 *
 * @see #remove_node
 *
 * @param {jsnx.NodeContainer} nodes  A container of nodes.
 *      If a node in the container is not in the graph it is silently ignored.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_nodes_from = function(nodes) {
    var succs;
    jsnx.helper.forEach(nodes, function(n) {
        if(goog.object.containsKey(this['succ'], n)) {
            succs = this['succ'][n];

            goog.object.remove(this['node'], n);
            goog.object.forEach(succs, function(_, u) {
                // remove all edges n-u in digraph
                goog.object.remove(this['pred'][u], n);
            }, this);
            goog.object.remove(this['succ'], n); // remove node from succ
            goog.object.forEach(this['pred'][n], function(_, u) {
                // remove all edges n-u in digraph
                goog.object.remove(this['succ'][u], n); 
            }, this);
            goog.object.remove(this['pred'], n); // remove node from pred
        }
    }, this);
};


/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 * 
 * Edge attributes can be specified with keywords or by providing
 * a dictionary with key/value pairs.
 *
 * @see #add_edges_from
 *
 * Note: Adding an edge that already exists updates the edge data.
 * 
 *       Many NetworkX algorithms designed for weighted graphs use as
 *       the edge weight a numerical value assigned to a keyword
 *       which by default is 'weight'.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_edge = function(u, v, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    // add nodes
    if (!goog.object.containsKey(this['succ'], u)) {
        this['succ'][u] = {};
        this['pred'][u] = {};
        this['node'][u] = {};
    }

    if (!goog.object.containsKey(this['succ'], v)) {
        this['succ'][v] = {};
        this['pred'][v] = {};
        this['node'][v] = {};
    }

    // add the edge
    var datadict = goog.object.get(this['adj'][u], v, {});
    goog.object.extend(datadict, opt_attr_dict);
    this['succ'][u][v] = datadict;
    this['pred'][v][u] = datadict;
};


/**
 * Add all the edges in ebunch.
 *
 * Notes: 
 * Adding the same edge twice has no effect but any edge data
 * will be updated when each duplicate edge is added.
 *
 * @see #add_edge
 * @see #add_weighted_edges_from
 *
 * @param {?} ebunch container of edges
 *      Each edge given in the container will be added to the
 *      graph. The edges must be given as as 2-tuples (u,v) or
 *      3-tuples (u,v,d) where d is a dictionary containing edge data.
 *
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *      Dictionary of edge attributes.  Key/value pairs will
 *      update existing data associated with each edge.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_edges_from = function(ebunch, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    // process ebunch
    jsnx.helper.forEach(ebunch, function(e) {
        var ne = jsnx.helper.len(e), u, v, dd;
        if (ne === 3) {
            u = e[0];
            v = e[1];
            dd = e[2];
        }
        else if (ne === 2) {
            u = e[0];
            v = e[1];
            dd = {};
        }
        else {
            throw new jsnx.exception.JSNetworkXError(
                'Edge tuple ' + e.toString() + ' must be a 2-tuple or 3-tuple.'
            );
        }

        if (!goog.object.containsKey(this['succ'], u)) {
            this['succ'][u] = {};
            this['pred'][u] = {};
            this['node'][u] = {};
        }
        if (!goog.object.containsKey(this['succ'], v)) {
            this['succ'][v] = {};
            this['pred'][v] = {};
            this['node'][v] = {};
        }

        var datadict = goog.object.get(this['adj'][u], v, {});
        goog.object.extend(datadict, opt_attr_dict, dd);
        this['succ'][u][v] = datadict;
        this['pred'][v][u] = datadict;
    }, this);
};


/**
 * Remove the edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_edge = function(u, v) {
    try {
        goog.object.remove(this['succ'][u], v);
        goog.object.remove(this['pred'][v], u);
    }
    catch (e) {
        if (e instanceof TypeError) {
            throw new jsnx.exception.JSNetworkXError(
                'The edge ' + u + '-' + v + ' is not in the graph'
            );
        }
        throw e;
    }
};


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
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_edges_from = function(ebunch) {
    jsnx.helper.forEach(ebunch, function(e) {
        var u = e[0], // ignore edge data if present
            v = e[1];

        if (goog.object.containsKey(this['succ'], u) &&
            goog.object.containsKey(this['succ'][u], v)) {

            goog.object.remove(this['succ'][u], v);
            goog.object.remove(this['pred'][v], u);
        }
    }, this);
};


/**
 * Return True if node u has successor v.
 *
 * This is true if graph has the edge u->v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has successor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_successor = function(u, v) {
    return goog.object.containsKey(this['succ'], u) &&
            goog.object.containsKey(this['succ'][u], v);
};


/**
 * Return True if node u has predecessor v.
 *
 * This is true if graph has the edge u<-v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has predecessor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_predecessor = function(u, v) {
    return goog.object.containsKey(this['pred'], u) &&
            goog.object.containsKey(this['pred'][u], v);
};


/**
 * Return an iterator over successor nodes of n.
 *
 * {@code neighbors_iter()} and {@code successors_iter()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors_iter = function(n) {
    if(!goog.object.containsKey(this['succ'], n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }

    return jsnx.helper.iter(this['succ'][n]);
};


/**
 * Return an iterator over predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors_iter = function(n) {
    if(!goog.object.containsKey(this['pred'], n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }

    return jsnx.helper.iter(this['pred'][n]);
};


/**
 * Return a list of successor nodes of n.
 *
 * {@code neighbors()} and {@code successors()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors = function(n) {
    if(!goog.object.containsKey(this['succ'], n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }

    return jsnx.helper.toArray(this['succ'][n]);
};


/**
 * Return list of predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors = function(n) {
    if(!goog.object.containsKey(this['succ'], n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }

    return jsnx.helper.toArray(this['pred'][n]);
};


// digraph definitions
/**
 * @see #successors
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors = jsnx.classes.DiGraph.prototype.successors;

/**
 * @see #successors_iter
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors_iter = jsnx.classes.DiGraph.prototype.successors_iter;


/**
 * Return an iterator over the edges.
 *
 * Edges are returned as tuples with optional data
 * in the order (node, neighbor, data).
 *
 * @see #edges
 *
 * Note:
 *
 *      Nodes in nbunch that are not in the graph will be (quietly) ignored.
 * 
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {boolean} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {goog.iter.Iterator} An iterator of (u,v) or (u,v,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.edges_iter = function(opt_nbunch, opt_data) {
     // handle calls with opt_data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
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
            nbr = nd[1];
            return jsnx.helper.iteritems(nbr);
        }, function(nbrd) {
            return [n, nbrd[0], nbrd[1]];
        });
    }
    else {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            nbr = nd[1];
            return jsnx.helper.iteritems(nbr);
        }, function(nbrd) {
            return [n, nbrd[0]];
        });
    }
};

// alias out_edges to edges

/**
 * @see #edges_iter
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges_iter = jsnx.classes.DiGraph.prototype.edges_iter;


/**
 * @see jsnx.Graph#edges
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges = jsnx.classes.Graph.prototype.edges;


/**
 * Return an iterator over the incoming edges.
 *
 * @see #edges_iter
 *
 * 
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {boolean} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {goog.iter.Iterator} An iterator of (u,v) or (u,v,d) tuples of 
 *      incoming edges.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges_iter = function(opt_nbunch, opt_data) {
     // handle calls with opt_data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
        opt_data = opt_nbunch;
        opt_nbunch = null;
    }

    var nodes_nrbs, n;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
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
        }, function(nbrd) {
            return [nbrd[0], n, nbrd[1]];
        });
    }
    else {
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrd) {
            return [nbrd[0], n];
        });
    }
};


/**
 * Return a list of the incoming edges.
 *
 * @see #edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {boolean} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!Array} A list of incoming edges
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges = function(opt_nbunch, opt_data) {
    return jsnx.helper.toArray(this.in_edges_iter(opt_nbunch, opt_data));
};


/**
 * Return an iterator for (node, degree).
 *
 * The node degree is the number of edges adjacent to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
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
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.zip(jsnx.helper.iteritems(this['succ']),
                                     jsnx.helper.iteritems(this['pred']));
    }
    else {
        nodes_nbrs = jsnx.helper.zip(
            jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
                return [n, this['succ'][n]];
            }, this),
            jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
                return [n, this['pred'][n]];
            }, this)
        );
    }

    if(!opt_weight) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            return [nd[0][0], jsnx.helper.len(nd[0][1]) +  
                              jsnx.helper.len(nd[1][1])];
        });
    }
    else {
        // edge weighted graph - degree is sum of edge weights
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var succ = nd[0][1],
                pred = nd[1][1],
                sum = 0, nbr;

                for(nbr in succ) {
                    sum += +goog.object.get(succ[nbr], opt_weight, 1);
                }

                for(nbr in pred) {
                    sum += +goog.object.get(pred[nbr], opt_weight, 1);
                }

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
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.iteritems(this['pred']);
    }
    else {
        nodes_nbrs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['pred'][n]];
        }, this);
    }

    if(!opt_weight) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            return [nd[0], goog.object.getCount(nd[1])];
        });
    }
    else {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0, ndbrs = nd[1];
            for(var u in ndbrs) {
                sum += +goog.object.get(ndbrs[u], opt_weight, 1);
            }
            return [nd[0], sum];
        });
    }
};


/**
 * Return an iterator for (node, out-degree).
 *
 * The node out-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
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
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(!goog.isDefAndNotNull(opt_nbunch)) {
        nodes_nbrs = jsnx.helper.iteritems(this['succ']);
    }
    else {
        nodes_nbrs = jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
            return [n, this['succ'][n]];
        }, this);
    }

    if(!opt_weight) {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            return [nd[0], goog.object.getCount(nd[1])];
        });
    }
    else {
        return jsnx.helper.map(nodes_nbrs, function(nd) {
            var sum = 0, ndbrs = nd[1];
            for(var u in ndbrs) {
                sum += +goog.object.get(ndbrs[u], opt_weight, 1);
            }
            return [nd[0], sum];
        });
    }
};


/**
 * Return the in-degree of a node or nodes.
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
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
 * @return {(number|Object}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree = function(opt_nbunch, opt_weight) {
    if(this.has_node(opt_nbunch)) { // return a single node
        return this.in_degree_iter(opt_nbunch, opt_weight).next()[1];
    }
    else {
        return jsnx.helper.objectFromKV(this.in_degree_iter(opt_nbunch, opt_weight));
    }
};


/**
 * Return the out-degree of a node or nodes.
 *
 * The node out-degree is the number of edges pointing out of the node.
 *
 * @see #degree
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
 * @return {(number|Object}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree = function(opt_nbunch, opt_weight) {
    if(this.has_node(opt_nbunch)) { // return a single node
        return this.out_degree_iter(opt_nbunch, opt_weight).next()[1];
    }
    else {
        return jsnx.helper.objectFromKV(this.out_degree_iter(opt_nbunch, opt_weight));
    }
};


/**
 * Remove all nodes and edges from the graph.
 *
 * This also removes the name, and all graph, node, and edge attributes.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.clear = function() {
    goog.object.clear(this['succ']);
    goog.object.clear(this['pred']);
    goog.object.clear(this['node']);
    goog.object.clear(this['graph']);
};


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_multigraph = function() {
    return false;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_directed = function() {
    return true;
};


/**
 * Return a directed copy of the graph.
 *
 * Notes:
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar D = new DiGraph(G) which returns a
 *      shallow copy of the data.
 *
 * @return {jsnx.DiGraph} A deepcopy of the graph
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.to_directed = function() {
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
 * @return {jsnx.Graph} 
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
jsnx.classes.DiGraph.prototype.to_undirected = function(opt_reciprocal) {
    var H = new jsnx.classes.Graph();
    H.name(this.name());
    H.add_nodes_from(this);

    var this_pred = this['pred'],
        u;

    if(opt_reciprocal) {
        H.add_edges_from(jsnx.helper.nested_chain(this.adjacency_iter(), function(nd) {
            u = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrd) {
            if(goog.object.containsKey(this_pred[u], nbrd[0])) {
                return [u, nbrd[0], jsnx.helper.deepcopy(nbrd[1])];
            }
        }));
    }
    else {
         H.add_edges_from(jsnx.helper.nested_chain(this.adjacency_iter(), function(nd) {
            u = nd[0];
            return jsnx.helper.iteritems(nd[1]);
        }, function(nbrd) {
            return [u, nbrd[0], jsnx.helper.deepcopy(nbrd[1])];
        }));
    }

    H['graph'] = jsnx.helper.deepcopy(this['graph']);
    H['node'] = jsnx.helper.deepcopy(this['node']);
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
 * @return {!jsnx.DiGraph} A copy of the graph or the graph itself
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.reverse = function(opt_copy) {
    opt_copy = !goog.isDef(opt_copy) || opt_copy;
    var H;

    if(opt_copy) {
        H = new this.constructor(null, {name: 'Reverse of (' + this.name() + ')'});
        H.add_nodes_from(this);
        H.add_edges_from(jsnx.helper.map(this.edges_iter(true), function(ed) {
            return [ed[1], ed[0], jsnx.helper.deepcopy(ed[2])];
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
 * @return {jsnx.DiGraph} A subgraph of the graph with the same edge attributes.
 *
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor(),
        // namespace shortcuts for speed
        H_succ = H['succ'],
        H_pred = H['pred'],
        this_succ = this['succ'];

    // add nodes
    jsnx.helper.forEach(bunch, function(n) {
        H_succ[n] = {};
        H_pred[n] = {};
    });
    // add edges
    jsnx.helper.forEach(H_succ, function(u) {
        var Hnbrs = H_succ[u];
        goog.object.forEach(this_succ[u], function(datadict, v) {
            if(goog.object.containsKey(H_succ,v)) {
                // add both representations of edge: u-v and v-u
                Hnbrs[v] = datadict;
                H_pred[v][u] = datadict;
            }
        });
    });
    jsnx.helper.forEach(H, function(n) {
        H['node'][n] = this['node'][n];
    }, this);
    H['graph'] = this['graph'];
    return H;
};
