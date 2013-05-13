"use strict";
goog.provide('jsnx.classes.func');

goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.object');
goog.require('jsnx.exception');
goog.require('jsnx.contrib.Map');

/**
 * Return a copy of the graph nodes in a list.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {Array} List of nodes
 * @export
 */
jsnx.classes.func.nodes = function(G) {
    return G.nodes();
};
goog.exportSymbol('jsnx.nodes', jsnx.classes.func.nodes);


/**
 * Return an iterator over the graph nodes.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {goog.iter.Iterator} Iterator over graph nodes
 * @export
 */
jsnx.classes.func.nodes_iter = function(G) {
    return G.nodes_iter();
};
goog.exportSymbol('jsnx.nodes_iter', jsnx.classes.func.nodes_iter);


/**
 * Return a list of edges adjacent to nodes in nbunch.
 *
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.NodeContainer=} opt_nbunch Nodes
 *
 * @return {Array} List of edges
 * @export
 */
jsnx.classes.func.edges = function(G, opt_nbunch) {
    return G.edges(opt_nbunch);
};
goog.exportSymbol('jsnx.edges', jsnx.classes.func.edges);


/**
 * Return iterator over  edges adjacent to nodes in nbunch.
 * 
 * Return all edges if nbunch is unspecified or nbunch=None.
 * For digraphs, edges=out_edges
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.NodeContainer=} opt_nbunch Nodes
 *
 * @return {goog.iter.Iterator} Iterator over edges
 * @export
 */
jsnx.classes.func.edges_iter = function(G, opt_nbunch) {
    return G.edges_iter(opt_nbunch);
};
goog.exportSymbol('jsnx.edges_iter', jsnx.classes.func.edges_iter);


/**
 * Return degree of single node or of nbunch of nodes.
 * If nbunch is ommitted, then return degrees of *all* nodes.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.NodeContainer=} opt_nbunch Nodes
 * @param {string=} opt_weight Weight attribute name
 *
 * @return {(number|jsnx.contrib.Map)} Degree of node(s)
 * export
 */
jsnx.classes.func.degree = function(G, opt_nbunch, opt_weight) {
    return G.degree(opt_nbunch, opt_weight);
};
goog.exportSymbol('jsnx.degree', jsnx.classes.func.degree);


/**
 * Return a list of nodes connected to node n.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.Node} n Node
 *
 * @return {Array} List of nodes
 * @export
 */
jsnx.classes.func.neighbors = function(G, n) {
    return G.neighbors(n);
};
goog.exportSymbol('jsnx.neighbors', jsnx.classes.func.neighbors);


/**
 * Return the number of nodes in the graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Number of nodes
 * @export
 */
jsnx.classes.func.number_of_nodes = function(G) {
    return G.number_of_nodes();
};
goog.exportSymbol('jsnx.number_of_nodes', jsnx.classes.func.number_of_nodes);


/**
 * Return the number of edges in the graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Number of edges
 * @export
 */
jsnx.classes.func.number_of_edges = function(G) {
    return G.number_of_edges();
};
goog.exportSymbol('jsnx.number_of_edges', jsnx.classes.func.number_of_edges);


/**
 * Return the density of a graph.
 * The density for undirected graphs is
 *
 * {@math d = \frac{2m}{n(n-1)}}
 *
 * and for directed graphs is
 *
 * {@math \frac{m}{n(n-1)}}
 *
 * where n is the number of nodes and m is the number of edges in G
 *
 * The density is 0 for an graph without edges and 1.0 for a complete graph.
 * The density of multigraphs can be higher than 1.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {number} Density
 * @export
 */
jsnx.classes.func.density = function(G) {
    var n = G.number_of_nodes(),
        m = G.number_of_edges(),
        d;

    if(m === 0) { // includes cases n === 0 and n === 1
        d = 0.0;
    }
    else {
        if(G.is_directed()) {
            d = m / (n * (n-1));
        }
        else {
            d = (m * 2) / (n * (n-1));
        }
    }

    return d;
};
goog.exportSymbol('jsnx.density', jsnx.classes.func.density);


