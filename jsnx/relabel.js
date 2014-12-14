'use strict';

var DiGraph = require('./classes/digraph');
/*jshint ignore:start*/
var Map = require('./_internals/Map');
var Set = require('./_internals/Set');
/*jshint ignore:end*/
var {JSNetworkXError, JSNetworkXUnfeasible} = require('./exceptions');

var {
  clone,
  forEach,
  isMap,
  mapIterator,
  someIterator,
  sprintf,
  topologicalSort,
  tuple2,
  tuple3c,
  tuple4c
} = require('./_internals');

/**
 * Relabel the nodes of the graph G.
 *
 * Notes
 * -----
 * Only the nodes specified in the mapping will be relabeled.
 *
 * The setting copy=false modifies the graph in place.
 * This is not always possible if the mapping is circular.
 * In that case use copy=true.
 *
 * @see #convert_node_labels_to_integers
 *
 * @param {Graph} G A JSNetworkX graph
 * @param {(Object|Map|function(Node):Node)} mapping
 *      A dictionary with the old labels as keys and new labels as values.
 *      A partial mapping is allowed.
 * @param {boolean=} opt_copy (default: true)
 *      If True return a copy or if False relabel the nodes in place.
 *
 * @return {Graph}
 * @export
 */
function relabelNodes(G, mapping, optCopy=true) {
  // you can pass a function f(old_label)->new_label
  // but we'll just make a dictionary here regardless
  var m = mapping;
  if (typeof mapping !== 'function') {
    if (!isMap(m)) {
      m = new Map(m);
    }
  }
  else {
    m = new Map(mapIterator(G.nodesIter(), n => tuple2(n, mapping(n))));
  }

  return optCopy ? relabelCopy(G, m) : relabelInplace(G, m);
}


/**
 * @param {Graph} G A JSNetworkX graph
 * @param {Map} mapping
 *      A dictionary with the old labels as keys and new labels as values.
 *      A partial mapping is allowed.
 *
 * @return .Graph}
 * @private
 */
function relabelInplace(G, mapping) {
  var oldLabels = new Set(mapping.keys());
  var nodes;

  if (someIterator(mapping.values(), v => oldLabels.has(v))) {
    // labels sets overlap
    // can we topological sort and still do the relabeling?
    var D = new DiGraph(mapping);
    D.removeEdgesFrom(D.selfloopEdges());
    try {
      nodes = topologicalSort(D);
    }
    catch(e) {
      if (e instanceof JSNetworkXUnfeasible) {
        throw new JSNetworkXUnfeasible(
          'The node label sets are overlapping and' +
          ' no ordering can resolve the mapping.' +
          ' Use copy=True.'
        );
      }
    }
    nodes.reverse(); // reverse topological order
  }
  else {
    // non-overlapping label sets
    nodes = oldLabels.values();
  }
  var multigraph = G.isMultigraph();
  var directed = G.isDirected();
  var newEdges;

  forEach(nodes, function(old) {
    var new_;
    if (mapping.has(old)) {
      new_ = mapping.get(old);
    }
    else {
      return; // continue
    }

    if (!G.hasNode(old)) {
      throw new JSNetworkXError(sprintf('Node %j is not in the graph.', old));
    }
    G.addNode(new_, G.node.get(old));
    if (multigraph) {
      newEdges = G.edges(old, true, true).map(
          d => tuple4c(new_, d[1], d[2], d[3], d)
      );

      if (directed) {
        newEdges = newEdges.concat(
          G.inEdges(old, true, true).map(
            d => tuple4c(d[0], new_, d[2], d[3], d)
          )
        );
      }
    }
    else {
      newEdges = G.edges(old, true).map(d => tuple3c(new_, d[1], d[2], d));

      if (directed) {
        newEdges = newEdges.concat(
          G.inEdges(old, true).map(d => tuple3c(d[0], new_, d[2], d))
        );
      }
    }
    G.removeNode(old);
    G.addEdgesFrom(newEdges);
  });
  return G;
}

/**
 * @param {Graph} G A JSNetworkX graph
 * @param {Map} mapping
 *      A dictionary with the old labels as keys and new labels as values.
 *      A partial mapping is allowed.
 *
 * @return {Graph}
 * @private
 */
