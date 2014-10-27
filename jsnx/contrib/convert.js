"use strict";

var Map = require('../_internals/Map');
var Set = require('../_internals/Set');

var isMap = require('../_internals/isMap');
var isArrayLike = require('../_internals/isArrayLike');
var prep_create_using = require('./prep_create_using');
var toArray = require('../_internals/toArray');
var tuple2 = require('../_internals/tuple').tuple2;

/**
 * This module provides functions to convert JSNetworkX graphs to and from
 * non-NetworkX formats.
 */


 /**
  * Return adjacency representation of graph as a map of lists.
  *
  * Completely ignores edge data for MultiGraph and MultiDiGraph.
  *
  * @param {jsnx.classes.Graph} G A graph
  * @param {jsnx.NodeContainer=} opt_nodelist Use only nods specified in nodelist.
  *
  * @return {!jsnx.contrib.Map}
  * @export
  */
function to_map_of_lists(G, opt_nodelist) {
  var map = new Map();

  if (opt_nodelist != null) {
    opt_nodelist = toArray(opt_nodelist);
    opt_nodelist.forEach(
      n => map.set(n, G.neighbors(n).filter(v => opt_nodelist.index() > -1))
    );
  }
  else {
    for (var n of G) {
      map.set(n, G.neighbors(n));
    }
  }

  return map;
}

/**
 * Return a graph from a map of lists.
 * *
 * @param {!jsnx.contrib.Map} map A map of lists adjacency representation.
 * @param {jsnx.classes.Graph=} opt_create_using Use specified graph for result.
 *    Otherwise a new graph is created.
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
function from_map_of_lists(map, opt_create_using) {
  var G = prep_create_using(opt_create_using);
  G.add_nodes_from(map.keys());

  if(G.is_multigraph() && !G.is_directed()) {
    // a map_of_lists can't show multiedges.  BUT for undirected graphs,
    // each edge shows up twice in the map_of_lists.
    // So we need to treat this case separately.
    var seen = new Set();

    map.forEach(function(nbrlist, node) {
      nbrlist.forEach(function(nbr) {
        if (!seen.has(nbr)) {
          G.add_edge(node, nbr);
        }
      });
      seen.add(node); // don't allow reverse edge to show up
    });
  }
  else {
    map.forEach(function(nbrlist, node) {
      nbrlist.forEach(nbr => G.add_edge(node, nbr));
    });
  }

  return G;
}

/**
 * Return adjacency representation of graph as a map of maps.
 *
 * @param {jsnx.classes.Graph} G A jsnx Graph
 * @param {jsnx.NodeContainer=} opt_nodelist Use only nodes specified in nodelist
 * @param {Object=} opt_edge_data If provided,  the value of the map will be
 *      set to edge_data for all edges.  This is useful to make
 *      an adjacency matrix type representation with 1 as the edge data.
 *      If opt_edge_data is null or undefined, the edge data in G is used to fill
 *      the values.
 *      If G is a multigraph, the edge data is a dict for each pair (u,v).
 *
 * @return {!jsnx.contrib.Map}
 * @export
 */
function to_map_of_maps(G, opt_nodelist, opt_edge_data) {
   var map_of_maps = new Map();

   if (opt_nodelist != null) {
     opt_nodelist = toArray(opt_nodelist);
     opt_nodelist.forEach(function(u) {
       var map_of_u = map_of_maps.set(u, new Map());
       G.get(u).forEach(function(v, data) {
         if (opt_nodelist.indexOf(v) > -1) {
           map_of_u.set(v, opt_edge_data == null ? data : opt_edge_data);
         }
       });
     });
   }
   else { // nodelist is undefined
     // mu = [nbrmap, u]
     for (var mu of G.adjacency_iter()) {
       /*jshint loopfunc:true*/
       var [nbrmap, u] = mu;
       var map_of_u = map_of_maps.set(mu[1], new Map());
       mu[0].forEach(function(data, v) {
         map_of_u.set(v, opt_edge_data == null ? data : opt_edge_data);
       });
     }
   }

   return map_of_maps;
}

/**
 * Return a graph from a map of maps.
 *
 * @param {!jsnx.contrib.Map} map A map of maps adjacency representation.
 * @param {jsnx.classes.Graph=} opt_create_using Use specified graph for result.
 *      Otherwise a new graph is created.
 * @param {boolean=} opt_multigraph_input (default=False)
 *      When True, the values of the inner dict are assumed
 *      to be containers of edge data for multiple edges.
 *      Otherwise this routine assumes the edge data are singletons.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
function from_map_of_maps(map, opt_create_using, opt_multigraph_input) {
  var G = prep_create_using(opt_create_using);
  var seen = new Set(); // don't add both directions of undirected graph
  G.add_nodes_from(map.keys());

  // is map a MultiGraph or MultiDiGraph?
  if (opt_multigraph_input) {
    // make a copy  of the list of edge data (but not the edge data)
    if (G.is_directed()) {
      map.forEach(function(nbrs, u) {
        if(isArrayLike(nbrs)) { // throw expection of not map (object)
          throw new TypeError('Value is not a map.');
        }
        nbrs.forEach(function(datadict, v) {
          for (var key in datadict) {
            var data = datadict[key];
            if (G.is_multigraph()) {
              G.add_edge(u, v, key, data);
            }
            else {
              G.add_edge(u, v, data);
            }
          }
        });
      });
    }
    else { // undirected
      var isMultigraph = G.is_multigraph();
      map.forEach(function(nbrs, u) {
        if (isArrayLike(nbrs)) { // throw exception of not map
          throw new TypeError('Not a map');
        }
        nbrs.forEach(function(datadict, v) {
          // this works because sets convert the value to their string
          // representation
          if (!seen.has(tuple2(u, v))) {
            for (var key in datadict) {
              var data = datadict[key];
              if (isMultigraph) {
                G.add_edge(u, v, key, data);
              }
              else {
                G.add_edge(u, v, data);
              }
            }
            seen.add(tuple2(v, u));
          }
        });
      });
    }
  }
  else { // not a multigraph to multigraph transfer
    if(G.is_multigraph() && !G.is_directed()) {
      // map can have both representations u-v, v-u in dict.  Only add one.
      // We don't need this check for digraphs since we add both directions,
      // or for Graph() since it is done implicitly (parallel edges not allowed)
      map.forEach(function(nbrs, u) {
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Value is not a map');
        }
        nbrs.forEach(function(data, v) {
          if(!seen.has(tuple2(u, v))) {
            G.add_edge(u, v, data);
            seen.add(tuple2(v, u));
          }
        });
      });
    }
    else {
      map.forEach(function(nbrs, u) {
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Value is not a map');
        }
        nbrs.forEach(function(data, v) {
          G.add_edge(u, v, data);
        });
      });
    }
  }

  return G;
}

module.exports = {
  to_map_of_lists,
  from_map_of_lists,
  to_map_of_maps,
  from_map_of_maps
};
