"use strict";
goog.provide('jsnx.generators.degree_seq');

goog.require('goog.array');
goog.require('goog.iter');
goog.require('jsnx.generators.classic');
goog.require('jsnx.exception');

//TODO: configuration_model
//TODO: directed_configuration_model
//TODO: expected_degree_graph


/**
 * Return a simple graph with given degree sequence constructed 
 * using the Havel-Hakimi algorithm.
 *
 * Notes
 * -----
 * The Havel-Hakimi algorithm constructs a simple graph by
 * successively connecting the node of highest degree to other nodes
 * of highest degree, resorting remaining nodes by degree, and
 * repeating the process. The resulting graph has a high
 * degree-associativity.  Nodes are labeled 1,.., len(deg_sequence),
 * corresponding to their position in deg_sequence.
 *
 * @param {Array} deg_sequence list of integers
 *      Each integer corresponds to the degree of a node (need not be sorted).
 * @param {jsnx.classes.Graph} opt_create_using 
 *      Return graph of this type. The instance will be cleared.
 *      Multigraphs and directed graphs are not allowed.
 * @export
 */
jsnx.generators.degree_seq.havel_hakimi_graph = function(deg_sequence, opt_create_using) {
  if(!jsnx.algorithms.graphical.is_valid_degree_sequence(deg_sequence)) {
    throw new jsnx.exception.JSNetworkXError('Invalid degree sequence');
  }
  if(goog.isDefAndNotNull(opt_create_using)) {
    if(opt_create_using.is_directed()) {
      throw new jsnx.exception.JSNetworkXError('Directed Graph not supported');
    }
    if(opt_create_using.is_multigraph()) {
      throw new jsnx.exception.JSNetworkXError('Havel-Hakimi requires simple graph');
    }
  }
  var N = deg_sequence.length;
  var G = jsnx.generators.classic.empty_graph(N, opt_create_using);
  if(N === 0 || Math.max.apply(null, deg_sequence) === 0) { // done if no edges
    return G;
  }

  // form list of [stubs,name] for each node.
  var stublist = goog.iter.toArray(
    /** @type {goog.iter.Iterator} */ (jsnx.helper.map(G, function(n) {
    return [deg_sequence[n], n];
  }))
  );
  // now connect the stubs
  while(stublist.length > 0) {
    /*jshint loopfunc:true */
    stublist.sort(function(a, b) {
      // a and b are both arrays, sort by first element first
      if(a[0] !== b[0]) {
        return a[0] - b[0];
      }
      return +a[1] - +b[1];
    });
    if(stublist[0][0] < 0) { // took too many off some vertex
      return false;  // should not happen if deg_seq is valid
    }

    var d = stublist.pop(); // the node with the most stubs
    if(d[0] === 0) { //  the rest must also be 0 --Done!
      break;
    }
    if(d[0] > stublist.length) { // Trouble--can't make that many edges
      return false;  // should not happen if deg_seq is valid
    }

    // attach edges to biggest nodes
    for(var l = stublist.length, i = l - d[0]; i < l; i++) {
      G.add_edge(d[1], stublist[i][1]);
      stublist[i][0] -= 1;
    }
  }
  G.name('havel_hakimi_graph ' + G.order() + ' nodes ' + G.size() + ' edges');
  return G;
};
goog.exportSymbol('jsnx.havel_hakimi_graph', jsnx.generators.degree_seq.havel_hakimi_graph);

//TODO: degree_sequence_tree
//TODO: random_degree_sequence_graph
//TODO: DegreeSequenceRandomGraph
