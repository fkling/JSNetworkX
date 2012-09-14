"use strict";
goog.provide('jsnx.generators.classic');

goog.require('jsnx.classes.Graph');
goog.require('jsnx.helper');


/**
 * @param {number} n nodes
 * @param {number} r bredth
 *
 * @return {goog.iter.Iterator}
 */
jsnx.generators.classic.tree_edges_ = function(n, r) {
    // helper function for trees
    // yields edges in rooted tree at 0 with n nodes and branching ratio r
    var nodes = jsnx.helper.range(n),
        parents = [nodes.next()],
        iterator = new goog.iter.Iterator(),
        source;

    iterator.next = function() {
        if(parents.length === 0) {
            throw goog.iter.StopIteration;
        }
        return parents.splice(0,1)[0];
    };

    return jsnx.helper.nested_chain(iterator, function(n) {
        source = n;
        return jsnx.helper.range(r);
    }, function(i) {
        try {
            var target = nodes.next();
            parents.append(target);
            return [source, target];
        }
        catch(e) {
            if(e !== jsnx.iter.StopIteration) {
                throw e;
            }
        }
    });
};

//TODO: full_rary_tree
//TODO: balanced_tree
//TODO: barbell_graph

/**
 * Return the complete graph K_n with n nodes.
 *
 * Node labels are the integers 0 to n-1.
 *  @param{number} n The number of nodes to add to the graph
 *  @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *  
 *  @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.complete_graph = function(n, opt_create_using) {
    var G = jsnx.generators.classic.empty_graph(n, opt_create_using);
    G.name('complete_graph(' + n + ')');
    if(n>1) {
       G.add_edges_from(G.is_directed() ? 
           jsnx.helper.permutations(jsnx.helper.range(n), 2) :  
           jsnx.helper.combinations(jsnx.helper.range(n), 2)
       );
    }
    return G;
};
goog.exportSymbol('jsnx.complete_graph', jsnx.generators.classic.complete_graph);

//TODO: complete_bipartite_graph
//TODO: circular_ladder_graph

/**
 * Return the cycle graph C_n over n nodes.
 *
 * C_n is the n-path with two end-nodes connected.
 *
 * Node labels are the integers 0 to n-1
 * If create_using is a DiGraph, the direction is in increasing order.
 * 
 * @param{number} n The number of nodes to add to the graph
 * @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *  
 * @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.cycle_graph = function(n, opt_create_using) {
    var G = jsnx.generators.classic.path_graph(n, opt_create_using);
    G.name('cycle_graph(' + n + ')');
    if(n>1) {
       G.add_edge(n-1,0);
    }
    return G;
};
goog.exportSymbol('jsnx.cycle_graph', jsnx.generators.classic.cycle_graph);

//TODO: dorogovtsev_goltsev_mendes_graph

/**
 *  Return the empty graph with n nodes and zero edges.
 *
 *  Node labels are the integers 0 to n-1
 *
 *  For example:
 *  >>> var G = jsnx.empty_graph(10)
 *  >>> G.number_of_nodes()
 *  10
 *  >>> G.number_of_edges()
 *  0
 *
 *  The variable create_using should point to a "graph"-like object that
 *  will be cleaned (nodes and edges will be removed) and refitted as
 *  an empty "graph" with n nodes with integer labels. This capability
 *  is useful for specifying the class-nature of the resulting empty
 *  "graph" (i.e. Graph, DiGraph, MyWeirdGraphClass, etc.).
 *  
 *  The variable create_using has two main uses:
 *  Firstly, the variable create_using can be used to create an
 *  empty digraph, network,etc.  For example,
 *   
 *  >>> var n = 10
 *  >>> var G = jsnx.empty_graph(n, jsnx.DiGraph())
 *
 *  will create an empty digraph on n nodes.
 *
 *  Secondly, one can pass an existing graph (digraph, pseudograph,
 *  etc.) via create_using. For example, if G is an existing graph
 *  (resp. digraph, pseudograph, etc.), then empty_graph(n,G)
 *  will empty G (i.e. delete all nodes and edges using G.clear() in
 *  base) and then add n nodes and zero edges, and return the modified
 *  graph (resp. digraph, pseudograph, etc.).
 *
 *  @see create_empty_copy
 *
 *  @param{number=} opt_n The number of nodes to add to the graph
 *  @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *  
 *  @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.empty_graph = function(opt_n, opt_create_using) {
    if(opt_n instanceof jsnx.classes.Graph) {
        opt_create_using = opt_n;
        opt_n = null;
    }
    if(!goog.isDefAndNotNull(opt_n)) {
        opt_n = 0;
    }

    var G;

    if(!goog.isDefAndNotNull(opt_create_using)) {
        // default empty graph is a simple graph
        G = new jsnx.classes.Graph();
    }
    else {
        G = opt_create_using;
        G.clear();
    }

    G.add_nodes_from(jsnx.helper.range(opt_n));
    G.name('empty_graph(' + opt_n + ')');
    return G;
};
goog.exportSymbol('jsnx.empty_graph', jsnx.generators.classic.empty_graph);

//TODO: grid_2d_graph
//TODO: grid_graph
//TODO: hypercube_graph
//TODO: ladder_graph
//TODO: lollipop_graph

/**
 * Return the Null graph with no nodes or edges.
 *
 * See empty_graph for the use of create_using.
 *
 * @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.null_graph = function(opt_create_using) {
    var G = jsnx.generators.classic.empty_graph(0, opt_create_using);
    G.name('null_graph()');
    return G;
};
goog.exportSymbol('jsnx.null_graph', jsnx.generators.classic.null_graph);


/**
 * Return the Null graph with no nodes or edges.
 *
 * See empty_graph for the use of create_using.
 *
 * @param{number} n The number of nodes to add to the graph
 * @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.path_graph = function(n, opt_create_using) {
    var G = jsnx.generators.classic.empty_graph(n, opt_create_using);
    G.name('path_graph(' + n + ')');
    G.add_edges_from(goog.iter.map(jsnx.helper.range(n-1), function(v) {
        return [v, v+1];
    }));
    return G;
};
goog.exportSymbol('jsnx.path_graph', jsnx.generators.classic.path_graph);

//TODO: star_graph

/**
 * Return the Trivial graph with one node (with integer label 0) and no edges.
 *
 * @param{jsnx.classes.Graph=} opt_create_using Graph instance to empty and
 *      add nodes to.
 *
 * @return {jsnx.classes.Graph}
 */
jsnx.generators.classic.trivial_graph = function(opt_create_using) {
    var G = jsnx.generators.classic.empty_graph(1, opt_create_using);
    G.name('null_graph()');
    return G;
};
goog.exportSymbol('jsnx.trivial_graph', jsnx.generators.classic.trivial_graph);

//TODO: wheel_graph