/**
 * Return a list of the frequency of each degree value.
 *
 * Note: the bins are width one, hence list.length can be large
 * (Order(number_of_edges))
 *
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {Array} A list of frequencies of degrees.
 *      The degree values are the index in the list.
 *  @export
 */
jsnx.classes.func.degree_histogram = function(G) {
    var degseq = G.degree().values();
    var dmax = Math.max.apply(Math, degseq) + 1;
    var freq = goog.array.repeat(0, dmax);

    goog.array.forEach(degseq, function(d) {
        freq[d] += 1;
    });

    return freq;
};
goog.exportSymbol('jsnx.degree_histogram', jsnx.classes.func.degree_histogram);


/**
 * Return True if graph is directed.
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {boolean}  True if graph is directed
 * @export
 */
jsnx.classes.func.is_directed = function(G) {
    return G.is_directed();
};
goog.exportSymbol('jsnx.is_directed', jsnx.classes.func.is_directed);


/**
 * Modify graph to prevent addition of nodes or edges.
 *
 * This does not prevent modification of edge data.
 * To "unfreeze" a graph you must make a copy.
 *
 * @see #is_frozen
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {jsnx.classes.Graph} A reference to the input graph
 * @export
 */
jsnx.classes.func.freeze = function(G) {
    function frozen() {
        throw new jsnx.exception.JSNetworkXError(
            'Frozen graph can\'t be modified'
        );
    }

    // This double assignment is necessary for the closure compiler
    G['add_node'] = G.add_node = frozen;
    G['add_nodes_from'] = G.add_nodes_from = frozen;
    G['remove_node'] = G.remove_node = frozen;
    G['remove_nodes_from'] = G.remove_nodes_from = frozen;
    G['add_edge'] = G.add_edge = frozen;
    G['add_edges_from'] = G.add_edges_from = frozen;
    G['remove_edge'] = G.remove_edge = frozen;
    G['remove_edges_from'] = G.remove_edges_from = frozen;
    G['clear'] = G.clear = frozen;
    G['frozen'] = G.frozen = true;
    return G;
};
goog.exportSymbol('jsnx.freeze', jsnx.classes.func.freeze);


/**
 * Return True if graph is frozen.
 *
 * @see #freeze
 *
 * @param {jsnx.classes.Graph} G Graph
 *
 * @return {boolean}  True if graph is frozen.
 * @export
 */
jsnx.classes.func.is_frozen = function(G) {
    return !!G.frozen;
};
goog.exportSymbol('jsnx.is_frozen', jsnx.classes.func.is_frozen);


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * Note:  subgraph(G) calls G.subgraph()
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.NodeContainer} nbunch 
 *      A container of nodes that will be iterated through once (thus
 *      it should be an iterator or be iterable).  Each element of the
 *      container should be a valid node type: any hashable type except
 *      None.  If nbunch is None, return all edges data in the graph.
 *      Nodes in nbunch that are not in the graph will be (quietly)
 *      ignored.
 *
 * @return {jsnx.classes.Graph} Subgraph
 * @export
 */
jsnx.classes.func.subgraph = function(G, nbunch) {
    return G.subgraph(nbunch);
};
goog.exportSymbol('jsnx.subgraph', jsnx.classes.func.subgraph);


/**
 * Return a copy of the graph G with all of the edges removed.
 *
 * Notes: Graph, node, and edge data is not propagated to the new graph.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {boolean} opt_with_nodes (default=True)
 *      Include nodes.
 *
 * @return {jsnx.classes.Graph} A copy of the graph
 * @export
 */
jsnx.classes.func.create_empty_copy = function(G, opt_with_nodes) {
    if(!goog.isDef(opt_with_nodes)) {
        opt_with_nodes = true;
    }

    var H = new G.constructor();
    if(opt_with_nodes) {
        H.add_nodes_from(G);
    }
    return H;
};
goog.exportSymbol('jsnx.create_empty_copy', jsnx.classes.func.create_empty_copy);


