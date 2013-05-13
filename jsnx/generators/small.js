"use strict";
goog.provide('jsnx.generators.small');

goog.require('jsnx.exception');
goog.require('jsnx.helper');
goog.require('jsnx.generators.classic');


/**
 * Return a small undirected graph described by graph_description.
 *
 * See jsnx.generators.small.make_small_graph.
 *
 * @param {Array} graph_description 
 *    Description of the graph to create in the form [ltype, name, n, xlist].
 * @param {jsnx.classes.Graph=} 
 *    opt_create_using Graph instance to empty and add nodes to.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.small.make_small_undirected_graph = function(
  graph_description,
  opt_create_using
) {
  if (goog.isDefAndNotNull(opt_create_using) && opt_create_using.is_directed()) {
    throw new jsnx.exception.JSNetworkXError('Directed Graph not supported');
  }
  return jsnx.generators.small.make_small_graph(
    graph_description,
    opt_create_using
  );
};


/**
 * Return the small graph described by graph_description.
 *
 * graph_description is a list of the form [ltype,name,n,xlist]
 *
 * Here ltype is one of "adjacencylist" or "edgelist",
 * name is the name of the graph and n the number of nodes.
 * This constructs a graph of n nodes with integer labels 0,..,n-1.
 *
 * If ltype="adjacencylist"  then xlist is an adjacency list
 * with exactly n entries, in with the j'th entry (which can be empty)
 * specifies the nodes connected to vertex j.
 * e.g. the "square" graph C_4 can be obtained by
 *
 *   G = jsnx.generators.small.make_small_graph(
 *       ["adjacencylist", "C_4", 4, [[2,4],[1,3],[2,4],[1,3]]]
 *   );
 *
 * or, since we do not need to add edges twice,
 *
 *   G = jsnx.generators.small.make_small_graph(
 *       ["adjacencylist", "C_4", 4, [[2,4],[3],[4],[]]]
 *   );
 *
 * If ltype="edgelist" then xlist is an edge list 
 * written as [[v1,w2],[v2,w2],...,[vk,wk]],
 * where vj and wj integers in the range 1,..,n
 * e.g. the "square" graph C_4 can be obtained by
 *
 *   G = jsnx.generators.small.make_small_graph(
 *       ["edgelist", "C_4", 4, [[1,2],[3,4],[2,3],[4,1]]]
 *   );
 *
 * Use the opt_create_using argument to choose the graph class/type. 
 *
 * @param {Array} graph_description 
 *    Description of the graph to create in the form [ltype, name, n, xlist].
 * @param {jsnx.classes.Graph=} opt_create_using 
 *    Graph instance to empty and add nodes to.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.small.make_small_graph = function(
  graph_description,
  opt_create_using
) {
  var ltype = graph_description[0];
  var name = graph_description[1];
  var n = graph_description[2];

  var G = jsnx.generators.classic.empty_graph(n, opt_create_using);
  var nodes = G.nodes();

  if (ltype == 'adjacencylist') {
    var adjlist = graph_description[3];
    if (adjlist.length != n) {
      throw new jsnx.exception.JSNetworkXError('invalid graph_description');
    }
    goog.array.forEach(nodes, function(v) {
      jsnx.helper.forEach(adjlist[v], function(u) { 
        G.add_edge(u - 1, v);
      });
    });
  }
  else if (ltype == 'edgelist') {
    var edgelist = graph_description[3];
    jsnx.helper.forEach(edgelist, function(e) {
      var v1 = e[0] - 1;
      var v2 = e[1] - 1;
      if (v1 < 0 || v1 > n - 1 || v2 < 0 || v2 > n - 1) {
        throw new jsnx.exception.JSNetworkXError('invalid graph_description');
      } else {
        G.add_edge(v1, v2);
      }
    });
  }
  G.name = name;
  return G;
};
goog.exportSymbol(
  'jsnx.make_small_graph',
  jsnx.generators.small.make_small_graph
);


// TODO: LCF_graph


/**
 * Return the Bull graph.
 *
 * @param {jsnx.classes.Graph=} opt_create_using 
 *    Graph instance to empty and add nodes to.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.small.bull_graph = function(opt_create_using) {
  var description = [
    "adjacencylist",
    "Bull Graph",
    5,
    [[2,3],[1,3,4],[1,2,5],[2],[3]]
  ];
  var G = jsnx.generators.small.make_small_undirected_graph(
    description,
    opt_create_using
  );
  return G;
};
goog.exportSymbol('jsnx.bull_graph', jsnx.generators.small.bull_graph);


// TODO: chvatal_graph
// TODO: cubical_graph
// TODO: desargues_graph
// TODO: diamond_graph
// TODO: dodecahedral_graph
// TODO: frucht_graph
// TODO: heawood_graph
// TODO: house_graph
// TODO: house_x_graph
// TODO: icosahedral_graph


/**
 * Return the Krackhardt Kite Social Network.
 *
 * A 10 actor social network introduced by David Krackhardt
 * to illustrate: degree, betweenness, centrality, closeness, etc. 
 * The traditional labeling is:
 * Andre=1, Beverley=2, Carol=3, Diane=4,
 * Ed=5, Fernando=6, Garth=7, Heather=8, Ike=9, Jane=10.
 *
 * @param {jsnx.classes.Graph=} opt_create_using Graph instance to empty and add nodes to.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.small.krackhardt_kite_graph = function(opt_create_using) {
  var description = [
    "adjacencylist",
    "Krackhardt Kite Social Network",
    10,
    [[2,3,4,6],[1,4,5,7],[1,4,6],[1,2,3,5,6,7],[2,4,7],[1,3,4,7,8],
     [2,4,5,6,8],[6,7,9],[8,10],[9]]
  ];
  var G = jsnx.generators.small.make_small_undirected_graph(
    description,
    opt_create_using
  );
  return G;
};
goog.exportSymbol(
  'jsnx.krackhardt_kite_graph',
  jsnx.generators.small.krackhardt_kite_graph
);


// TODO: moebius_kantor_graph
// TODO: octahedral_graph
// TODO: pappus_graph
// TODO: petersen_graph
// TODO: sedgewick_maze_graph
// TODO: tetrahedral_graph
// TODO: truncated_cube_graph
// TODO: truncated_tetrahedron_graph
// TODO: tutte_graph
