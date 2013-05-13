"use strict";
goog.provide('jsnx.contrib.convert');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('jsnx.contrib.Map');
goog.require('jsnx.helper');

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
jsnx.contrib.convert.to_map_of_lists = function(G, opt_nodelist) {
  var map = new jsnx.contrib.Map();

  if (goog.isDefAndNotNull(opt_nodelist)) {
    opt_nodelist = jsnx.helper.toArray(opt_nodelist);
    var contains = function(n) {
      return goog.array.contains(goog.asserts.assertArray(opt_nodelist), n);
    };

    goog.array.forEach(opt_nodelist, function(n) {
      map.set(n, goog.array.filter(G.neighbors(n), contains));
    });
  }
  else {
    jsnx.helper.forEach(G, function(n) {
      map.set(n, G.neighbors(n));
    });
  }

  return map;
};
goog.exportSymbol('jsnx.to_map_of_lists', jsnx.contrib.convert.to_map_of_lists);


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
jsnx.contrib.convert.from_map_of_lists = function(map, opt_create_using) {
  var G = jsnx.convert.prep_create_using_(opt_create_using);
  G.add_nodes_from(map.keys());

  if(G.is_multigraph() && !G.is_directed()) {
    // a map_of_lists can't show multiedges.  BUT for undirected graphs,
    // each edge shows up twice in the map_of_lists.
    // So we need to treat this case separately.
    var seen = new jsnx.contrib.Map();

    map.forEach(function(node, nbrlist) {
      goog.array.forEach(/**@type {?}*/(nbrlist), function(nbr) {
        if (!seen.has(nbr)) {
          G.add_edge(node, nbr);
        }
      });
      seen.set(node, 1); // don't allow reverse edge to show up
    });

  }
  else {
    var edge_list = [];
    map.forEach(function(node, nbrlist) {
      goog.array.forEach(/**@type {?} */(nbrlist), function(nbr) {
        G.add_edge(node, nbr);
      });
    });
  }

  return G;
};


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
 jsnx.contrib.convert.to_map_of_maps = function(G, opt_nodelist, opt_edge_data) {
   var map_of_maps = new jsnx.contrib.Map();

   if (goog.isDefAndNotNull(opt_nodelist)) {
     opt_nodelist = jsnx.helper.toArray(opt_nodelist);
     if(goog.isDefAndNotNull(opt_edge_data)) {
       goog.array.forEach(opt_nodelist, function(u) {
         var map_of_u = map_of_maps.set(u, new jsnx.contrib.Map());
         G.get(u).forEach(function(v, data) {
           goog.asserts.assertArray(opt_nodelist);
           if(goog.array.contains(opt_nodelist, v)) {
             map_of_u.set(v, opt_edge_data);
           }
         });
       });
     }
     else { // nodelist and edge_data are defined
       goog.array.forEach(opt_nodelist, function(u) {
         var map_of_u = map_of_maps.set(u, new jsnx.contrib.Map());
         G.get(u).forEach(function(v, data) {
           goog.asserts.assertArray(opt_nodelist);
           if(goog.array.contains(opt_nodelist, v)) {
             map_of_u.set(v, data);
           }
         });
       });
     }
   }
   else { // nodelist is undefined
     if(goog.isDefAndNotNull(opt_edge_data)) {
       goog.iter.forEach(G.adjacency_iter(), function(nbrmap, u) {
         var map_of_u = map_of_maps.set(u, new jsnx.contrib.Map());
         nbrmap.forEach(function(v, data) {
           map_of_u.set(v, opt_edge_data);
         });
       });
     }
     else { // edge_data is defined
       goog.iter.forEach(G.adjacency_iter(), function(nbrmap, u) {
         var map_of_u = map_of_maps.set(u, new jsnx.contrib.Map());
         nbrmap.forEach(function(v, data) {
           map_of_u.set(v, data);
         });
       });
     }
   }

   return map_of_maps;
 };


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
jsnx.contrib.convert.from_map_of_maps = function(map, opt_create_using, opt_multigraph_input) {
  var G = jsnx.convert.prep_create_using_(opt_create_using);
  var seen = new jsnx.contrib.Map(); // don't add both directions of undirected graph
  // an array to be reused as testing tuple to avoid memory
  var t = [];
  G.add_nodes_from(map.keys());

  // is map a MultiGraph or MultiDiGraph?
  if (opt_multigraph_input) {
    // make a copy  of the list of edge data (but not the edge data)
    if (G.is_directed()) {
      if (G.is_multigraph()) {
        map.forEach(function(u, nbrs) {
          if(goog.isArrayLike(nbrs)) { // throw expection of not map (object)
            throw new Error('Value is not a map.');
          }
          nbrs.forEach(function(v, datadict) {
            goog.object.forEach(datadict, function(data, key) {
              goog.asserts.assertInstanceof(G, jsnx.classes.MultiDiGraph);
              G.add_edge(
                /**@type jsnx.Node**/(u),
                /**@type jsnx.Node**/(v),
                /**@type string**/(key),
                /**@type Object*/(data)
              );
            });
          });
        });
      }
      else {
        map.forEach(function(u, nbrs) {
          if(goog.isArrayLike(nbrs)) { // throw expection of not map (object)
            throw new Error();
          }
          nbrs.forEach(function(v, datadict) {
            goog.object.forEach(datadict, function(data, key) {
              G.add_edge(
                /**@type jsnx.Node**/(u),
                /**@type jsnx.Node**/(v),
                /**@type Object*/(data)
              );
            });
          });
        });
      }
    }
    else { // undirected
      if(G.is_multigraph()) {
        map.forEach(function(u, nbrs) {
          if (goog.isArrayLike(nbrs)) { // throw expection of not map (object)
            throw new Error();
          }
          nbrs.forEach(function(v, datadict) {
            t[0] = u, t[1] = v;
            if (!seen.has(t)) {
              goog.object.forEach(datadict, function(data, key) {
                goog.asserts.assertInstanceof(G, jsnx.classes.MultiGraph);
                G.add_edge(
                  /**@type jsnx.Node**/(u),
                  /**@type jsnx.Node**/(v),
                  /**@type string**/(key),
                  /**@type Object*/(data)
                );
              });
              t[0] = v, t[1] = u;
              seen.set(t, 1);
            }
          });
        });
      }
      else {
        map.forEach(function(u, nbrs) {
          if(goog.isArrayLike(nbrs)) { // throw expection of not map (object)
            throw new Error();
          }
          nbrs.forEach(function(v, datadict) {
            t[0] = u, t[1] = v;
            if(!seen.has(t)) {
              goog.object.forEach(datadict, function(data, key) {
                G.add_edge(
                  /**@type jsnx.Node**/(u),
                  /**@type jsnx.Node**/(v),
                  /**@type {Object}*/(data)
                );
              });
              t[0] = v, t[1] = u;
              seen.set(t, 1);
            }
          });
        });
      }
    }
  }
  else { // not a multigraph to multigraph transfer
    if(G.is_multigraph() && !G.is_directed()) {
      // map can have both representations u-v, v-u in dict.  Only add one.
      // We don't need this check for digraphs since we add both directions,
      // or for Graph() since it is done implicitly (parallel edges not allowed)
      map.forEach(function(u, nbrs) {
        if(goog.isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new Error();
        }
        nbrs.forEach(function(v, data) {
          t[0] = u, t[1] = v;
          if(!seen.has(t)) {
            G.add_edge(
              /**@type jsnx.Node**/(u),
              /**@type jsnx.Node**/(v),
              /**@type {Object}*/(data)
            );
            t[0] = v, t[1] = u;
            seen.set(t, 1);
          }
        });
      });
    }
    else {
      map.forEach(function(u, nbrs) {
        if(goog.isArrayLike(nbrs)) { // throw exception of not dict (object)
          throw new Error();
        }
        nbrs.forEach(function(v, data) {
          G.add_edge(
            /**@type jsnx.Node**/(u),
            /**@type jsnx.Node**/(v),
            /**@type {Object}*/(data)
          );
        });
      });
    }
  }

  return G;
};
