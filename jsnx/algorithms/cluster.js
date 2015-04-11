'use strict';

import JSNetworkXError from '../exceptions/JSNetworkXError';

import {
/*jshint ignore:start*/
  Map,
  Set,
/*jshint ignore:end*/

  genCombinations,
  getDefault,
  mapIterator,
  max,
  next,
  tuple2,
  tuple3
} from '../_internals';

/**
 * Compute the number of triangles.
 *
 * Finds the number of triangles that include a node as one vertex.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.completeGraph(5);
 * jsnx.triangles(G, 0);
 * // 6
 * jsnx.triangles(G);
 * Map {0: 6, 1: 6, 2: 6, 3: 6, 4: 6}
 * Array.from(jsnx.triangles(G, [0,1]).values());
 * // [6, 6]
 * ```
 *
 * ### Notes
 *
 * When computing triangles for the entire graph each triangle is counted
 * three times, once at each node.  Self loops are ignored.
 *
 * @param {Graph} G A JSnetworkX graph
 * @param {Iterable=} optNodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 *
 * @return {!(Map|number)} Number of triangles keyed by node label.
 */
export async function triangles(G, optNodes) {
  if (G.isDirected()) {
    throw new JSNetworkXError(
      'triangles() is not defined for directed graphs.'
    );
  }

  if (optNodes != null && G.hasNode(optNodes)) {
    // return single value
    return Math.floor(next(trianglesAndDegreeIter(G, optNodes))[2] / 2);
  }

  return new Map(mapIterator(
    trianglesAndDegreeIter(G, optNodes),
    /* eslint-disable no-unused-vars */
    ([v, _, triangles]) => tuple2(v, Math.floor(triangles/2), v)
    /* eslint-enable no-unused-vars */
  ));
}

/**
 * Return an iterator of (node, degree, triangles).
 *
 * This double counts triangles so you may want to divide by 2.
 * See `degree()` and `triangles()` for definitions and details.
 *
 * @param {Graph} G A jsnetworkx graph
 * @param {Iterable=} optNodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 *
 * @return {!Iterator<Array>}
 */
function* trianglesAndDegreeIter(G, optNodes) {
  if (G.isMultigraph()) {
    throw new JSNetworkXError('Not defined for multigraphs.');
  }

  var nodesNbrs = mapIterator(
    optNodes == null ? G : G.nbunchIter(optNodes),
    n => tuple2(n, G.get(n))
  );

  for (var [v, vNbrs] of nodesNbrs) {
    var vset = new Set(vNbrs.keys());
    vset.delete(v);
    var ntriangles = 0;
    for (var w of vset) {
      var wset = new Set(G.get(w).keys());
      wset.delete(w);
      ntriangles += vset.intersection(wset).size;
    }
    yield tuple3(v, vset.size, ntriangles);
  }
}

/**
 * Return an iterator of `(node, degree, weightedTriangles)`.
 *
 * Used for weighted clustering.
 *
 * @param {Graph} G A JSnetworkX graph
 * @param {Iterable=} optNodes (default: all nodes)
 *      Compute triangles for nodes in this container.
 * @param {string=} opt_weight (default: 'weight')
 *      The name of edge weight attribute.
 *
 * @return {Iterator<Array>}
 */
function* weightedTrianglesAndDegreeIter(G, optNodes, optWeight='weight') {
  if (G.isMultigraph()) {
    throw new JSNetworkXError('Not defined for multigraphs.');
  }

  var maxWeight = optWeight == null || G.edges().length === 0 ?
    1 :
    max(mapIterator(
      G.edgesIter(true),
      /* eslint-disable no-unused-vars */
      ([u, v, data]) => getDefault(data[optWeight], 1)
      /* eslint-enable no-unused-vars */
    ));

  var nodesNbrs = mapIterator(
    optNodes == null ? G : G.nbunchIter(optNodes),
    n => tuple2(n, G.get(n))
  );

  for (var [i, nbrs] of nodesNbrs) {
    var inbrs = new Set(nbrs.keys()).difference([i]);

    var weightedTriangles = 0;
    var seen = new Set();
    for (var j of inbrs) {
      var weightij = getDefault(nbrs.get(j)[optWeight], 1) / maxWeight;
      seen.add(j);
      var jnbrs = new Set(G.get(j).keys()).difference(seen);
      for (var k of inbrs.intersection(jnbrs)) {
        var weightjk = getDefault(G.get(j).get(k)[optWeight], 1) / maxWeight;
        var weightki = getDefault(nbrs.get(k)[optWeight], 1) / maxWeight;
        weightedTriangles += Math.pow(weightij * weightjk * weightki, 1/3);
      }
    }
    yield tuple3(i, inbrs.size, weightedTriangles * 2);
  }
}