/**
 * Print short summary of information for the graph G or the node n.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {jsnx.Node=} opt_n A node in the graph G
 *
 * @return {string} Info
 * @export
 */
jsnx.classes.func.info = function(G, opt_n) {
    var info = '';
    if(!goog.isDefAndNotNull(opt_n)) {
        info += 'Name: ' + G.name() + '\n';
        var type_name = [G.constructor['__name__']];
        info += 'Type: ' + type_name.join(',') + '\n';
        info += 'Number of nodes: ' + G.number_of_nodes() + '\n';
        info += 'Number of edges: ' + G.number_of_edges() + '\n';
        var nnodes = G.number_of_nodes();
        if(nnodes > 0) {
            if(G.is_directed()) {
                info += 'Average in degree: ' + (goog.math.sum.apply(null,
                          G.in_degree().values()) / nnodes).toFixed(4) + '\n';
                info += 'Average out degree: ' + (goog.math.sum.apply(null,
                           G.out_degree().values()) / nnodes).toFixed(4);
            }
            else {
                var s = goog.math.sum.apply(
                    null,
                    G.degree().values()
                );
                info += 'Average degree: ' + (s/nnodes).toFixed(4);
            }
        }
    }
    else {
        if(!G.has_node(opt_n)) {
            throw new jsnx.exception.JSNetworkXError(
                'node ' + opt_n + ' not in graph'
            );
        }
        info += 'Node ' + opt_n + ' has the following properties:\n';
        info += 'Degree: ' + G.degree(opt_n) + '\n';
        info += 'Neighbors: ' + G.neighbors(opt_n).join(' ');
    }
    return info;
};
goog.exportSymbol('jsnx.info', jsnx.classes.func.info);


/**
 * Set node attributes from dictionary of nodes and values
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 * @param {Object} attributes Dictionary of attributes keyed by node
 * @export
 */
jsnx.classes.func.set_node_attributes = function(G, name, attributes) {
    goog.object.forEach(attributes, function(value, node) {
        G['node'].get(node)[name] = value;
    });
};
goog.exportSymbol('jsnx.set_node_attributes', jsnx.classes.func.set_node_attributes);


/**
 * Get node attributes from graph
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 *
 * @return {!jsnx.contrib.Map} Dictionary of attributes keyed by node.
 * @export
 */
jsnx.classes.func.get_node_attributes = function(G, name) {
    var dict = new jsnx.contrib.Map();
    G['node'].forEach(function(n, d) {
        if(goog.object.containsKey(d, name)) {
            dict.set(n, d[name]);
        }
    });
    return dict;
};
goog.exportSymbol('jsnx.get_node_attributes', jsnx.classes.func.get_node_attributes);


/**
 * Set edge attributes from dictionary of edge tuples and values
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 * @param {jsnx.contrib.Map} attributes 
 *    Dictionary of attributes keyed by edge (tuple).
 * @export
 */
jsnx.classes.func.set_edge_attributes = function(G, name, attributes) {
    attributes.forEach(function(edge, value) {
        G.get(edge[0]).get(edge[1])[name] = value;
    });
};
goog.exportSymbol('jsnx.set_edge_attributes', jsnx.classes.func.set_edge_attributes);


/**
 * Get edge attributes from graph
 *
 * Since keys can only be strings in JavaScript, the edge is returned as 
 * {@code "node1,node2"} string. You'd have to call {@code .split(',')} on
 * the keys to extract the actual node names.
 *
 * @param {jsnx.classes.Graph} G Graph
 * @param {string} name Attribute name
 *
 * @return {!jsnx.contrib.Map} Dictionary of attributes keyed by edge.
 * @export
 */
jsnx.classes.func.get_edge_attributes = function(G, name) {
    var dict = new jsnx.contrib.Map();
    goog.object.forEach(G.edges(null, true), function(edged) {
        if(goog.object.containsKey(edged[2], name)) {
            var value = edged[2][name];
            edged.length = 2; // cut of data
            dict.set(edged, value);
        }
    });
    return dict;
};
goog.exportSymbol('jsnx.get_edge_attributes', jsnx.classes.func.get_edge_attributes);

