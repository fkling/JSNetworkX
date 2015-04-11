'use strict';

import JSNetworkXError from '../exceptions/JSNetworkXError';

import {isValidDegreeSequence} from '../algorithms/graphical';
import {emptyGraph} from './classic';
import sprintf from '../_internals/sprintf';


// TODO: configuration_model
// TODO: directed_configuration_model
// TODO: expected_degree_graph


/**
 * Return a simple graph with given degree sequence constructed
 * using the Havel-Hakimi algorithm.
 *
 * ### Notes
 *
 * The Havel-Hakimi algorithm constructs a simple graph by
 * successively connecting the node of highest degree to other nodes
 * of highest degree, resorting remaining nodes by degree, and
 * repeating the process. The resulting graph has a high
 * degree-associativity. Nodes are labeled `1,.., degreeSequence.length`,
 * corresponding to their position in `degreeSequence`.
 *
 * The basic algorithm is from Hakimi (1) and was generalized by
 * Kleitman and Wang (2).
 *
 * ### References
 *
 * [1] Hakimi S.,
 *   On Realizability of a Set of Integers as Degrees of the
 *   Vertices of a linear Graph. I,
 *   Journal of SIAM, 10(3), pp. 496-506 (1962)
 * [2] Kleitman D.J. and Wang D.L.
 *   Algorithms for Constructing Graphs and Digraphs with Given Valences and
 *   Factors,
 *   Discrete Mathematics, 6(1), pp. 79-88 (1973)
 *
 * @param {Iterable} degreeSequence list of integers
 *      Each integer corresponds to the degree of a node (need not be sorted).
 * @param {Graph} optCreateUsing
 *      Return graph of this type. The instance will be cleared.
 *      Directed graphs are not allowed.
 * @return {Graph}
 */
export async function havelHakimiGraph(degreeSequence, optCreateUsing) {
  degreeSequence = Array.from(degreeSequence);
  if (!(await isValidDegreeSequence(degreeSequence))) {
    throw new JSNetworkXError('Invalid degree sequence');
  }
  if (optCreateUsing != null) {
    if (optCreateUsing.isDirected()) {
      throw new JSNetworkXError('Directed Graph not supported');
    }
  }
  var numberOfNodes = degreeSequence.length;
  var G = emptyGraph(numberOfNodes, optCreateUsing);
  var numDegrees = new Array(numberOfNodes);
  for (var i = 0; i < numberOfNodes; i++) {
    numDegrees[i] = [];
  }

  var maxDegree = 0;
  var degreeSum = 0;
  var n = 0;

  for (i = 0; i < numberOfNodes; i++) {
    var degree = degreeSequence[i];
    // process only the non-zero integers
    if (degree > 0) {
      numDegrees[degree].push(n);
      maxDegree = Math.max(maxDegree, degree);
      degreeSum += degree;
      n += 1;
    }
  }

  // Return graph if no edges
  if (n === 0) {
    return G;
  }

  // form list of [stubs,name] for each node.
  var modstubs = new Array(maxDegree + 1);
  for (i = 0; i < maxDegree + 1; i++) {
    modstubs[i] = [0, 0];
  }
  // Successively reduce degree sequence by removing the maximum degree
  while (n > 0) {
    // Retrieve the maximum degree in the sequence
    while (numDegrees[maxDegree].length === 0) {
      maxDegree -= 1;
    }
    // If there are not enough stubs to connect to, then the sequence is not
    // graphical
    if (maxDegree > n - 1) {
      throw new JSNetworkXError('Non-graphical integer sequence');
    }
    // Remove largest stub in list
    var source = numDegrees[maxDegree].pop();
    n -= 1;
    // Reduce the next maxDegree largest stubs
    var mslen = 0;
    var k = maxDegree;
    for (i = 0; i < maxDegree; i++) {
      while (numDegrees[k].length === 0) {
        k -= 1;
      }
      var target = numDegrees[k].pop();
      G.addEdge(source, target);
      n -= 1;
      if (k > 1) {
        modstubs[mslen] = [k - 1, target];
        mslen += 1;
      }
    }
    // Add back to the list any nonzero stubs that were removed
    for (i = 0; i < mslen; i++) {
      var [stubval, stubtarget] = modstubs[i];
      numDegrees[stubval].push(stubtarget);
      n += 1;
    }
  }

  G.name = sprintf('havelHakimiGraph %s nodes %d edges', G.order(), G.size());
  return G;
}

// TODO: directed_havel_hakimi_graph
// TODO: degree_sequence_tree
// TODO: random_degree_sequence_graph
// TODO: DegreeSequenceRandomGraph
