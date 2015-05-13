'use strict';

import {
  JSNetworkXException,
  JSNetworkXError
} from '../../exceptions';

import {
  Map,
  getDefault
} from '../../_internals';

/**
 * Compute the eigenvector centrality for `G`.
 *
 * Eigenvector centrality computes the centrality for a node based on the
 * centrality of its neighbors. The eigenvector centrality for node `i` is
 *
 * ```math
 * Ax = \lambda x
 * ```
 *
 * where `$A$` is the adjacency matrix of the graph `G` with eigenvalue
 * `$\lambda$`. By virtue of the Perron-Frobinus theorem, there is a unique and
 * positive solution if `$\lambda$` is the largest eigenvalue associated with
 * the eigenvector of the adjacency matrix `$A$`. ([2])
 *
 * ### Examples
 *
 * ```
 * var G = jsnx.pathGraph(4);
 * jsnx.eigenvectorCentrality(G);
 * // Map {0: 0.37, 1: 0.6, 2: 0.6, 3: 0.37}
 * ```
 *
 * ### Notes
 *
 * The measure was introduced by ([1][]).
 *
 * The eigenvector calculation is done by the power iteration method and has
 * no guarantee of convergence. The iteration will stop after `maxIter`
 * iterations or an error tolerance of `numberOfNodes(G) * tol` has been
 * reached.
 *
 * For directed graphs this is "left" eigenvector centrality which corresponds
 * to the in-edges in the graph. For out-edges eigenvector centrality
 * first reverse the graph with `G.reverse()`.
 *
 * ### References
 *
 * [1] [Phillip Bonacich:
 *     Power and Centrality: A Family of Measures.
 *     American Journal of Sociology 92(5):1170–1182, 1986](1)
 * [1]: http://www.leonidzhukov.net/hse/2014/socialnetworks/papers/Bonacich-Centrality.pdf
 * [2] Mark E. J. Newman:
 *     Networks: An Introduction.
 *     Oxford University Press, USA, 2010, pp. 169.
 *
 * @see pagerank
 * @see hits
 *
 * @param {Graph} G
 * @param {{maxIter: ?number, tolerance: ?number, nstart: ?Map, weight: ?string}} optParameters
 *   - maxIter: Maximum number of iterations in power method.
 *   - tolerance: Error tolerance used to check convergence in power method
 *     iteration.
 *   - nstart: Starting value of eigenvector iteration for each node.
 *   - weight: If not defined, all edge weights are considered equal. Otherwise
 *     holds the name of the edge attribute used as weight.
 * @return {Map} Map of nodes with eigenvector centrality as the value
 */
export async function eigenvectorCentrality(
  G,
  {maxIter=100, tolerance=1e-6, nstart, weight}={}
) {
  let sqrt = Math.sqrt;
  let pow = Math.pow;
  let abs = Math.abs;

  if (G.isMultigraph()) {
    throw new JSNetworkXException('Not defined for multigraphs.');
  }

  if (G.order() === 0) {
    throw new JSNetworkXException('Empty graph.');
  }

  let x;
  let zeroMap = new Map();
  if (!nstart) {
    // choose starting vector with entries of 1/#G
    let start = 1/G.order();
    x = new Map();
    for (let n of G) {
      x.set(n, start);
      zeroMap.set(n, 0);
    }
  } else {
    x = nstart;
    for (let n of x.keys()) {
      zeroMap.set(n, 0);
    }
  }

  // normalize starting vector
  let sum = 0;
  for (let v of x.values()) {
    sum += v;
  }
  sum = 1/sum;

  for (let [k, v] of x) {
    x.set(k, v * sum);
  }

  tolerance = G.order() * tolerance;
  // make up to maxIter iterations
  for (let i = 0; i < maxIter; i++) {
    let xlast = x;
    x = new Map(zeroMap);

    // do the multiplication y^T = x^T A
    for (let [n, v] of x) {
      for (let [nbr, data] of G.get(n)) {
        x.set(
          nbr,
          x.get(nbr) + xlast.get(n) * getDefault(weight && data[weight], 1)
        );
      }
    }

    // normalize vector
    let sum = 0;
    for (let v of x.values()) {
      sum += pow(v, 2);
    }
    sum = sqrt(sum);
    // this should never be zero?
    sum = sum === 0 ? 1 : 1/sum;

    let error = 0;
    for (let [n, v] of x) {
      v = v * sum;
      x.set(n, v);
      // check error convergence
      error += abs(v - xlast.get(n));
    }
    if (error < tolerance) {
      return x;
    }
  }

  throw new JSNetworkXError(
    `eigenvectorCentrality(): power iteration failed to converge in ` +
    `${maxIter} iterations.`
  );
}

// not ported:
// eigenvectorCentralityNumpy
