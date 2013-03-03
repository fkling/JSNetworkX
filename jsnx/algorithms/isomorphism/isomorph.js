"use strict";

goog.provide('jsnx.algorithms.isomorphism');


goog.require('goog.array');
goog.require('jsnx.algorithms.cluster');
goog.require('jsnx.algorithms.clique');
goog.require('jsnx.helper');

/**
 * Returns False if graphs are definitely not isomorphic.
 * True does NOT guarantee isomorphism.
 *
 * Note:
 * Checks for matching degree, triangle, and number of cliques sequences.
 *
 * @param {!jsnx.classes.Graph} G1
 * @param {!jsnx.classes.Graph} G2
 *
 * @return {boolean}  False if graphs are definitely not isomorphic.
 *
 * @export
 */
jsnx.algorithms.isomorphism.could_be_isomorphic = function(G1, G2) {
    // Check global properties
    if (G1.order() != G2.order()) {
        return false;
    }

    // Check local properties
    /** @type string */
    var v;
    var d1 = G1.degree(),
        t1 = jsnx.algorithms.cluster.triangles(G1),
        c1 = jsnx.algorithms.clique.number_of_cliques(G1),
        props1 = [];
    for(v in d1) {
        props1.push([d1[v], t1[v], c1[v]]);
    }
    props1.sort(function(a, b) {
        if(a[0] !== b[0]) {
            return a[0] - b[0];
        }
        else if(a[1] !== b[1]) {
            return a[1] - b[1];
        }
        return a[2] - b[2];
    });

    var d2 = G2.degree(),
        t2 = jsnx.algorithms.cluster.triangles(G2),
        c2 = jsnx.algorithms.clique.number_of_cliques(G2),
        props2 = [];
    for(v in d2) {
        props2.push([d2[v], t2[v], c2[v]]);
    }
    props2.sort(function(a, b) {
        if(a[0] !== b[0]) {
            return a[0] - b[0];
        }
        else if(a[1] !== b[1]) {
            return a[1] - b[1];
        }
        return a[2] - b[2];
    });


    if(!goog.array.equals(props1, props2, function(p1, p2) {
        return goog.array.equals(p1, p2);
    })) {
        return false;
    }

    // OK...
    return true;
};
goog.exportSymbol('jsnx.could_be_isomorphic', jsnx.algorithms.isomorphism.could_be_isomorphic);


/**
 * Returns False if graphs are definitely not isomorphic.
 * True does NOT guarantee isomorphism.
 *
 * Note:
 * Checks for matching degree and triangle sequences.
 *
 * @param {!jsnx.classes.Graph} G1
 * @param {!jsnx.classes.Graph} G2
 *
 * @return {boolean}  False if graphs are definitely not isomorphic.
 *
 * @export
 */
jsnx.algorithms.isomorphism.fast_could_be_isomorphic = function(G1, G2) {
    // Check global properties
    if (G1.order() != G2.order()) {
        return false;
    }

    // Check local properties
    /** @type string */
    var v;
    var d1 = G1.degree(),
        t1 = jsnx.algorithms.cluster.triangles(G1),
        props1 = [];
    for(v in d1) {
        props1.push([d1[v], t1[v]]);
    }
    props1.sort(function(a, b) {
        if(a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return a[1] - b[1];
    });

    var d2 = G2.degree(),
        t2 = jsnx.algorithms.cluster.triangles(G2),
        props2 = [];
    for(v in d2) {
        props2.push([d2[v], t2[v]]);
    }
    props2.sort(function(a, b) {
        if(a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return a[1] - b[1];
    });


    if(!goog.array.equals(props1, props2, function(p1, p2) {
        return goog.array.equals(p1, p2);
    })) {
        return false;
    }

    // OK...
    return true;
};
goog.exportSymbol('jsnx.fast_could_be_isomorphic', jsnx.algorithms.isomorphism.fast_could_be_isomorphic);


/**
 * Returns False if graphs are definitely not isomorphic.
 * True does NOT guarantee isomorphism.
 *
 * Note:
 * Checks for matching degree sequences.
 *
 * @param {!jsnx.classes.Graph} G1
 * @param {!jsnx.classes.Graph} G2
 *
 * @return {boolean}  False if graphs are definitely not isomorphic.
 *
 * @export
 */
jsnx.algorithms.isomorphism.faster_could_be_isomorphic = function(G1, G2) {
    // Check global properties
    if (G1.order() != G2.order()) {
        return false;
    }

    // Check local properties
    var d1 = goog.object.getValues(/** @type {Object} */ (G1.degree()));
    d1.sort();

    var d2 = goog.object.getValues(/** @type {Object} */ (G2.degree()));
    d2.sort();

    if(!goog.array.equals(d1, d2)) {
        return false;
    }

    // OK...
    return true;
};
goog.exportSymbol('jsnx.faster_could_be_isomorphic', jsnx.algorithms.isomorphism.faster_could_be_isomorphic);

//TODO: is_isomorphic
