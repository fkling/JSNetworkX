/*eslint max-len:[1, 94]*/
'use strict';

import {
  Arrays,
  Map,
  PriorityQueue,
  getDefault,
  tuple2
} from '../../_internals';

/**
 * Compute the shortest-path betweenness centrality for nodes.
 *
 * Betweenness centrality of a node `$v$` is the sum of the
 * fraction of all-pairs shortest paths that pass through `$v$`:
 *
 * ```math
 * c_B(v) = \sum_{s,t \in V} \frac{\sigma(s, t|v)}{\sigma(s, t)}
 * ```
 *
 * where `$V$` is the set of nodes, `$\sigma(s, t)$` is the number of
 * shortest `$(s, t)$`-paths,  and `$\sigma(s, t|v)$` is the number of those
 * paths  passing through some  node `$v$` other than `$s, t$`.
 * If `$s = t$`, `$\sigma(s, t) = 1$`, and if `$v \in {s, t}$`,
 * `$\sigma(s, t|v) = 0$` ([2][]).
 *
 * ### Notes
 *
 * The algorithm is from Ulrik Brandes ([1][]):
 *
 * See ([2][]) for details on algorithms for variations and related metrics.
 *
 * For approximate betweenness calculations set `k=#samples` to use
 * `k` nodes ("pivots") to estimate the betweenness values. For an estimate
 * of the number of pivots needed see ([3][]).
 *
 * For weighted graphs the edge weights must be greater than zero.
 * Zero edge weights can produce an infinite number of equal length
 * paths between pairs of nodes.
 *
 * ### References
 *
 * [1] [A Faster Algorithm for Betweenness Centrality.
 *    Ulrik Brandes,
 *    Journal of Mathematical Sociology 25(2):163-177, 2001.][1]
 * [1]: http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf
 *
 * [2] [Ulrik Brandes: On Variants of Shortest-Path Betweenness
 *    Centrality and their Generic Computation.
 *    Social Networks 30(2):136-145, 2008.][2]
 * [2]: http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 *
 * [3] [Ulrik Brandes and Christian Pich:
 *    Centrality Estimation in Large Networks.
 *    International Journal of Bifurcation and Chaos 17(7):2303-2318, 2007.][3]
 * [3]: http://www.inf.uni-konstanz.de/algo/publications/bp-celn-06.pdf
 *
 * @see edgeBetweennessCentrality
 * @see loadCentrality
 *
 * @param {!Graph} G A JSNetworkX graph
 * @param {{k: ?number, normalized: ?bool, weight: ?string,endpoints: ?bool}=} optParameters
 *   - `k` (int)
 *
 *     If `k` is defined use `k` node samples to estimate betweenness.
 *     The value of `k <= n` where `n` is the number of nodes in the graph.
 *     Higher values give better approximation.
 *   - `normalized` (bool)
 *
 *     If `true`, the betweenness values are normalized by `2/((n-1)(n-2))`
 *     for graphs and `1/((n-1)(n-2))` for directed graphs where `n` is the
 *     number of nodes in G.
 *   - `weight` (default=null)
 *
 *     If null, all edge weights are considered equal.
 *     Otherwise holds the name of the edge attribute used as weight.
 *
 *   - `endpoints` (default=false)
 *
 *     If true include the endpoints in the shortest path counts.
 *
 * @return {Map} object with node keys with betweenness centrality as the value.
 */
export async function betweennessCentrality(G, optArgDict={}) {
  // TODO: Use destructuring defaults once 6to5 supports it
  // {k=null, normalized=true, weight=null, endpoints=false}
  var {k, normalized, weight, endpoints} = optArgDict;

  normalized = normalized == null ? true : normalized;
  endpoints = endpoints == null ? false : endpoints;

  var v;
  var betweenness = new Map((for (v of G) tuple2(v, 0)));

  var nodes = G.nodes();
  if (k != null) {
    nodes = Arrays.sample(nodes, k);
  }

  nodes.forEach(s => {
    // single source shortest paths
    var [S, P, sigma] = weight == null ?
      singleSourceShortestPathBasic(G, s) : // use BFS
      singleSourceDijkstraPathBasic(G, s, weight); // use Dijkstra's algorithm
    // accumulation
    betweenness = endpoints ?
      accumulateEndpoints(betweenness, S, P, sigma, s) :
      accumulateBasic(betweenness, S, P, sigma, s);
  });
  // rescaling
  return rescale(betweenness, G.order(), normalized, G.isDirected(), k);
}

