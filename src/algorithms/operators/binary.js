'use strict';

import JSNetworkXError from '../../exceptions/JSNetworkXError';
import {convertNodeLabelsToIntegers, relabelNodes} from '../../relabel';
import {createEmptyCopy} from '../../classes/functions';
import Set, {symmetricDifference as setSymmetricDifference}
from '../../_internals/Set';

import {
  someIterator
} from '../../_internals';

function assertSameNodes(G, H) {
  let Hnodes = new Set(H);
  let Gnodes = new Set(G);
  if (Hnodes.size !== Gnodes.size ||
      someIterator(Gnodes.values(), v => !Hnodes.has(v))) {
    throw new JSNetworkXError('Node sets of graphs are not equal.');
  }
}

/**
 * Return the union of graphs `G` and `H`.
 *
 * Graphs `G` and `H` must be disjoint, otherwise an exception is raised.
 *
 * ### Notes
 *
 * To force a disjoint union with node relabeling, use `disjointUnion(G, H)` or
 * `convertNodeLabelsToIntegers()`.
 *
 * Graph, edge and node attributes are propagated from `G` and `H` to the union
 * Graph. If a graph attribute is present in both `G` and `H`, the value from
 * `H` is used.
 *
 * @see #disjointUnion
 *
 * @param {Graph} G
 * @param {Graph} H
 * @param {{rename: ?Array}} optParameters
 *   - rename: Node names `G` and `H` can be changed by specifying the tuple
 *     `['G-', 'H-']` (for example). Node `'u'` in `G` is then renamed to
 *     `'G-u'` and `'v'` in `H` is renamed to `'H-v'`.
 * @return {Graph} A union graph with the same type as G
 */
export async function union(G, H, {rename=[null, null]}={}) {
  if (G.isMultigraph() !== H.isMultigraph()) {
    throw new JSNetworkXError('G and H must both be graphs or multigraphs');
  }

  // Union is same type as G
  let R = new G.constructor();
  R.name = `union(${G.name}, ${H.name})`;

  // rename graph to obtain disjoint node labels
  function addPrefix(graph, prefix) {
    if (!prefix) {
      return graph;
    }
    return relabelNodes(graph, n => prefix + n.toString());
  }
  G = addPrefix(G, rename[0]);
  H = addPrefix(H, rename[1]);

  if ((new Set(G)).intersection(new Set(H)).size > 0) {
    throw new JSNetworkXError(
      'The node sets of G and H are not disjoint. Use appropriate ' +
      '{rename: [Gprefix, Hprefix]} or use disjointUnion({G, H})'
    );
  }

  // add nodes
  R.addNodesFrom(G.nodesIter(true));
  R.addNodesFrom(H.nodesIter(true));
  // add edges
  R.addEdgesFrom(
    G.isMultigraph() ? G.edgesIter(true, true) : G.edgesIter(true)
  );
  R.addEdgesFrom(
    H.isMultigraph() ? H.edgesIter(true, true) : H.edgesIter(true)
  );
  // add graph attributes
  Object.assign(R.graph, G.graph, H.graph);

  return R;
}

/**
 * Return the disjoint union of graphs `G` and `H`.
 *
 * This algorithm forces distinct integer node labels.
 *
 * ### Notes
 *
 * A new graph is created, of the same class as `G`.  It is recommended that `G`
 * and `H` be either both directed or both undirected.
 *
 * The nodes of `G` are relabeled `0` to `numberOfNodes(G) - 1`, and the nodes
 * of `H` are relabeled `numberOfNodes(G)` to
 * `numberOfNodes(G) + numberOfNodes(H) - 1`.
 *
 * Graph, edge, and node attributes are propagated from `G` and `H` to the union
 * graph. If a graph attribute is present in both `G` and `H` the value from `H`
 * is used.
 *
 * @param {Graph} G
 * @param {Graph} H
 * @return {Graph} A union graph with the same type as G.
 */
export async function disjointUnion(G, H) {
  let R1 = convertNodeLabelsToIntegers(G);
  let R2 = convertNodeLabelsToIntegers(H, R1.order());
  let R = union(R1, R2);
  R.name = `disjointUnion(${G.name}, ${H.name})`;
  Object.assign(R.graph, G.graph, H.graph);
  return R;
}

/**
 * Return a new graph that contains only edges that exist in both `G` and `H`.
 *
 * The node set of `H` and `G` must be the same.
 *
 * ### Notes
 *
 * Attributes from the graph, nodes and edges are not copied to the new graph.
 * If you want a new graph of the intersection of `G` and `H` with the
 * attributes, (including edge data) from `G` use `removeNode()` as follows
 *
 * ```
 * var G = jsnx.pathGraph(3);
 * var H = jsnx.pathGraph(5);
 * var R = G.copy();
 * for (var n of G) {
 *   if (!H.hasNode(n)) {
 *     R.removeNode(n);
 *   }
 * }
 * ```
 *
 * @param {Graph} G
 * @param {Graph} H
 * @return {Graph} A new graph with the same types as G
 */
