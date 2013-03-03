'use strict';
goog.provide('jsnx.algorithms.clique');


goog.require('goog.iter');
goog.require('goog.iter.Iterator');
goog.require('goog.structs.Set');
goog.require('goog.object');
goog.require('goog.array');

/**
 * Search for all maximal cliques in a graph.
 * 
 * This algorithm searches for maximal cliques in a graph.
 * maximal cliques are the largest complete subgraph containing
 * a given point.  The largest maximal clique is sometimes called
 * the maximum clique.
 * 
 * This implementation is a generator of lists each
 * of which contains the members of a maximal clique.
 * To obtain a list of cliques, use list(find_cliques(G)).
 * The method essentially unrolls the recursion used in
 * the references to avoid issues of recursion stack depth.
 * 
 * See Also
 * --------
 * find_cliques_recursive : 
 *    A recursive version of the same algorithm
 * 
 * Notes
 * -----
 * Based on the algorithm published by Bron & Kerbosch (1973) [1]_
 * as adapated by Tomita, Tanaka and Takahashi (2006) [2]_
 * and discussed in Cazals and Karande (2008) [3]_.
 * 
 * This algorithm ignores self-loops and parallel edges as
 * clique is not conventionally defined with such edges.
 * 
 * There are often many cliques in graphs.  This algorithm can
 * run out of memory for large graphs.
 * 
 * References
 * ----------
 * .. [1] Bron, C. and Kerbosch, J. 1973. 
 *    Algorithm 457: finding all cliques of an undirected graph. 
 *    Commun. ACM 16, 9 (Sep. 1973), 575-577. 
 *    http://portal.acm.org/citation.cfm?doid=362342.362367
 * 
 * .. [2] Etsuji Tomita, Akira Tanaka, Haruhisa Takahashi, 
 *    The worst-case time complexity for generating all maximal 
 *    cliques and computational experiments, 
 *    Theoretical Computer Science, Volume 363, Issue 1, 
 *    Computing and Combinatorics, 
 *    10th Annual International Conference on 
 *    Computing and Combinatorics (COCOON 2004), 25 October 2006, Pages 28-42
 *    http://dx.doi.org/10.1016/j.tcs.2006.06.015
 * 
 * .. [3] F. Cazals, C. Karande, 
 *    A note on the problem of reporting maximal cliques, 
 *    Theoretical Computer Science,
 *    Volume 407, Issues 1-3, 6 November 2008, Pages 564-568, 
 *    http://dx.doi.org/10.1016/j.tcs.2008.05.010
 *
 * @param {jsnx.classes.Graph} G
 *
 * @return {!goog.iter.Iterator}
 */
jsnx.algorithms.clique.find_cliques = function(G) {
    // Cache nbrs and find first pivot (highest degree)
    var maxconn = -1,
        nnbrs = {},
        pivotnbrs = new goog.structs.Set(); // handle empty graph

    goog.iter.forEach(G.adjacency_iter(), function(d) {
        var nbrs = new goog.structs.Set(goog.object.getKeys(d[1]));
        nbrs.remove(d[0]);
        var conn = nbrs.getCount();
        if(conn > maxconn) {
            nnbrs[d[0]] = pivotnbrs = nbrs;
            maxconn = conn;
        }
        else {
            nnbrs[d[0]] = nbrs;
        }
    });

    // Initial setup
    var cand = new goog.structs.Set(goog.object.getKeys(nnbrs)),
        smallcand = cand.difference(pivotnbrs),
        done = new goog.structs.Set(),
        stack = [],
        clique_so_far = [];

    // start main loop
    var iterator = new goog.iter.Iterator();
    /**
     * @this goog.iter.Iterator
     */
    iterator.next = function() {
        if(smallcand.getCount() === 0 && stack.length === 0) {
            throw goog.iter.StopIteration;
        }
        var n, result, iterable;
        if(smallcand.getCount() > 0) {
            // any nodes left to check?
            n = goog.iter.toIterator(smallcand).next();
            smallcand.remove(n);
        }
        else {
            // back out clique_so_far
            var v = stack.pop();
            cand = v[0];
            done = v[1];
            smallcand = v[2];
            clique_so_far.pop();
            return this.next(); // continue
        }
        // add next node to clique
        clique_so_far.push(n);
        cand.remove(n);
        done.add(n);
        var nn = nnbrs[n],
            new_cand = cand.intersection(nn),
            new_done = done.intersection(nn);
        // check if we have more to search
        if(new_cand.getCount() === 0) {
            if(new_done.getCount() === 0) {
                // Found a clique!
                result = goog.array.clone(clique_so_far);
            }
            clique_so_far.pop();
            if(result) {
                return result;
            }
        }
        // Shortcut -- only one node left!
        if(new_done.getCount() === 0 && new_cand.getCount() === 1) {
            result = goog.array.concat(clique_so_far, new_cand.getValues());
            clique_so_far.pop();
            return result; // continue
        }

        // find pivot node (max connected in cand)
        var numb_cand = new_cand.getCount(),
            maxconndone = -1,
            pivotdonenbrs, cn, conn;
        iterable = goog.iter.toIterator(new_done);
        while((n = goog.iter.nextOrValue(iterable, null)) !== null) {
            cn = new_cand.intersection(nnbrs[n]);
            conn = cn.getCount();
            if(conn > maxconndone) {
                pivotdonenbrs = cn;
                maxconndone = conn;
                if(maxconndone === numb_cand) {
                    break; 
                }
            }

        }
        // Shortcut--this part of tree already searched
        if(maxconndone === numb_cand) {
            clique_so_far.pop();
            return this.next();
        }
        // still finding pivot node
        // look in cand nodes second
        maxconn = -1;
        iterable = goog.iter.toIterator(new_cand);
        while((n = goog.iter.nextOrValue(iterable, null)) !== null) {
            cn = new_cand.intersection(nnbrs[n]);
            conn = cn.getCount();
            if(conn > maxconn) {
                pivotnbrs = cn;
                maxconn = conn;
                if(maxconn === numb_cand - 1) {
                    break;
                }
            }
        }
        // pivot node is max connected in cand form done or cand
        if(maxconndone > maxconn) {
            pivotnbrs = pivotdonenbrs;
        }
        // save search status for later backout
        stack.push([cand, done, smallcand]);
        cand = new_cand;
        done = new_done;
        smallcand = cand.difference(pivotnbrs);
        return this.next();
    };
    return iterator;
};
goog.exportSymbol('jsnx.find_cliques', jsnx.algorithms.clique.find_cliques);

