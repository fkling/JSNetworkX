'use strict';
/**
 * @fileoverview Shortest path algorithms for unweighted graphs.
 */

import {JSNetworkXNoPath} from '../../exceptions';

import {
  Map,
  getDefault,
  nodesAreEqual,
  sprintf
} from '../../_internals';

/**
 * Compute the shortest path lengths from source to all reachable nodes.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var length = jsnx.singleSourceShortestPathLength(G, 0);
 * length.get(4);
 * // 4
 * length
 * // Map {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
 * ```
 *
 * @see shortestPathLength
 *
 * @param {Graph} G graph
 * @param {Node} source Starting node for path
 * @param {number=} optCutoff
 *    Depth to stop the search. Only paths of length <= cutoff are returned.
 *
 * @return {!Map} Map of shortest path lengths keyed by target.
 */
export async function singleSourceShortestPathLength(G, source, optCutoff) {
  var seen = new Map(); // level (number of hops) when seen n BFS
  var level = 0; // the current level
  // map of nodes to check at next level
  var nextlevel = new Map([[source, 1]]);

  while (nextlevel.size > 0) {
    var thislevel = nextlevel;
    nextlevel = new Map();
    /*eslint no-loop-func:0*/
    for (var v of thislevel.keys()) {
      if (!seen.has(v)) {
        seen.set(v, level);
        G.get(v).forEach((_, n) => nextlevel.set(n, 1));
      }
    }
    if (optCutoff != null && optCutoff <= level) {
      break;
    }
    level += 1;
  }
  return seen;
}

/**
 * Compute the shortest path lengths between all nodes in G.
 *
 * The map returned only has keys for reachable node pairs.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var length = jsnx.allPairsShortestPathLength(G);
 * length.get(1).get(4);
 * // 3
 * length.get(1);
 * // Map {0: 1, 1: 0, 2: 1, 3: 2, 4: 3}
 * ```
 *
 * @param {Graph} G
 * @param {number=} optCutoff  depth to stop the search.
 *    Only paths of length <= cutoff are returned.
 *
 * @return {!Map}
 */
export async function allPairsShortestPathLength(G, optCutoff) {
    var paths = new Map();
    for (var n of G) {
      paths.set(n, singleSourceShortestPathLength(G, n, optCutoff));
    }
    return paths;
}

/**
 * Return a list of nodes in a shortest path between source and target.
 *
 * This algorithm is used by `shortestPath(G, source, target)`.
 *
 * @see shortestPath
 *
 * @param {Graph} G
 * @param {Node} source starting node for path
 * @param {Node} target ending node for path
 *
 * @return {!Array}
 */
export async function bidirectionalShortestPath(G, source, target) {
    // call helper to do the real work
    var [pred, succ, w] = bidirectionalPredSucc(G, source, target);

    // build path from pred+w+succ
    var path = [];
    // from source to w
    while (w != null) {
      path.push(w);
      w = pred.get(w);
    }
    w = succ.get(path[0]);
    path.reverse();
    // from w to target
    while (w != null) {
      path.push(w);
      w = succ.get(w);
    }
    return path;
}

/**
 * Bidirectional shortest path helper.
 *
 * @return {!Array} Returns [pred,succ,w] where
 *    pred is a map of predecessors from w to the source, and
 *    succ is a map of successors from w to the target.
 */
function bidirectionalPredSucc(G, source, target) {
  // does BFS from both source and target and meets in the middle
  if (nodesAreEqual(source, target)) {
    return [new Map([[source, null]]), new Map([[target, null]]), source];
  }

  // handle either directed or undirected
  var gpred, gsucc;
  if (G.isDirected()) {
    gpred = G.predecessorsIter.bind(G);
    gsucc = G.successorsIter.bind(G);
  }
  else {
    gpred = G.neighborsIter.bind(G);
    gsucc = G.neighborsIter.bind(G);
  }

  // predecesssor and successors in search
  var pred = new Map([[source, null]]);
  var succ = new Map([[target, null]]);
  //
  // initialize fringes, start with forward
  var forwardFringe = [source];
  var reverseFringe = [target];
  var thisLevel;

  /*jshint newcap:false*/
  while (forwardFringe.length > 0 && reverseFringe.length > 0) {
    if (forwardFringe.length <= reverseFringe.length) {
      thisLevel = forwardFringe;
      forwardFringe = [];
      for (let v of thisLevel) {
        for (let w of gsucc(v)) {
          if (!pred.has(w)) {
            forwardFringe.push(w);
            pred.set(w, v);
          }
          if (succ.has(w)) {
            return [pred, succ, w]; // found path
          }
        }
      }
    }
    else {
      thisLevel = reverseFringe;
      reverseFringe = [];
      for (let v of thisLevel) {
        for (let w of gpred(v)) {
          if (!succ.has(w)) {
            reverseFringe.push(w);
            succ.set(w, v);
          }
          if (pred.has(w)) {
            return [pred, succ, w]; // found path
          }
        }
      }
    }
  }
  throw new JSNetworkXNoPath(sprintf(
    'No path between `%j` and `%j`.',
    source,
    target
  ));
}


