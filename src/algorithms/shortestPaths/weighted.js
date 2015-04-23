'use strict';

import {
  Map,
  PriorityQueue,
  mapIterator,
  nodesAreEqual,
  getDefault,
  sprintf
} from '../../_internals';

import JSNetworkXNoPath from '../../exceptions/JSNetworkXNoPath';

/**
 * Returns the shortest path from `source` to `target` in a weighted graph G.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * jsnx.dijkstraPath(G, {source: 0, target: 4});
 * // [0, 1, 2, 3, 4]
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical. Distances are calculated as sums
 * of weighted edges traversed.
 *
 * @see bidirectionalDijkstra
 *
 * @param {Graph} G
 * @param {{source: Node, target: Node, weight: ?string}} parameters
 *   - source: Starting node
 *   - target: Ending node
 *   - weight(='weight'): Edge data key corresponding to the edge weight
 * @return {Array} List of nodes in a shortest path
 */
export async function dijkstraPath(G, {source, target, weight='weight'}) {
  var [distances, paths] = // eslint-disable-line no-unused-vars
    await singleSourceDijkstra(G, {source, target, weight});
  var path = paths.get(target);
  if (!path) {
    throw new JSNetworkXNoPath(sprintf(
      'Node %j is not reachable from %j',
      source,
      target
    ));
  }
  return path;
}

/**
 * Returns the shortest path length from `source` to `target` in a weighted
 * graph.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * jsnx.dijkstraPathLength(G, {source: 0, target: 4});
 * // 4
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical. Distances are calculated as sums
 * of weighted edges traversed.
 *
 * @see bidirectionalDijkstra
 *
 * @param {Graph} G
 * @param {{source: Node, target: Node, weight: ?string}} parameters
 *   - source: Starting node
 *   - target: Ending node
 *   - weight(='weight'): Edge data key corresponding to the edge weight
 * @return {number} Shortest path length
 */
export async function dijkstraPathLength(G, {source, target, weight='weight'}) {
  var distances = await singleSourceDijkstraPathLength(G, {source, weight});
  var distance = distances.get(target);
  if (distance == null) {
    throw new JSNetworkXNoPath(sprintf(
      'Node %j is not reachable from %j',
      source,
      target
    ));
  }
  return distance;
}

function minMultiEdgeWeight(keydata, weight) {
  let minweight = Infinity;
  for (let key in keydata) {
    let edgeWeight = getDefault(keydata[key][weight], 1);
    if (edgeWeight < minweight) {
      minweight = edgeWeight;
    }
  }
  return minweight;
}

/**
 * Compute shortest path between source and all other reachable nodes for a
 * weighted graph.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var path = jsnx.singleSourceDijkstraPath(G, {source: 0});
 * path.get(4);
 * // [0, 1, 2, 3, 4]
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical. Distances are calculated as sums
 * of weighted edges traversed.
 *
 * @see singleSourceDijkstra
 *
 * @param {Graph} G
 * @param {{source: Node, weight: ?string, cutoff: ?number}} parameters
 *   - source: Starting node for path
 *   - weight: Edge data key corresponding to the edge weight
 *   - cutoff: Depth to stop the search. Only paths of length <= cutoff are
 *     returned.
 * @return {Map} Map of shortest paths keyed by target
 */
export async function singleSourceDijkstraPath(
  G,
  {source, cutoff, weight='weight'}
) {
 var [length, path] = // eslint-disable-line no-unused-vars
   await singleSourceDijkstra(G, {source, cutoff, weight});
 return path;
}

/**
 * Compute the shortest path length between source and all other reachable
 * nodes for a weighted graph.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var length = jsnx.singleSourceDijkstraPathLength(G, {source: 0});
 * length.get(4);
 * // 4
 * length
 * // Map {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical. Distances are calculated as sums
 * of weighted edges traversed.
 *
 * @see singleSourceDijkstra
 *

 * @param {Graph} G
 * @param {{source: Node, weight: ?string, cutoff: ?number}} parameters
 *   - source: Starting node for path
 *   - weight: Edge data key corresponding to the edge weight
 *   - cutoff: Depth to stop the search. Only paths of length <= cutoff are
 *     returned.
 * @return {Map} Map of shortest paths keyed by target
 */
export async function singleSourceDijkstraPathLength(
  G,
  {source, cutoff, weight='weight'}
) {
  var distances = new Map();
  var seen = new Map([[source, 0]]);
  var fringe = new PriorityQueue();
  var i = 0;
  fringe.enqueue(0, [i++, source]);
  while (fringe.size > 0) {
    let [d, [_, v]] = fringe.dequeue(); // eslint-disable-line no-unused-vars
    if (distances.has(v)) {
      continue; // already searched this node
    }
    distances.set(v, d);
    let edata;
    if (G.isMultigraph()) {
      edata = mapIterator(
        G.get(v),
        ([w, keydata]) => { // eslint-disable-line no-loop-func
          return [w, {[weight]: minMultiEdgeWeight(keydata, weight)}];
        }
      );
    } else {
      edata = G.get(v);
    }
    for (let [w, edgeData] of edata) {
      let vwDistance = d + getDefault(edgeData[weight], 1);
      if (cutoff != null) {
        if (vwDistance > cutoff) {
          continue;
        }
      }
      if (distances.has(w)) {
        if (vwDistance < distances.get(w)) {
          throw new Error('Contradictory paths found: negative weights?');
        }
      } else if (!seen.has(w) || vwDistance < seen.get(w)) {
        seen.set(w, vwDistance);
        fringe.enqueue(vwDistance, [i++, w]);
      }
    }
  }

  return distances;
}