/**
 * Compute betweenness centrality for edges.
 *
 * Betweenness centrality of an edge `$e$` is the sum of the
 * fraction of all-pairs shortest paths that pass through `$e$`:
 *
 * ```math
 * c_B(v) = \sum_{s,t \in V} \frac{\sigma(s, t|e)}{\sigma(s, t)}
 * ```
 *
 * where `$V$` is the set of nodes, `$\sigma(s, t)$` is the number of
 * shortest `$(s, t)$`-paths, and `$\sigma(s, t|e)$` is the number of
 * those paths passing through edge `$e$` ([2][]).
 *
 * ### Notes
 *
 * The algorithm is from Ulrik Brandes ([1][]).
 *
 * For weighted graphs the edge weights must be greater than zero.
 * Zero edge weights can produce an infinite number of equal length
 * paths between pairs of nodes.
 *
 * ### References
 *
 * [1] [A Faster Algorithm for Betweenness Centrality. Ulrik Brandes,
 *    Journal of Mathematical Sociology 25(2):163-177, 2001.][1]
 * [1]: http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf
 * [2] [Ulrik Brandes: On Variants of Shortest-Path Betweenness
 *    Centrality and their Generic Computation.
 *    Social Networks 30(2):136-145, 2008.][2]
 * [2]: http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 *
 * @see betweennessCentrality
 * @see edgeLoad
 *
 * @param {!Graph} G A NetworkX graph
 * @param {{normalized: bool=, weight: string=}=} optArgDict
 *   - `normalized` (default=false)
 *
 *     If true the betweenness values are normalized by `2/(n(n-1))`
 *     for graphs, and `1/(n(n-1))` for directed graphs where `n`
 *     is the number of nodes in G.
 *
 *   - `weight` (default=null)
 *
 *     If null, all edge weights are considered equal.
 *     Otherwise holds the name of the edge attribute used as weight.
 *
 * @return {Map} object with edge keys with betweenness centrality as the value.
*/
export async function edgeBetweennessCentrality(G, optArgDict={}) {
  // TODO: Use destructuring defaults once 6to5 supports it
  var {normalized, weight} = optArgDict;
  normalized = normalized == null ? true : normalized;

  var v;
  var betweenness = new Map((for (v of G) tuple2(v, 0)));
  for (var edge of G.edgesIter()) {
    betweenness.set(edge, 0);
  }

  for (let s of G) {
    // single source shortest paths
    var [S, P, sigma] = weight == null ?
      singleSourceShortestPathBasic(G, s) : // use BFS
      singleSourceDijkstraPathBasic(G, s, weight); // use Dijkstra's algorithm
    // accumulation
    betweenness = accumulateEdges(betweenness, S, P, sigma, s);
  }
  // rescaling
  for (let n of G) {
    betweenness.delete(n);
  }
  return rescaleE(betweenness, G.order(), normalized, G.isDirected());
}

// helpers for betweenness centrality

function singleSourceShortestPathBasic(G, s) {
  var S = [];
  var P = new Map((for (v of G) tuple2(v, [])));
  var sigma = new Map((for (v of G) tuple2(v, 0)));
  var D = new Map();

  sigma.set(s, 1);
  D.set(s, 0);
  var Q = [s];
  while (Q.length > 0) {  // use BFS to find shortest paths
    var v = Q.shift();
    S.push(v);
    var Dv = D.get(v);
    var sigmav = sigma.get(v);
    /* eslint-disable no-loop-func */
    G.neighbors(v).forEach(w => {
      if (!D.has(w)) {
        Q.push(w);
        D.set(w, Dv + 1);
      }
      if (D.get(w) === Dv + 1) {   // this is a shortest path, count paths
        sigma.set(w, sigma.get(w) + sigmav);
        P.get(w).push(v);    // predecessors
      }
    });
    /* eslint-enable no-loop-func */
  }
  return [S, P, sigma];
}

