"use strict";
/*jshint loopfunc:true*/

goog.provide('jsnx.algorithms.distance_measures');
goog.require('jsnx.helper');
goog.require('jsnx.algorithms.shortest_paths.unweighted');

/*jshint expr:true*/


jsnx.algorithms.distance_measures.eccentricity = function(
  G,
  v,
  sp)
{
    var node, nodes, length, L;
    var e = {};
    var order = G.order();

    if (v === undefined){
        nodes = G.nodes();
    } else {
        nodes = jsnx.helper.toArray(G.nbunch_iter(v.id));
    }

    for (var i = 0; i < nodes.length; i++) {
        node = nodes[i];
        // if no shortest path dict is given, run shortest path.
        if (sp === undefined){
            length = jsnx.algorithms.shortest_paths.unweighted.single_source_shortest_path_length(G, G.nodes()[i]).D;
            L = jsnx.helper.toArray(length).length;
        } else {
            length = sp[v];
            L = jsnx.helper.toArray(length).length;
        }
        if (L != order){
            throw "Graph not connected, infinite path length";
        }
        // Take the maximum of the length values.
        e[node] = Math.max.apply(Math, length); //max_of_values(length);
    }
    if (v in G.nodes()){
        return e[v];
    } else {
        return e;
    }
}

goog.exportSymbol('jsnx.eccentricity', jsnx.algorithms.distance_measures.eccentricity );