export async function intersection(G, H) {
  if (G.isMultigraph() !== H.isMultigraph()) {
    throw new JSNetworkXError('G and H must both be graphs or multigraphs');
  }

  // create new graph
  let R = createEmptyCopy(G);
  R.name = `Intersection of (${G.name} and ${H.name})`;
  assertSameNodes(G, H);

  var graph = G.numberOfEdges() < H.numberOfEdges() ? G : H;
  var otherGraph = graph === G ? H : G;

  let edges = graph.isMultigraph() ?
    graph.edgesIter(false, true) :
    graph.edgesIter();
  let hasEdge = otherGraph.hasEdge;
  let addEdge = R.addEdge;
  for (let e of edges) {
    if (hasEdge.apply(otherGraph, e)) {
      addEdge.apply(R, e);
    }
  }

  return R;
}

/**
 * Return a new graph that contains the edges that exist in `G` but not in `H`.
 *
 * The node sets of `H` and `G` must be the same.
 *
 * ### Notes
 *
 * Attributes from the graph, nodes and edges are not copied to the new graph.
 * If you want a new graph of the difference of `G` and `H` with the attributes
 * (including edge data) from `G`, use `removeNodes()` as follows:
 *
 * ```
 * var G = jsnx.pathGraph(3);
 * var H = jsnx.pathGraph(5);
 * var R = G.copy();
 * for (var n of G) {
 *   if (!H.hasNode(n)) {
 *     R.removeNode(n);
 *   }
 * }
 * ```
 *
 * @param {Graph} G
 * @param {Graph} H
 * @return {Graph} A new graph with the same types as G
 */
export async function difference(G, H) {
  if (G.isMultigraph() !== H.isMultigraph()) {
    throw new JSNetworkXError('G and H must both be graphs or multigraphs');
  }
  // create new graph
  let R = createEmptyCopy(G);
  G.name = `Difference of (${G.name} and ${H.name})`;
  assertSameNodes(G, H);

  let edges = G.isMultigraph() ?
    G.edgesIter(false, true) :
    G.edgesIter();
  let hasEdge = H.hasEdge;
  let addEdge = R.addEdge;
  for (let e of edges) {
    if (!hasEdge.apply(H, e)) {
      addEdge.apply(R, e);
    }
  }

  return R;
}

/**
 * Return new graph with edges that exit in either `G` or `H` but not both.
 *
 * The node sets of `H` and `G` must be the same.
 *
 * ### Notes
 *
 * Attributes from the graph, nodes and edges are not copied to the new graph.
 *
 * @param {Graph} G
 * @param {Graph} H
 * @return {Graph} A new graph with the same types as G
 */
export async function symmetricDifference(G, H) {
  if (G.isMultigraph() !== H.isMultigraph()) {
    throw new JSNetworkXError('G and H must both be graphs or multigraphs');
  }
  let R = createEmptyCopy(G);
  R.name = `Symmetric difference of (${G.name} and ${H.name})`;

  assertSameNodes(G, H);
  R.addNodesFrom(setSymmetricDifference(new Set(G), new Set(H)));

  let edges = G.isMultigraph() ?
    G.edgesIter(false, true) :
    G.edgesIter();
  let {addEdge} = R;
  let {hasEdge} = H;
  for (let edge of edges) {
    if (!hasEdge.apply(H, edge)) {
      addEdge.apply(R, edge);
    }
  }

  edges = H.isMultigraph() ?
    H.edgesIter(false, true) :
    H.edgesIter();
  ({hasEdge} = H);
  for (let edge of edges) {
    if (!hasEdge.apply(G, edge)) {
      addEdge.apply(R, edge);
    }
  }

  return R;
}

/**
 * Return a new graph of `G` composed with `H`.
 *
 * Composition is the simple union of the node sets and edge sets. The node sets
 * of `G` and `H` do not need to be disjoint.
 *
 * ### Notes
 *
 * It is recommended that `G` and `H` be either both directed or both
 * undirected. Attributes from `H` take precedent over attributes from `G`.
 *
 * @param {Graph} G
 * @param {Graph} H
 * @return {Graph} A new graph with the same type as G
 */
export async function compose(G, H) {
  if (G.isMultigraph() !== H.isMultigraph()) {
    throw new JSNetworkXError('G and H must both be graphs or multigraphs');
  }

  let R = new G.constructor();
  R.name = `compose(${G.name}, ${H.name})`;
  R.addNodesFrom(G.nodesIter(true));
  R.addNodesFrom(H.nodesIter(true));
  R.addEdgesFrom(
    G.isMultigraph() ? G.edgesIter(true, true) : G.edgesIter(true)
  );
  R.addEdgesFrom(
    H.isMultigraph() ? H.edgesIter(true, true) : H.edgesIter(true)
  );

  // add graph attributes
  Object.assign(R.graph, G.graph, H.graph);

  return R;
}
