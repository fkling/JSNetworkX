"use strict";
goog.provide('jsnx.algorithms.graphical');

goog.require('goog.math');
goog.require('goog.array');
goog.require('jsnx.exception');
goog.require('jsnx.utils.misc');

/**
 * Returns True if deg_sequence is a valid degree sequence.
 * A degree sequence is valid if some graph can realize it.
 *
 * @param {Array} deg_sequence
 *      A list of integers where each element specifies the degree of a node
 *      in a graph.
 * @param {string=} opt_method (default: 'hh') ('eg' | 'hh')
 *      The method used to validate the degree sequence.  
 *      "eg" corresponds to the Erdős-Gallai algorithm, and 
 *      "hh" to the Havel-Hakimi algorithm.
 *
 * @return {boolean} 
 *      True if deg_sequence is a valid degree sequence and False if not.
 * @export
 */

jsnx.algorithms.graphical.is_valid_degree_sequence = function(deg_sequence, opt_method) {
    if(opt_method === 'eg') {
        return jsnx.algorithms.graphical.is_valid_degree_sequence_erdos_gallai(deg_sequence);
    }
    else if(!goog.isDefAndNotNull(opt_method) || opt_method === 'hh') {
        return jsnx.algorithms.graphical.is_valid_degree_sequence_havel_hakimi(deg_sequence);
    }
    else {
        throw new jsnx.exception.JSNetworkXException(
            "`opt_method` must be 'eg' or 'hh'"
        );
    }
};
goog.exportSymbol('jsnx.is_valid_degree_sequence', jsnx.algorithms.graphical.is_valid_degree_sequence );


/**
 * Returns True if deg_sequence is a valid degree sequence.
 * A degree sequence is valid if some graph can realize it. 
 * Validation proceeds via the Havel-Hakimi algorithm.
 *
 * Worst-case run time is: O( n^(log n) )
 *
 * @param {Array} deg_sequence
 *      A list of integers where each element specifies the degree of a node
 *      in a graph.
 *
 * @return {boolean} 
 *      True if deg_sequence is a valid degree sequence and False if not.
 * @export
 */
jsnx.algorithms.graphical.is_valid_degree_sequence_havel_hakimi = function(deg_sequence) {
    //some simple tests
    if(deg_sequence.length === 0) {
        return true; // empty sequence = empty graph
    }
    if(!jsnx.utils.misc.is_list_of_ints(deg_sequence)) {
        return false; // list of ints
    }
    if(Math['min'].apply(null, deg_sequence) < 0) {
        return false; // each int not negative
    }
    if(goog.math.sum.apply(null, deg_sequence) % 2 !== 0) {
        return false; // must be even
    }

    // successively reduce degree sequence by removing node of maximum degree
    // as in Havel-Hakimi algorithm
    
    var s = goog.array.clone(deg_sequence);
    while(s.length > 0) {
        goog.array.sort(s); // sort in increasing order
        if(s[0] < 0) {
            return false; // check if removed too many from some node
        }
        var d = s.pop(); // pop largest degree
        if(d === 0) {
            return true; // done! rest must be zero due to ordering
        }

        // degree must be <= number of available nodes
        if(d > s.length) {
            return false;
        }

        // remove edges to nodes of next higher degrees
        // s.reverse() to make it easy to get at higher degree nodes
        for(var i = s.length - 1, l = s.length - (d + 1); i > l; i--) {
            s[i] -= 1;
        }
    }
    // should never get here b/c either d==0, d>len(s) or d<0 before s=[]
    return false;
};
goog.exportSymbol('jsnx.is_valid_degree_sequence_havel_hakimi', jsnx.algorithms.graphical.is_valid_degree_sequence_havel_hakimi);


/**
 * Returns True if deg_sequence is a valid degree sequence.
 * A degree sequence is valid if some graph can realize it. 
 * Validation proceeds via the Erdős-Gallai algorithm.
 *
 * Worst-case run time is: O( n**2 )
 *
 * @param {Array} deg_sequence
 *      A list of integers where each element specifies the degree of a node
 *      in a graph.
 *
 * @return {boolean} 
 *      True if deg_sequence is a valid degree sequence and False if not.
 * @export
 */
jsnx.algorithms.graphical.is_valid_degree_sequence_erdos_gallai = function(deg_sequence) {
    //some simple tests
    if(deg_sequence.length === 0) {
        return true; // empty sequence = empty graph
    }
    if(!jsnx.utils.misc.is_list_of_ints(deg_sequence)) {
        return false; // list of ints
    }
    if(Math['min'].apply(null, deg_sequence) < 0) {
        return false; // each int not negative
    }
    if(goog.math.sum.apply(null, deg_sequence) % 2 !== 0) {
        return false; // must be even
    }

    var n = deg_sequence.length,
        deg_seq = goog.array.clone(deg_sequence).sort(function(a, b) {
            return b - a;
        }), // reverse order
        sigk = [], i, l;
    for(i = 1, l = deg_seq.length; i < l; i++) {
        if(deg_seq[i] < deg_seq[i-1]) {
            sigk.push(i);
        }
    }
    var sum_deg, sum_min;
    /*jshint loopfunc:true*/
    for(i = 0, l = sigk.length; i < l; i++) {
        sum_deg = goog.math.sum.apply(null, deg_seq.slice(0, sigk[i]));
        sum_min = sigk[i] * (sigk[i] - 1) + 
                    goog.math.sum.apply(null, goog.iter.toArray(goog.iter.map(jsnx.helper.range(sigk[i], n), function(v) {
            return Math['min'](sigk[i], deg_seq[v]);
        })));

        if(sum_deg > sum_min) {
            return false;
        }
    }
    return true;
};
goog.exportSymbol('jsnx.is_valid_degree_sequence_erdos_gallai', jsnx.algorithms.graphical.is_valid_degree_sequence_erdos_gallai);
