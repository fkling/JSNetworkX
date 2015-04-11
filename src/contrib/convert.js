'use strict';

import prepCreateUsing from './prepCreateUsing';

import {
  /*jshint ignore:start*/
  Map,
  Set,
  /*jshint ignore:end*/

  isArrayLike,
  tuple2
} from '../_internals';

/**
 * This module provides functions to convert JSNetworkX graphs to and from
 * non-NetworkX formats.
 */

 /**
  * Return adjacency representation of graph as a map of lists.
  *
  * Completely ignores edge data for `MultiGraph` and `MultiDiGraph`.
  *
  * @param {Graph} G A graph
  * @param {Iterable=} optNodelist Use only nods specified in this list.
  *
  * @return {!Map}
  */
export function toMapOfLists(G, optNodelist) {
  var map = new Map();

  if (optNodelist != null) {
    Array.from(optNodelist).forEach(
      n => map.set(n, G.neighbors(n).filter(v => optNodelist.indexOf(v) > -1))
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
 * @param {!Map} map A map of lists adjacency representation.
 * @param {Graph=} optCreateUsing Use specified graph for result.
 *    Otherwise a new graph is created.
 *
 * @return {!Graph}
 */
export function fromMapOfLists(map, optCreateUsing) {
  var G = prepCreateUsing(optCreateUsing);
  G.addNodesFrom(map.keys());

  if(G.isMultigraph() && !G.isDirected()) {
    // a map_of_lists can't show multiedges.  BUT for undirected graphs,
    // each edge shows up twice in the map_of_lists.
    // So we need to treat this case separately.
    var seen = new Set();

    map.forEach(function(nbrlist, node) {
      nbrlist.forEach(function(nbr) {
        if (!seen.has(nbr)) {
          G.addEdge(node, nbr);
        }
      });
      seen.add(node); // don't allow reverse edge to show up
    });
  }
  else {
    map.forEach(function(nbrlist, node) {
      nbrlist.forEach(nbr => G.addEdge(node, nbr));
    });
  }

  return G;
}

/**
 * Return adjacency representation of graph as a map of maps.
 *
 * @param {Graph} G A jsnx Graph
 * @param {Iterable=} optNodelist Use only nodes specified in nodelist
 * @param {Object=} optEdgeData If provided,  the value of the map will be
 *      set to edgeData for all edges.  This is useful to make
 *      an adjacency matrix type representation with 1 as the edge data.
 *      If optEdgeData is null or undefined, the edge data in G is used to
 *      fill the values.
 *      If G is a multigraph, the edge data is a dict for each pair (u,v).
 *
 * @return {!Map}
 */
export function toMapOfMaps(G, optNodelist, optEdgeData) {
   var mapOfMaps = new Map();

   if (optNodelist != null) {
     optNodelist = Array.from(optNodelist);
     optNodelist.forEach(function(u) {
       let mapOfU = mapOfMaps.set(u, new Map());
       G.get(u).forEach(function(v, data) {
         if (optNodelist.indexOf(v) > -1) {
           mapOfU.set(v, optEdgeData == null ? data : optEdgeData);
         }
       });
     });
   }
   else { // nodelist is undefined
     for (let [nbrmap, u] of G.adjacencyIter()) {
       /*eslint no-loop-func:0*/
       let mapOfU = mapOfMaps.set(u, new Map());
       nbrmap.forEach(function(data, v) {
         mapOfU.set(v, optEdgeData == null ? data : optEdgeData);
       });
     }
   }

   return mapOfMaps;
}

/**
 * Return a graph from a map of maps.
 *
 * @param {!Map} map A map of maps adjacency representation.
 * @param {Graph=} optCreateUsing Use specified graph for result.
 *      Otherwise a new graph is created.
 * @param {boolean=} optMultigraphInput (default=False)
 *      When True, the values of the inner dict are assumed
 *      to be containers of edge data for multiple edges.
 *      Otherwise this routine assumes the edge data are singletons.
 *
 * @return {Graph}
 */
export function fromMapOfMaps(map, optCreateUsing, optMultigraphInput) {
  var G = prepCreateUsing(optCreateUsing);
  var seen = new Set(); // don't add both directions of undirected graph
  G.addNodesFrom(map.keys());

  // is map a MultiGraph or MultiDiGraph?
  if (optMultigraphInput) {
    // make a copy  of the list of edge data (but not the edge data)
    if (G.isDirected()) {
      map.forEach(function(nbrs, u) {
        if(isArrayLike(nbrs)) { // throw expection of not map (object)
          throw new TypeError('Value is not a map.');
        }
        nbrs.forEach(function(datadict, v) {
          for (var key in datadict) {
            var data = datadict[key];
            if (G.isMultigraph()) {
              G.addEdge(u, v, key, data);
            }
            else {
              G.addEdge(u, v, data);
            }
          }
        });
      });
    }
    else { // undirected
      var isMultigraph = G.isMultigraph();
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
                G.addEdge(u, v, key, data);
              }
              else {
                G.addEdge(u, v, data);
              }
            }
            seen.add(tuple2(v, u));
          }
        });
      });
    }
  }
  else { // not a multigraph to multigraph transfer
    if(G.isMultigraph() && !G.isDirected()) {
      // map can have both representations u-v, v-u in dict.  Only add one.
      // We don't need this check for digraphs since we add both directions,
      // or for Graph() since it is done implicitly (parallel edges not allowed)
      map.forEach(function(nbrs, u) {
        if(isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new TypeError('Value is not a map');
        }
        nbrs.forEach(function(data, v) {
          if(!seen.has(tuple2(u, v))) {
            G.addEdge(u, v, data);
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
          G.addEdge(u, v, data);
        });
      });
    }
  }

  return G;
}