function relabelCopy(G, mapping) {
  var H = new G.constructor();
  H.name = '(' + G.name + ')';
  if (G.isMultigraph()) {
    H.addEdgesFrom(mapIterator(
      G.edgesIter(null, true, true),
      d => tuple4c(
        mapping.has(d[0]) ? mapping.get(d[0]) : d[0],
        mapping.has(d[1]) ? mapping.get(d[1]) : d[1],
        d[2],
        clone(d[3]),
        d
      )
    ));
  }
  else {
    H.addEdgesFrom(mapIterator(
      G.edgesIter(null, true),
      d => tuple3c(
        mapping.has(d[0]) ? mapping.get(d[0]) : d[0],
        mapping.has(d[1]) ? mapping.get(d[1]) : d[1],
        clone(d[3]),
        d
      )
    ));
  }
  G.node.forEach((data, n) =>
    H.addNode(mapping.has(n) ? mapping.get(n) : n, clone(data))
  );
  Object.assign(H.graph, clone(G.graph));

  return H;
}

/**
 * Return a copy of G node labels replaced with integers.
 *
 * @param {Graph} G A JSNetworkX graph
 * @param {?number=} opt_first_label (default=0)
 *      An integer specifying the offset in numbering nodes.
 *      The n new integer labels are numbered first_label, ..., n-1+first_label.
 * @param {?string=} opt_ordering (default="default")
 *      "default" : inherit node ordering from G.nodes()
 *      "sorted"  : inherit node ordering from sorted(G.nodes())
 *      "increasing degree" : nodes are sorted by increasing degree
 *      "decreasing degree" : nodes are sorted by decreasing degree
 * @param {?boolean=} opt_discard_old_labels (default=true)
 *      If true discard old labels. If false, create a node attribute
 *      'old_label' to hold the old labels.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
function convertNodeLabelsToIntegers(
  G,
  optFirstLabel=0,
  optOrdering='default',
  optDiscardOldLabels=true
) {
  //   This function strips information attached to the nodes and/or
  //   edges of a graph, and returns a graph with appropriate integer
  //   labels. One can view this as a re-labeling of the nodes. Be
  //   warned that the term "labeled graph" has a loaded meaning
  //   in graph theory. The fundamental issue is whether the names
  //   (labels) of the nodes (and edges) matter in deciding when two
  //   graphs are the same. For example, in problems of graph enumeration
  //   there is a distinct difference in techniques required when
  //   counting labeled vs. unlabeled graphs.
  //
  //   When implementing graph
  //   algorithms it is often convenient to strip off the original node
  //   and edge information and appropriately relabel the n nodes with
  //   the integer values 1,..,n. This is the purpose of this function,
  //   and it provides the option (see discard_old_labels variable) to either
  //   preserve the original labels in separate dicts (these are not
  //   returned but made an attribute of the new graph.

  if (typeof optOrdering === 'boolean') {
    optDiscardOldLabels = optOrdering;
    optOrdering = 'default';
  }

  switch (typeof optFirstLabel) {
    case 'string':
      optOrdering = optFirstLabel;
      optFirstLabel = 0;
      break;
    case 'boolean':
      optDiscardOldLabels = optFirstLabel;
      optFirstLabel = 0;
      break;
  }

  var mapping = new Map();
  var nodes;
  var dvPairs;
  var i;
  var j;
  var l;

  switch (optOrdering) {
    case 'default':
      nodes = G.nodes();
      for(i = 0, j = optFirstLabel, l = nodes.length; i < l; i++, j++) {
        mapping.set(nodes[i], j);
      }
      break;
    case 'sorted':
      nodes = G.nodes();
      nodes.sort();
      for(i = 0, j = optFirstLabel, l = nodes.length; i < l; i++, j++) {
        mapping.set(nodes[i], j);
      }
      break;
    case 'increasing degree':
      dvPairs = Array.from(G.degreeIter());
      dvPairs.sort((a, b) => a[1] - b[1]);
      for(i = 0, j = optFirstLabel, l = dvPairs.length; i < l; i++, j++) {
        mapping.set(dvPairs[i][0], j);
      }
      break;
    case 'decreasing degree':
      dvPairs = Array.from(G.degreeIter());
      dvPairs.sort((a, b) => b[1] - a[1]);
      for(i = 0, j = optFirstLabel, l = dvPairs.length; i < l; i++, j++) {
        mapping.set(dvPairs[i][0], j);
      }
      break;
    default:
      throw new JSNetworkXError(
        sprintf('Unkown node ordering: "%s"', optOrdering)
      );
  }

  var H = relabelNodes(G, mapping);
  H.name = '(' + G.name + ')_with_int_labels';
  if (!optDiscardOldLabels) {
    H.nodeLabels = mapping;
  }
  return H;
}

module.exports = {
  relabelNodes,
  convertNodeLabelsToIntegers,
};