/**
 * Compute the average clustering coefficient for the graph G.
 *
 * The clustering coefficient for the graph is the average,
 *
 * ```math
 * C = \frac{1}{n}\sum_{v \in G} c_v
 * ```
 *
 * where `$n$` is the number of nodes in `$G$`.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.completeGraph(5);
 * jsnx.averageClustering(G);
 * // 1
 * ```
 *
 * ### Notes
 *
 * Self loops are ignored.
 *
 *
 * ### References
 *
 * [1] [Generalizations of the clustering coefficient to weighted
 *     complex networks by J. Saramäki, M. Kivelä, J.-P. Onnela,
 *     K. Kaski, and J. Kertész, Physical Review E, 75 027105 (2007).][1]
 * [1]: http://jponnela.com/web_documents/a9.pdf
 * [2] [Marcus Kaiser,  Mean clustering coefficients: the role of isolated
 *     nodes and leafs on clustering measures for small-world networks.][2]
 * [2]:http://arxiv.org/abs/0802.2512
 *
 * @param {Graph} G graph
 * @param {?Iterable} optNodes (default: all nodes)
 *    Compute average clustering for nodes in this container.
 * @param {?string=} optWeight (default: null)
 *    The edge attribute that holds the numerical value used as a weight.
 *    If `null`, then each edge has weight `1`.
 * @param {?boolean=} optCountZeros
 *    If `false` include only the nodes with nonzero clustering in the average.
 * @return {number}
 */
export async function averageClustering(
  G,
  optNodes,
  optWeight,
  optCountZeros=true
) {
  var clusters = Array.from(await clustering(G, optNodes, optWeight).values());

  if (!optCountZeros) {
    clusters = clusters.filter(v => v > 0);
  }
  return clusters.reduce((s, x) => s + x, 0) / clusters.length;
}

/**
 * Compute the clustering coefficient for nodes.
 *
 * For unweighted graphs the clustering of each node `$u$`
 * is the fraction of possible triangles through that node that exist,
 *
 * ```math
 * c_u = \frac{2 T(u)}{deg(u)(deg(u)-1)}
 * ```
 *
 * where `$T(u)$` is the number of triangles through node `$u$` and `$deg(u)$`
 * is the degree of `$u$`.
 *
 * For weighted graphs the clustering is defined as the geometric average of
 * the subgraph edge weights,
 *
 * ```math
 * c_u = \frac{1}{deg(u)(deg(u)-1)}
 *       \sum_{uv} (\hat{w}_{uv} \hat{w}_{uw} \hat{w}_{vw})^{1/3}
 * ```
 *
 * The edge weights `$\hat{w}_{uv}$` are normalized by the maximum weight in the
 * network `$\hat{w}_{uv} = w_{uv}/\max(2)$`.
 *
 * The value `$c_u$` is assigned to `$0$` if `$deg(u) < 2$`.
 *
 * ### Example
 *
 * ```
 * var G = jsnx.completeGraph(5);
 * jsnx.clustering(G, 0);
 * // 1
 * jsnx.clustering(G);
 * // Map {0: 1, 1: 1, 2: 1, 3: 1, 4: 1}
 * ```
 *
 * @param {Graph} G graph
 * @param {?Iterable=} optNodes (default: all nodes)
 *      Compute average clustering for nodes in this container.
 * @param {?string=} optWeight (default: null)
 *  If the edge attribute that holds the numerical value used as a weight.
 *  If `null`, then each edge has weight `1`.
 *
 * @return {!(number|Map)} Clustering coefficient at specified nodes
 */