/**
 * Recursive search for all maximal cliques in a graph.
 * 
 * This algorithm searches for maximal cliques in a graph.
 * Maximal cliques are the largest complete subgraph containing
 * a given point.  The largest maximal clique is sometimes called
 * the maximum clique.
 *
 * This implementation returns a list of lists each of
 * which contains the members of a maximal clique.
 *  
 * See Also
 * --------
 * find_cliques : An nonrecursive version of the same algorithm
 *
 * Notes
 * -----
 * Based on the algorithm published by Bron & Kerbosch (1973) [1]_
 * as adapated by Tomita, Tanaka and Takahashi (2006) [2]_
 * and discussed in Cazals and Karande (2008) [3]_.
 *
 * This algorithm ignores self-loops and parallel edges as
 * clique is not conventionally defined with such edges.
 *
 * References
 * ----------
 * .. [1] Bron, C. and Kerbosch, J. 1973. 
 *    Algorithm 457: finding all cliques of an undirected graph. 
 *    Commun. ACM 16, 9 (Sep. 1973), 575-577. 
 *    http://portal.acm.org/citation.cfm?doid=362342.362367
 *
 * .. [2] Etsuji Tomita, Akira Tanaka, Haruhisa Takahashi, 
 *    The worst-case time complexity for generating all maximal 
 *    cliques and computational experiments, 
 *    Theoretical Computer Science, Volume 363, Issue 1, 
 *    Computing and Combinatorics, 
 *    10th Annual International Conference on 
 *    Computing and Combinatorics (COCOON 2004), 25 October 2006, Pages 28-42
 *    http://dx.doi.org/10.1016/j.tcs.2006.06.015
 *
 * .. [3] F. Cazals, C. Karande, 
 *    A note on the problem of reporting maximal cliques, 
 *    Theoretical Computer Science,
 *    Volume 407, Issues 1-3, 6 November 2008, Pages 564-568, 
 *    http://dx.doi.org/10.1016/j.tcs.2008.05.010
 *
 *
 * @param {jsnx.classes.Graph} G
 *
 * @return {!Array}
 */
jsnx.algorithms.clique.find_cliques_recursive = function(G) {
    var nnbrs = {};
    goog.iter.forEach(G.adjacency_iter(), function(nd) {
        var nbrs = new goog.structs.Set(goog.object.getKeys(nd[1]));
        nbrs.remove(nd[0]);
        nnbrs[nd[0]] = nbrs;
    });
    if(goog.object.isEmpty(nnbrs)) {
        return [];
    }
    var cand = new goog.structs.Set(goog.object.getKeys(nnbrs)),
        done = new goog.structs.Set(),
        clique_so_far = [],
        cliques = [];
    jsnx.algorithms.clique.extend_(nnbrs, cand, done, clique_so_far, cliques);
    return cliques;
};
goog.exportSymbol('jsnx.find_cliques_recursive', jsnx.algorithms.clique.find_cliques_recursive);


