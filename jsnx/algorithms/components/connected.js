"use strict";
/*jshint loopfunc:true*/

goog.provide('jsnx.algorithms.components');

goog.require('jsnx.algorithms.shortest_paths');
goog.require('jsnx.exception');
goog.require('jsnx.helper');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.asserts');

/*jshint expr:true*/

jsnx.algorithms.components.connected_components = function(G) {
    if (G.is_directed()){
        throw new jsnx.exception.JSNetworkXException('Not allowed for directed graph G. Use UG=G.to_undirected() to create an undirected graph.');
    }
    var seen = {};
    var components = [];
    jsnx.helper.forEach(G, function(v) {
        if (!goog.object.containsKey(seen, v)){
            var c = jsnx.algorithms.shortest_paths.unweighted.single_source_shortest_path_length(G,v)
            components.push(goog.object.getKeys(c));
            for (var key in c){
                seen[key] = c[key];
            }
        }
    });
    return components;
}

goog.exportSymbol('jsnx.connected_components', jsnx.algorithms.components.connected_components);