function singleSourceDijkstraPathBasic(G, s, weight='weight') {
  // modified from Eppstein
  var S = [];
  var P = new Map((for (v of G) tuple2(v, [])));
  var sigma = new Map((for (v of G) tuple2(v, 0)));
  var D = new Map();

  sigma.set(s, 1);
  var seen = new Map([tuple2(s, 0)]);
  // use Q as heap with (distance,node id) tuples
  var Q = new PriorityQueue();
  Q.enqueue(0, [s, s]);
  while (Q.size > 0) {
    var [dist, [pred, v]] = Q.dequeue();
    if (D.has(v)) {
      continue;   // already searched this node.
    }
    sigma.set(v, sigma.get(v) + sigma.get(pred));    // count paths
    S.push(v);
    D.set(v, dist);

    for (var [w, edgedata] of G.get(v)) {
      var vwDist = dist + getDefault(edgedata[weight], 1);
      if (!D.has(w) && (!seen.has(w) || vwDist < seen.get(w))) {
        seen.set(w, vwDist);
        Q.enqueue(vwDist, [v, w]);
        sigma.set(w, 0);
        P.set(w, [v]);
      }
      else if (vwDist === seen.get(w)) {  // handle equal paths
        sigma.set(w, sigma.get(w) + sigma.get(v));
        P.get(w).push(v);
      }
    }
  }
  return [S, P, sigma];
}

function accumulateBasic(betweenness, S, P, sigma, s) {
  var delta = new Map((for (s of S) tuple2(s, 0)));

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1 + delta.get(w)) / sigma.get(w);
    /* eslint-disable no-loop-func */
    P.get(w).forEach(v => {
      delta.set(v, delta.get(v) + sigma.get(v) * coeff);
    });
    /* eslint-enable no-loop-func */
    // handle object nodes
    if (w !== s || typeof w === 'object' && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w));
    }
  }
  return betweenness;
}

function accumulateEndpoints(betweenness, S, P, sigma, s) {
  betweenness.set(s, betweenness.get(s) + S.length - 1);
  var delta = new Map((for (s of S) tuple2(s, 0)));

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1 + delta.get(w)) / sigma.get(w);
    /* eslint-disable no-loop-func */
    P.get(w).forEach(v => {
      delta.set(v, delta.get(v) + sigma.get(v) * coeff);
    });
    /* eslint-enable no-loop-func */
    // handle object nodes
    if (w !== s || typeof w === 'object' && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w) + 1);
    }
  }
  return betweenness;
}

function accumulateEdges(betweenness, S, P, sigma, s) {
  var delta = new Map((for (s of S) tuple2(s, 0)));

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1 + delta.get(w)) / sigma.get(w);
    /* eslint-disable no-loop-func */
    P.get(w).forEach(v => {
      var c = sigma.get(v) * coeff;
      var edge = [v, w];
      if (!betweenness.has(edge)) {
        edge = [w, v];
      }
      betweenness.set(edge, betweenness.get(edge) + c);
      delta.set(v, delta.get(v) + c);
    });
    /* eslint-enable no-loop-func */
    // handle object nodes
    if (w !== s || typeof w === 'object' && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w));
    }
  }
  return betweenness;
}

function rescale(betweenness, n, optNormalized, optDirected=false, optK) {
  var scale;
  if (optNormalized) {
      scale = n <= 2 ? null : 1 / ((n - 1) * (n - 2));
  }
  else {  // rescale by 2 for undirected graphs
    scale = !optDirected ? 1 / 2 : null;
  }
  if (scale != null) {
    if (optK != null) {
      scale = scale * n / optK;
    }
    betweenness.forEach((v, k) => betweenness.set(k, v * scale));
  }
  return betweenness;
}

function rescaleE(betweenness, n, optNormalized, optDirected) {
  var scale;
  if (optNormalized) {
      scale = n <= 1 ? null : 1 / (n * (n - 1));
  }
  else {  // rescale by 2 for undirected graphs
    scale = !optDirected ? 1 / 2 : null;
  }
  if (scale != null) {
    betweenness.forEach((v, k) => betweenness.set(k, v * scale));
  }
  return betweenness;
}