/**
 * Compute shortest path between source and all other nodes reachable from
 * source.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var path = jsnx.singleSourceShortestPath(G, 0);
 * path.get(4);
 * // [1, 2, 3, 4]
 * ```
 *
 * ### Notes
 *
 * The shortest path is not necessarily unique. So there can be multiple⋅
 * paths between the source and each target node, all of which have the⋅
 * same 'shortest' length. For each target node, this function returns⋅
 * only one of those paths.
 *
 *
 * @see shortestPath
 *
 * @param {Graph} G
 * @param {Node} source
 * @param {number=} optCutoff Depth to stop the search.
 *    Only paths of `length <= cutoff` are returned.
 *
 * @return {!Map<Array>} Map, keyed by target, of shortest paths.
 */
export async function singleSourceShortestPath(G, source, optCutoff) {
    var level = 0;
    var nextlevel = new Map([[source, 1]]);
    var paths = new Map([[source, [source]]]);
    if (optCutoff === 0) {
      return paths;
    }
    /*jshint loopfunc:true*/
    while (nextlevel.size > 0) {
      var thislevel = nextlevel;
      nextlevel = new Map();
      for (var v of thislevel.keys()) {
        for (var w of G.get(v).keys()) {
          if (!paths.has(w)) {
            paths.set(w, paths.get(v).concat([w]));
            nextlevel.set(w, 1);
          }
        }
      }
      level += 1;
      if (optCutoff != null && optCutoff <= level) {
        break;
      }
    }
    return paths;
}

/**
 * Compute shortest paths between all nodes.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.pathGraph(5);
 * var path = jsnx.allPairsShortestPath(G);
 * path.get(0).get(4);
 * // [0, 1, 2, 3, 4]
 * ```
 *
 * @see floydWarshall
 *
 * @param {Graph} G
 * @param {number=} optCutoff Depth to stop the search.
 *    Only paths of length <= cutoff are returned.
 *
 * @return {!Map} Map, keyed by source and target, of shortest paths.
 */
export async function allPairsShortestPath(G, optCutoff) {
    var paths = new Map();
    for (var n of G) {
      paths.set(n, singleSourceShortestPath(G, n, optCutoff));
    }
    return paths;
}

/**
 * Returns a map of predecessors for the path from source to all nodes in G.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.pathGraph(4);
 * G.nodes();
 * // [0, 1, 2, 3, 4]
 * jsnx.predecessor(G, 0);
 * // Map {0: [], 1: [0], 2: [1], 3: [2]}
 *
 * @param {Graph} G
 * @param {Node} source Starting node for path
 * @param {{target: Node, cutoff: number, returnSeen: boolean}} optArgs
 *   - `target(=null)`: If provided only predecessors between⋅source and target
 *     are returned
 *   - `cutoff`: Depth to stop the search. Only paths of `length <= cutoff` are
 *     returned
 *   - `returnSeen(=false)`: If `true`, return `(seenNodes, predecessors)`
 *
 * @return {!(Map|Array)} Map, keyed by node, of predecessors in the shortest
 *   path.
 */
export async function predecessor(G, source, optArgs={}) {
  // TODO: use parameter destructuring
  // {target, cutoff, returnSeen}
  var {target, cutoff, returnSeen} = optArgs;

  var level = 0;
  var nextlevel = [source];
  var seen = new Map([[source, level]]);
  var pred = new Map([[source, []]]);

  /*jshint loopfunc:true*/
  while (nextlevel.length > 0) {
    level += 1;
    var thislevel = nextlevel;
    nextlevel = [];
    thislevel.forEach(v => {
      G.get(v).forEach((_, w) => {
        if (!seen.has(w)) {
          pred.set(w, [v]);
          seen.set(w, level);
          nextlevel.push(w);
        }
        else if (seen.get(w) === level) { // add v to predecesssor list if it
          pred.get(w).push(v);            // is at the correct level
        }
      });
    });
    if (cutoff != null && cutoff <= level) {
      break;
    }
  }

  if (target != null) {
    if (returnSeen) {
      return pred.has(target) ? [pred.get(target), seen.get(target)] : [[], -1];
    }
    else {
      return getDefault(pred.get(target), []);
    }
  }
  return returnSeen ? [pred, seen] : pred;
}