export async function clustering(G, optNodes, optWeight) {
  if (G.isDirected()) {
    throw new JSNetworkXError(
      'Clustering algorithms are not defined for directed graphs.'
    );
  }


  var trianglesIter = optWeight == null ?
    trianglesAndDegreeIter(G, optNodes) :
    weightedTrianglesAndDegreeIter(G, optNodes, optWeight);

  var clusters = new Map(mapIterator(
    trianglesIter,
    ([node, degree, triangles]) => {
      return tuple2(
        node,
        triangles === 0 ? 0 : triangles/(degree * (degree - 1))
      );
    }
  ));

  return G.hasNode(optNodes) ? next(clusters.values()) : clusters;
}

/**
 * Compute graph transitivity, the fraction of all possible triangles
 * present in G.
 *
 * Possible triangles are identified by the number of "triads"
 * (two edges with a shared vertex).
 *
 * The transitivity is
 *
 * ```math
 * T = 3\frac{\#triangles}{\#triads}
 * ```
 *
 * ### Example
 *
 * ```
 * var G = jsnx.completeGraph(5);
 * jsnx.transitivity(G);
 * // 1
 * ```
 *
 * @param {Graph} G graph
 * @return {number} Transitivity
 */
export async function transitivity(G) {
  /* eslint-disable no-shadow */
  var triangles = 0; // 6 times number of triangles
  /* eslint-enable no-shadow */
  var triples = 0;  // 2 times number of connected triples

  /* eslint-disable no-unused-vars */
  for (let [node, degree, triangles_] of trianglesAndDegreeIter(G)) {
    /* eslint-enable no-unused-vars */
    triples += degree * (degree - 1);
    triangles += triangles_;
  }

  return triangles === 0 ? 0 : triangles / triples;
}

/**
 * Compute the squares clustering coefficient for nodes.
 *
 * For each node return the faction of possible squares that exist at the node
 *
 * ```math
 * C_4(v) = \frac{ \sum_{u=1}^{k_v}
 * \sum_{w=u+1}^{k_v} q_v(u,w) }{ \sum_{u=1}^{k_v}
 * \sum_{w=u+1}^{k_v} [a_v(u,w) + q_v(u,w)]}
 * ```
 *
 * where `$q_v(u,w)$` are the number of common neighbors of `$u$` and `$v$`
 * other than `$v$` (i.e. squares), and
 * `$a_v(u,w) = (k_u-(1+q_v(u,w)+\theta_{uv}))(k_w-(1+q_v(u,w)+\theta_{uw}))$`
 * where `$\theta_{uw} = 1$` if `$u$` and `$w$` are  connected and `$0$`
 * otherwise.
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.completeGraph(5);
 * jsnx.squareClustering(G, 0);
 * // 1
 * jsnx.squareClustering(G);
 * // Map {0: 1, 1: 1, 2: 1, 3: 1, 4: 1}
 * ```
 *
 * ### Notes
 *
 * While `$C_3(v)$` (triangle clustering) gives the probability that
 * two neighbors of node `$v$` are connected with each other, `$C_4(v)$` is
 * the probability that two neighbors of node `$v$` share a common
 * neighbor different from `$v$`. This algorithm can be applied to both
 * bipartite and unipartite networks.
 *
 * @param {Graph} G graph
 * @param {Iterable=} opt_nodes (default: all)
 *   Compute clustering for nodes in this container.
 *
 * @return {!(Map|number)}
 *      A dictionary keyed by node with the square clustering coefficient value.
 */
export async function squareClustering(G, optNodes) {
  var nodesIter = optNodes == null ? G : G.nbunchIter(optNodes);
  var clustering = new Map(); // eslint-disable-line no-shadow

  for (var v of nodesIter) {
    clustering.set(v, 0);
    var potential = 0;

    for (var [u, w] of genCombinations(G.get(v).keys(), 2)) {
      var squares =
        (new Set(G.get(u).keys())).intersection(new Set(G.get(w).keys()));
      squares.delete(v);
      squares = squares.size;

      clustering.set(v, clustering.get(v) + squares);
      var degm = squares + 1;
      if (G.get(u).has(w)) {
        degm += 1;
      }
      potential += (G.get(u).size - degm) * (G.get(w).size - degm) + squares;
    }
    if(potential > 0) {
      clustering.set(v, clustering.get(v) / potential);
    }
  }
  if (G.hasNode(optNodes)) {
    return next(clustering.values()); // return single value
  }
  return clustering;
}