jsnx.algorithms.clique.extend_ = function(nnbrs, cand, done, so_far, cliques) {
    // find pivot node (max connections in cand)
    var maxconn = -1,
        numb_cand = cand.getCount(),
        pivotnbrs,
        iterable, n, cn, conn;

    iterable = goog.iter.toIterator(done);
    while((n = goog.iter.nextOrValue(iterable, null)) !== null) { 
        cn = cand.intersection(nnbrs[n]);
        conn = cn.getCount();
        if(conn > maxconn) {
            pivotnbrs = cn;
            maxconn = conn;
            if(conn === numb_cand) {
                // All possible cliques already found
                return;
            }
        }
    }

    goog.iter.forEach(cand, function(n) {
        var cn = cand.intersection(nnbrs[n]),
            conn = cn.getCount();
        if(conn > maxconn) {
            pivotnbrs = cn;
            maxconn = conn;
        }
    });

    // Use pivot to reduce number of nodes to examine
    var smallercand = cand.difference(pivotnbrs);
    goog.iter.forEach(smallercand, function(n) {
        cand.remove(n);
        so_far.push(n);
        var nn = nnbrs[n],
            new_cand = cand.intersection(nn),
            new_done = done.intersection(nn);

        if(new_cand.isEmpty() && new_done.isEmpty()) {
            // found the clique
            cliques.push(goog.array.clone(so_far));
        }
        else if(new_done.isEmpty() && new_cand.getCount() === 1) {
            // shortcut if only one node left
            cliques.push(goog.array.concat(so_far, new_cand.getValues()));
        }
        else {
            jsnx.algorithms.clique.extend_(nnbrs, new_cand, new_done, so_far, cliques);
        }
        done.add(so_far.pop());
    });

};


//TODO: make_max_clique_graph
//TODO: make_clique_bipartite
//TODO: project_down
//TODO: project_up


/**
 * Return the clique number (size of the largest clique) for G.
 *
 * An optional list of cliques can be input if already computed.
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {(Array|goog.iter.Iterable)=} opt_cliques
 *
 * @return {number};
 */
jsnx.algorithms.clique.graph_clique_number = function(G, opt_cliques) {
    if(!goog.isDefAndNotNull(opt_cliques)) {
        opt_cliques = jsnx.algorithms.clique.find_cliques(G);
    }
    var max = 0;
    jsnx.helper.forEach(opt_cliques, function(c) {
        max = c.length > max ? c.length : max;
    });
    return max;
};
goog.exportSymbol('jsnx.graph_clique_number', jsnx.algorithms.clique.graph_clique_number );


/**
 * Returns the number of maximal cliques in G.
 *
 * An optional list of cliques can be input if already computed.
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {(Array|goog.iter.Iterable)=} opt_cliques
 *
 * @return {number}
 */
jsnx.algorithms.clique.graph_number_of_cliques = function(G, opt_cliques) {
    if(!goog.isDefAndNotNull(opt_cliques)) {
        opt_cliques = jsnx.algorithms.clique.find_cliques(G);
    }
    return jsnx.helper.toArray(opt_cliques).length; 
};
goog.exportSymbol('jsnx.graph_number_of_cliques', jsnx.algorithms.clique.graph_number_of_cliques );


//TODO: node_clique_number


/**
 * Returns the number of maximal cliques for each node.
 *
 * Returns a single or list depending on input nodes.
 * Optional list of cliques can be input if already computed.
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {jsnx.NodeContainer=} opt_nodes List of nodes
 * @param {(Array|goog.iter.Iterable)=} opt_cliques List of cliques
 *
 * @return {!(Object|number)}
 */
jsnx.algorithms.clique.number_of_cliques = function(G, opt_nodes, opt_cliques) {
    if(!goog.isDefAndNotNull(opt_cliques)) {
        opt_cliques = goog.iter.toArray(jsnx.algorithms.clique.find_cliques(G));
    }
    else {
        opt_cliques = goog.iter.toArray(opt_cliques);
    }

    if(!goog.isDefAndNotNull(opt_nodes)) {
        opt_nodes = G.nodes(); // none, get entire graph
    }

    var numcliq;
    if(!goog.isArray(opt_nodes)) {
        var v = opt_nodes;
        numcliq = goog.array.filter(
            goog.asserts.assertArray(opt_cliques),
            function(/**Array*/c) {
              // account for string and number nodes
              return  goog.array.contains(c, v) || goog.array.contains(c, v + '');
            }
        ).length;
    }
    else {
        numcliq = {};
        goog.array.forEach(opt_nodes, function(/**jsnx.Node*/v) {
            numcliq[v] = goog.array.filter(
                goog.asserts.assertArray(opt_cliques),
                function(/**Array*/c) {
                  // account for string and number nodes
                  return  goog.array.contains(c, v) || 
                      goog.array.contains(c, v + '');
                }
            ).length;
        });
    }
    return numcliq;
};
goog.exportSymbol('jsnx.number_of_cliques', jsnx.algorithms.clique.number_of_cliques );


//TODO: cliques_containing_node 