/**
 * Compute shortest paths and lengths in a weighted graph G.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var [lengths, paths] = jsnx.singleSourceDijkstra(G, {source: 0});
 * lengths.get(4);
 * // 4
 * lengths
 * // Map {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
 * paths.get(4);
 * // [0, 1, 2, 3, 4]
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical.
 * Distances are calculated as sums of weighted edges traversed.
 *
 * This algorithm is not guaranteed to work if edge weights are negative or are
 * floating point numbers (overflows and roundoff errors can cause problems).
 *
 * @see singleSourceDijkstraPath
 * @see singleSourceDijkstraPathLength
 *
 * @param {Graph} G
 * @param {{source: Node, target: ?Node, cutoff: ?number, weight: ?string}}
 *   parameters
 *   - source: Starting node for path
 *   - target: Ending node in the path (optional)
 *   - weight: Edge data key corresponding to the edge weight
 *   - cutoff: Depth to stop the search. Only paths of length <= cutoff are
 *     returned.
 * @return {Array<Map>}
 *   Returns a tuple of two Maps keyed by node. The first Map stores distances
 *   from the source. The second one stores the path from the source to that
 *   node.
 */
export async function singleSourceDijkstra(
  G,
  {source, target, cutoff, weight='weight'}
) {
  if (nodesAreEqual(source, target)) {
    return [new Map([[source, 0]]), new Map([[source, target]])];
  }

  var distances = new Map();
  var paths = new Map([[source, [source]]]);
  var seen = new Map([[source, 0]]);
  var fringe = new PriorityQueue();
  var i = 0;
  fringe.enqueue(0, [i++, source]);
  while (fringe.size > 0) {
    let [d, [_, v]] = fringe.dequeue(); // eslint-disable-line no-unused-vars
    if (distances.has(v)) {
      continue; // already searched this node
    }
    distances.set(v, d);
    if (nodesAreEqual(v, target)) {
      break;
    }
    let edata;
    if (G.isMultigraph()) {
      edata = mapIterator(
        G.get(v),
        ([w, keydata]) => { // eslint-disable-line no-loop-func
          return [w, {[weight]: minMultiEdgeWeight(keydata, weight)}];
        }
      );
    } else {
      edata = G.get(v);
    }
    for (let [w, edgeData] of edata) {
      let vwDistance = d + getDefault(edgeData[weight], 1);
      if (cutoff != null) {
        if (vwDistance > cutoff) {
          continue;
        }
      }
      if (distances.has(w)) {
        if (vwDistance < distances.get(w)) {
          throw new Error('Contradictory paths found: negative weights?');
        }
      } else if (!seen.has(w) || vwDistance < seen.get(w)) {
        seen.set(w, vwDistance);
        fringe.enqueue(vwDistance, [i++, w]);
        paths.set(w, paths.get(v).concat([w]));
      }
    }
  }

  return [distances, paths];
}

// TODO dijkstraPredecessorAndDistance

/**
 * Compute shortest path lengths between all nodes in a weighted graph.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var path = jsnx.allPairsDijkstraPath(G);
 * path.get(1).get(4);
 * // 3
 * path.get(1);
 * // Map {0: 1, 1: 0, 2: 1, 3: 2, 4: 3}
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical.
 * Distances are calculated as sums of weighted edges traversed.
 *
 * The Map returned only has keys for reachable node pairs.
 *
 * @param {Graph} G
 * @param {{weight: ?string, cutoff: ?number}=} optParameters
 *   - weight: Edge data key corresponding to the edge weight
 *   - cutoff: Depth to stop the search. Only paths of length <= cutoff are
 *     returned.
 * @return {Map} A Map of Maps of shortest path lengths
 */
export async function allPairsDijkstraPathLength(
  G,
  {cutoff, weight='weight'}={}
) {
  var distances = new Map();
  var parameters = {weight, cutoff};
  for (let source of G) {
    parameters.source = source;
    distances.set(
      source,
      await singleSourceDijkstraPathLength(G, parameters)
    );
  }
  return distances;
}

/**
 * Compute shortest paths between all nodes in a weighted graph.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var path = jsnx.allPairsDijkstraPath(G);
 * path.get(0).get(4);
 * // [0, 1, 2, 3, 4]
 * ```
 *
 * ### Notes
 *
 * Edge weight attributes must be numerical.
 * Distances are calculated as sums of weighted edges traversed.
 *
 * @param {Graph} G
 * @param {{weight: ?string, cutoff: ?number}=} optParameters
 *   - weight: Edge data key corresponding to the edge weight
 *   - cutoff: Depth to stop the search. Only paths of length <= cutoff are
 *     returned.
 * @return {Map} A Map of Maps of shortest paths.
 */
export async function allPairsDijkstraPath(G, {cutoff, weight='weight'}={}) {
  var paths = new Map();
  var parameters = {weight, cutoff};
  for (let source of G) {
    parameters.source = source;
    paths.set(
      source,
      await singleSourceDijkstraPath(G, parameters)
    );
  }
  return paths;
}

// TODO bellmanFord
// TODO goldbergRadzik
// TODO negativeEdgeCycle
// TODO bidirectionalDijkstra
