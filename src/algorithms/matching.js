'use strict';

/**
 * @fileoverview
 * Maximal and maximum matching algorithms for undirected graphs.
 */

import {
/*jshint ignore:start*/
  Map,
  Set,
/*jshint ignore:end*/
  zipIterator,
  genRange,
} from '../_internals';

/**
 * Find a maximal cardinality matching in the graph.
 * A matching is a subset of edges in which no node occurs more than once.
 * The cardinality of a matching is the number of matched edges.
 *
 * ### Notes
 *
 * The algorithm greedily selects a maximal matching M of the graph G
 * (i.e. no superset of M exists). It runs in `O(|E|)` time.
 *
 * @param {Graph} G
 *   Undirected graph
 * @return {Set} matching
 *   A maximal matching of the graph.
 */
export function maximalMatching(G) {
  const matching = new Set();
  const vertices = new Set();
  for (let [u, v] of G.edgesIter()) {
    // If the edge isn't covered, add it to the matching
    // then remove neighborhood of u and v from consideration.
    if (!vertices.has(u) && !vertices.has(v)) {
      matching.add([u, v]);
      vertices.update([u, v]);
    }
  }
  return matching;
}

/**
 * Compute a maximum-weighted matching of G.
 * A matching is a subset of edges in which no node occurs more than once.
 * The cardinality of a matching is the number of matched edges.
 * The weight of a matching is the sum of the weights of its edges.
 *
 * ### Notes
 *
 * If G has edges with 'weight' attribute the edge data are used as
 * weight values else the weights are assumed to be 1.
 * This function takes time O(number_of_nodes ** 3).
 * If all edge weights are integers, the algorithm uses only integer
 * computations. If floating point weights are used, the algorithm
 * could return a slightly suboptimal matching due to numeric
 * precision errors.
 * This method is based on the "blossom" method for finding augmenting
 * paths and the "primal-dual" method for finding a matching of maximum
 * weight, both methods invented by Jack Edmonds [1]_.
 * Bipartite graphs can also be matched using the functions present in
 * :mod:`networkx.algorithms.bipartite.matching`.
 *
 * ### References
 *
 * [1] "Efficient Algorithms for Finding Maximum Matching in Graphs",
 *     Zvi Galil, ACM Computing Surveys, 1986.
 *
 * @param {Graph} G
 *   Undirected graph
 * @param {boolean=} maxcardinality (default=False)
 *    If maxcardinality is True, compute the maximum-cardinality matching
 *    with maximum weight among all maximum-cardinality matchings.
 * @param {string=} optWeight
 *    The edge attribute that holds the numerical value used
 *    as a weight. If null or not defined, then each edge has weight 1.
 * @return {Map} mate
 *    The matching is returned as a dictionary, mate, such that
 *    mate[v] == w if node v is matched to node w. Unmatched nodes do not
 *    occur as a key in mate.
 */
export function maxWeightMatching(G, maxcardinality=false, optWeight=undefined) {

  // give each node an id in range [0, G.order-1]
  const tr = new Map(zipIterator(G.nodesIter(), genRange(G.order( ))));
  const edges = new Map();

  if(!optWeight){
    for (let [u, v] of G.edgesIter()) edges.set([tr.get(u), tr.get(v)], 1);
  }
  else {
    // keep only max-weight edges for MultiGraph
    for (let [u, v, d] of G.edgesIter(true)) {
      const e = [tr.get(u), tr.get(v)];
      const w = d[optWeight] != null ? d[optWeight] : 1;
      if (!edges.has(e) || edges.get(e) < w) edges.set(e, w);
    }
  }

  // compute maximum matching
  const edgeslist = [for ([[u, v], w] of edges) [u, v, w]];
  const mate = weightedBlossomEdmonds(false, false, false)(edgeslist, maxcardinality);

  // translate ids back and return matching as a mapping
  const trb = new Map([for ([key, value] of tr) [value, key]]);
  return new Map( [for (i of genRange(mate.length)) if(mate[i] !== -1) [trb.get(i), trb.get(mate[i])]]);
}


// Adapted from http://jorisvr.nl/maximummatching.html
// All credit for the implementation goes to Joris van Rantwijk [http://jorisvr.nl].

// ** Original introduction below **

// Weighted maximum matching in general graphs.

// The algorithm is taken from "Efficient Algorithms for Finding Maximum
// Matching in Graphs" by Zvi Galil, ACM Computing Surveys, 1986.
// It is based on the "blossom" method for finding augmenting paths and
// the "primal-dual" method for finding a matching of maximum weight, both
// due to Jack Edmonds.
// Some ideas came from "Implementation of algorithms for maximum matching
// on non-bipartite graphs" by H.J. Gabow, Standford Ph.D. thesis, 1973.

// A C program for maximum weight matching by Ed Rothberg was used extensively
// to validate this new code.


export function weightedBlossomEdmonds(debug, CHECK_OPTIMUM, CHECK_DELTA) {

  // If assigned, DEBUG(str) is called with lots of debug messages.
  var DEBUG = debug ? function(s){ console.log('DEBUG:', s); } : null;

  // Check delta2/delta3 computation after every substage;
  // only works on integer weights, slows down the algorithm to O(n^4).
  if (CHECK_DELTA === undefined) CHECK_DELTA = false;

  // Check optimality of solution before returning; only works on integer weights.
  if (CHECK_OPTIMUM === undefined) CHECK_OPTIMUM = true;


  // Compatibility

  var assert = function (condition) {
    if (!condition) throw new Error('Assertion failed');
  };

  var min = function (a, i, j) {

    var o = a[i];

    while (--j > i) {
      if (a[j] < o) o = a[j];
    }

    return o;
  };

  var zip = function (a, fn) {
    var shortest = a[0].length < a[1].length ? a[0] : a[1];

    shortest.map(function (_, i) {
      if (fn.apply(null, a.map(function(array){ return array[i]; }))) return;
    });
  };

  // <end>


  /**
   *
   * Compute a maximum-weighted matching in the general undirected
   * weighted graph given by "edges".  If "maxcardinality" is true,
   * only maximum-cardinality matchings are considered as solutions.
   *
   * Edges is a sequence of tuples (i, j, wt) describing an undirected
   * edge between vertex i and vertex j with weight wt.  There is at most
   * one edge between any two vertices; no vertex has an edge to itthis.
   * Vertices are identified by consecutive, non-negative integers.
   *
   * Return a list "mate", such that mate[i] === j if vertex i is
   * matched to vertex j, and mate[i] === -1 if vertex i is not matched.
   *
   * This function takes time O(n ** 3)
   */

  var maxWeightMatching = function (edges, maxcardinality) {
    var i, j, k, p, w, len;

    if (maxcardinality === undefined) maxcardinality = false;

    //
    // Vertices are numbered 0 .. (nvertex-1).
    // Non-trivial blossoms are numbered nvertex .. (2*nvertex-1)
    //
    // Edges are numbered 0 .. (nedge-1).
    // Edge endpoints are numbered 0 .. (2*nedge-1), such that endpoints
    // (2*k) and (2*k+1) both belong to edge k.
    //
    // Many terms used in the comments (sub-blossom, T-vertex) come from
    // the paper by Galil; read the paper before reading this code.
    //


    // Deal swiftly with empty graphs.
    if (!edges.length) return [];

    // Count vertices + find the maximum edge weight.
    var nedge = edges.length;
    var nvertex = 0;
    var maxweight = 0;

    len = nedge;
    while (len--) {
      i = edges[len][0];
      j = edges[len][1];
      w = edges[len][2];

      assert(i >= 0 && j >= 0 && i !== j);
      if (i >= nvertex) nvertex = i + 1;
      if (j >= nvertex) nvertex = j + 1;

      maxweight = Math.max(maxweight, w);
    }

    // If p is an edge endpoint,
    // endpoint[p] is the vertex to which endpoint p is attached.
    // Not modified by the algorithm.
    p = 2 * nedge;
    var endpoint = new Array(p);
    while (p--) endpoint[p] = edges[Math.floor(p / 2)][p % 2];

    // If v is a vertex,
    // neighbend[v] is the list of remote endpoints of the edges attached to v.
    // Not modified by the algorithm.
    i = nvertex;
    var neighbend = new Array(i);
    while (i--) neighbend[i] = [];

    for (k = 0; k < nedge; ++k) {
      i = edges[k][0];
      j = edges[k][1];
      neighbend[i].push(2 * k + 1);
      neighbend[j].push(2 * k);
    }

    // If v is a vertex,
    // mate[v] is the remote endpoint of its matched edge, or -1 if it is single
    // (i.e. endpoint[mate[v]] is v's partner vertex).
    // Initially all vertices are single; updated during augmentation.
    i = nvertex;
    var mate = new Array(i);
    while (i--) mate[i] = -1;

    // If b is a top-level blossom,
    // label[b] is 0 if b is unlabeled (free);
    //             1 if b is an S-vertex/blossom;
    //             2 if b is a T-vertex/blossom.
    // The label of a vertex is found by looking at the label of its
    // top-level containing blossom.
    // If v is a vertex inside a T-blossom,
    // label[v] is 2 iff v is reachable from an S-vertex outside the blossom.
    // Labels are assigned during a stage and reset after each augmentation.
    i = 2 * nvertex;
    var label = new Array(i);
    while (i--) label[i] = 0;

    // If b is a labeled top-level blossom,
    // labelend[b] is the remote endpoint of the edge through which b obtained
    // its label, or -1 if b's base vertex is single.
    // If v is a vertex inside a T-blossom and label[v] === 2,
    // labelend[v] is the remote endpoint of the edge through which v is
    // reachable from outside the blossom.
    i = 2 * nvertex;
    var labelend = new Array(i);
    while (i--) labelend[i] = -1;

    // If v is a vertex,
    // inblossom[v] is the top-level blossom to which v belongs.
    // If v is a top-level vertex, v is itthis a blossom (a trivial blossom)
    // and inblossom[v] === v.
    // Initially all vertices are top-level trivial blossoms.
    i = nvertex;
    var inblossom = new Array(i);
    while (i--) inblossom[i] = i;

    // If b is a sub-blossom,
    // blossomparent[b] is its immediate parent (sub-)blossom.
    // If b is a top-level blossom, blossomparent[b] is -1.
    i = 2 * nvertex;
    var blossomparent = new Array(i);
    while (i--) blossomparent[i] = -1;

    // If b is a non-trivial (sub-)blossom,
    // blossomchilds[b] is an ordered list of its sub-blossoms, starting with
    // the base and going round the blossom.
    i = 2 * nvertex;
    var blossomchilds = new Array(i);
    while (i--) blossomchilds[i] = null;

    // If b is a (sub-)blossom,
    // blossombase[b] is its base VERTEX (i.e. recursive sub-blossom).
    len = 2 * nvertex;
    var blossombase = new Array(len);
    for(i = 0; i < nvertex; ++i) blossombase[i] = i;
    for(; i < len; ++i) blossombase[i] = -1;

    // If b is a non-trivial (sub-)blossom,
    // blossomendps[b] is a list of endpoints on its connecting edges,
    // such that blossomendps[b][i] is the local endpoint of blossomchilds[b][i]
    // on the edge that connects it to blossomchilds[b][wrap(i+1)].
    i = 2 * nvertex;
    var blossomendps = new Array(i);
    while (i--) blossomendps[i] = null;

    // If v is a free vertex (or an unreached vertex inside a T-blossom),
    // bestedge[v] is the edge to an S-vertex with least slack,
    // or -1 if there is no such edge.
    // If b is a (possibly trivial) top-level S-blossom,
    // bestedge[b] is the least-slack edge to a different S-blossom,
    // or -1 if there is no such edge.
    // This is used for efficient computation of delta2 and delta3.
    i = 2 * nvertex;
    var bestedge = new Array(i);
    while (i--) bestedge[i] = -1;

    // If b is a non-trivial top-level S-blossom,
    // blossombestedges[b] is a list of least-slack edges to neighbouring
    // S-blossoms, or null if no such list has been computed yet.
    // This is used for efficient computation of delta3.
    i = 2 * nvertex;
    var blossombestedges = new Array(i);
    while (i--) blossombestedges[i] = null;

    // List of currently unused blossom numbers.
    i = nvertex;
    var unusedblossoms = new Array(i);
    while (i--) unusedblossoms[i] = nvertex + i;

    // If v is a vertex,
    // dualvar[v] = 2 * u(v) where u(v) is the v's variable in the dual
    // optimization problem (multiplication by two ensures integer values
    // throughout the algorithm if all edge weights are integers).
    // If b is a non-trivial blossom,
    // dualvar[b] = z(b) where z(b) is b's variable in the dual optimization
    // problem.
    len = 2 * nvertex;
    var dualvar = new Array(len);
    for(i = 0; i < nvertex; ++i) dualvar[i] = maxweight;
    for(; i < len; ++i) dualvar[i] = 0;

    // If allowedge[k] is true, edge k has zero slack in the optimization
    // problem; if allowedge[k] is false, the edge's slack may or may not
    // be zero.
    i = nedge;
    var allowedge = new Array(i);
    while (i--) allowedge[i] = false;

    // Queue of newly discovered S-vertices.
    var queue = [];

    // Return 2 * slack of edge k (does not work inside blossoms).
    var slack = function (k) {
      var i = edges[k][0];
      var j = edges[k][1];
      var wt = edges[k][2];
      return dualvar[i] + dualvar[j] - 2 * wt;
    };

    // Generate the leaf vertices of a blossom.
    var blossomLeaves = function (b, fn) {
      if (b < nvertex){
        if(fn(b)) return true;
      }
      else {
        var len, i, t;
        len = blossomchilds[b].length;
        for(i = 0; i < len; ++i){
          t = blossomchilds[b][i];
          if (t < nvertex) {
            if (fn(t)) return true;
          }
          else {
            if (blossomLeaves(t, fn)) return true;
          }
        }
      }
    };

    // Assign label t to the top-level blossom containing vertex w
    // and record the fact that w was reached through the edge with
    // remote endpoint p.
    var assignLabel = function (w, t, p) {
      if (DEBUG) DEBUG('assignLabel(' + w + ',' + t + ',' + p + ')');
      var b = inblossom[w], e;
      assert(label[w] === 0 && label[b] === 0);
      label[w] = label[b] = t;
      labelend[w] = labelend[b] = p;
      bestedge[w] = bestedge[b] = -1;
      if (t === 1){
        // b became an S-vertex/blossom; add it(s vertices) to the queue.
        blossomLeaves(b, function(e){ queue.push(e); });
        if (DEBUG) DEBUG('PUSH ' + queue);
      }
      else if (t === 2){
        // b became a T-vertex/blossom; assign label S to its mate.
        // (If b is a non-trivial blossom, its base is the only vertex
        // with an external mate.)
        var base = blossombase[b];
        assert(mate[base] >= 0);
        assignLabel(endpoint[mate[base]], 1, mate[base] ^ 1);
      }

    };

    // Trace back from vertices v and w to discover either a new blossom
    // or an augmenting path. Return the base vertex of the new blossom or -1.
    var scanBlossom = function (v, w) {
      if (DEBUG) DEBUG('scanBlossom(' + v + ',' + w + ')');
      // Trace back from v and w, placing breadcrumbs as we go.
      var b, tmp, i;
      var path = [];
      var base = -1;
      while (v !== -1 || w !== -1) {
        // Look for a breadcrumb in v's blossom or put a new breadcrumb.
        b = inblossom[v];
        if (label[b] & 4) {
          base = blossombase[b];
          break;
        }
        assert(label[b] === 1);
        path.push(b);
        label[b] = 5;
        // Trace one step back.
        assert(labelend[b] === mate[blossombase[b]]);
        if (labelend[b] === -1) {
          // The base of blossom b is single; stop tracing this path.
          v = -1;
        }
        else {
          v = endpoint[labelend[b]];
          b = inblossom[v];
          assert(label[b] === 2);
          // b is a T-blossom; trace one more step back.
          assert(labelend[b] >= 0);
          v = endpoint[labelend[b]];
        }
        // Swap v and w so that we alternate between both paths.
        if (w !== -1) {
          tmp = v;
          v = w;
          w = tmp;
        }
      }

      // Remove breadcrumbs.
      i = path.length;
      while (i--) {
        b = path[i];
        label[b] = 1;
      }

      // Return base vertex, if we found one.
      return base;
    };

    // Construct a new blossom with given base, containing edge k which
    // connects a pair of S vertices. Label the new blossom as S; set its dual
    // variable to zero; relabel its T-vertices to S and add them to the queue.
    var addBlossom = function(base, k) {
      var i, j, len, tmp, x, y, z, m, n, nblist, nblists, bestedgeto;
      var v = edges[k][0];
      var w = edges[k][1];
      var wt = edges[k][2];
      var bb = inblossom[base];
      var bv = inblossom[v];
      var bw = inblossom[w];
      // Create blossom.
      var b = unusedblossoms.pop();
      if (DEBUG) DEBUG('addBlossom(' + base + ',' + k + ') (v=' + v + ' w=' + w + ') -> ' + b);
      blossombase[b] = base;
      blossomparent[b] = -1;
      blossomparent[bb] = b;
      // Make list of sub-blossoms and their interconnecting edge endpoints.
      var path = blossomchilds[b] = [];
      var endps = blossomendps[b] = [];
      // Trace back from v to base.
      while (bv !== bb) {
        // Add bv to the new blossom.
        blossomparent[bv] = b;
        path.push(bv);
        endps.push(labelend[bv]);
        assert((label[bv] === 2 || (label[bv] === 1 && labelend[bv] === mate[blossombase[bv]])));
        // Trace one step back.
        assert(labelend[bv] >= 0);
        v = endpoint[labelend[bv]];
        bv = inblossom[v];
      }
      // Reverse lists, add endpoint that connects the pair of S vertices.
      path.push(bb);
      path.reverse();
      endps.reverse();
      endps.push(2*k);
      // Trace back from w to base.
      while (bw !== bb) {
        // Add bw to the new blossom.
        blossomparent[bw] = b;
        path.push(bw);
        endps.push(labelend[bw] ^ 1);
        assert((label[bw] === 2 || (label[bw] === 1 && labelend[bw] === mate[blossombase[bw]])));
        // Trace one step back.
        assert(labelend[bw] >= 0);
        w = endpoint[labelend[bw]];
        bw = inblossom[w];
      }
      // Set label to S.
      assert(label[bb] === 1);
      label[b] = 1;
      labelend[b] = labelend[bb];
      // Set dual variable to zero.
      dualvar[b] = 0;
      // Relabel vertices.
      blossomLeaves(b, function(v) {
        if (label[inblossom[v]] === 2) {
          // This T-vertex now turns into an S-vertex because it becomes
          // part of an S-blossom; add it to the queue.
          queue.push(v);
        }
        inblossom[v] = b;
      });

      // Compute blossombestedges[b].

      z = 2 * nvertex;
      bestedgeto = new Array(z);
      while (z--) bestedgeto[z] = -1;

      len = path.length;
      for (z = 0; z < len; ++z) {
        bv = path[z];

        if (blossombestedges[bv] === null){
          // This subblossom does not have a list of least-slack edges;
          // get the information from the vertices.
          nblists = [];
          blossomLeaves(bv, function(v){
            j = neighbend[v].length;
            tmp = new Array(j);
            while (j--) {
              var p = neighbend[v][j];
              tmp[j] = Math.floor(p/2);
            }
            nblists.push(tmp);
          });
        }
        else {
          // Walk this subblossom's least-slack edges.
          nblists = [ blossombestedges[bv] ];
        }

        for (x = 0, m = nblists.length; x < m; ++x) {
          nblist = nblists[x];

          for (y = 0, n = nblist.length; y < n; ++y) {
            k = nblist[y];

            i = edges[k][0];
            j = edges[k][1];
            wt = edges[k][2];

            if (inblossom[j] === b) {
              tmp = i;
              i = j;
              j = tmp;
            }

            var bj = inblossom[j];

            if (bj !== b && label[bj] === 1 &&
              (bestedgeto[bj] === -1 || slack(k) < slack(bestedgeto[bj]))) {
              bestedgeto[bj] = k;
            }
          }
        }
        // Forget about least-slack edges of the subblossom.
        blossombestedges[bv] = null;
        bestedge[bv] = -1;
      }


      blossombestedges[b] = [];
      len = bestedgeto.length;
      for (i = 0; i < len; ++i) {
        k = bestedgeto[i];
        if (k !== -1) blossombestedges[b].push(k);
      }


      // Select bestedge[b].

      len = blossombestedges[b].length;
      if(len > 0) {
        bestedge[b] = blossombestedges[b][0];
        for (i = 1; i < len; ++i) {
          k = blossombestedges[b][i];
          if (slack(k) < slack(bestedge[b])) {
            bestedge[b] = k;
          }
        }
      }
      else bestedge[b] = -1;

      if (DEBUG) DEBUG('blossomchilds[' + b + ']=' + blossomchilds[b]);
    };

    // Expand the given top-level blossom.
    var expandBlossom = function(b, endstage) {
      if (DEBUG) DEBUG('expandBlossom(' + b + ',' + endstage + ') ' + blossomchilds[b]);
      // Convert sub-blossoms into top-level blossoms.
      var i, j, len, s, p, entrychild, jstep, endptrick, bv, stop, base;

      for (i = 0; i < blossomchilds[b].length; ++i) {
        s = blossomchilds[b][i];

        blossomparent[s] = -1;
        if (s < nvertex) inblossom[s] = s;
        else if (endstage && dualvar[s] === 0) {
          // Recursively expand this sub-blossom.
          expandBlossom(s, endstage);
        }
        else {
          blossomLeaves(s, function(v) {
            inblossom[v] = s;
          });
        }
      }
      // If we expand a T-blossom during a stage, its sub-blossoms must be
      // relabeled.
      if (!endstage && label[b] === 2) {
        // Start at the sub-blossom through which the expanding
        // blossom obtained its label, and relabel sub-blossoms untili
        // we reach the base.
        // Figure out through which sub-blossom the expanding blossom
        // obtained its label initially.
        assert(labelend[b] >= 0);
        entrychild = inblossom[endpoint[labelend[b] ^ 1]];
        // Decide in which direction we will go round the blossom.
        j = blossomchilds[b].indexOf(entrychild);
        if (j & 1) {
          // Start index is odd; go forward.
          jstep = 1;
          endptrick = 0;
          stop = blossomchilds[b].length;
          base = 0;
        }
        else {
          // Start index is even; go backward.
          jstep = -1;
          endptrick = 1;
          stop = 0;
          base = blossomchilds[b].length;
        }
        // Move along the blossom until we get to the base.
        p = labelend[b];
        while (j !== stop) {
          // Relabel the T-sub-blossom.
          label[endpoint[p ^ 1]] = 0;
          label[endpoint[blossomendps[b][j-endptrick]^endptrick^1]] = 0;
          assignLabel(endpoint[p ^ 1], 2, p);
          // Step to the next S-sub-blossom and note its forward endpoint.
          allowedge[Math.floor(blossomendps[b][j-endptrick]/2)] = true;
          j += jstep;
          p = blossomendps[b][j-endptrick] ^ endptrick;
          // Step to the next T-sub-blossom.
          allowedge[Math.floor(p/2)] = true;
          j += jstep;
        }
        // Relabel the base T-sub-blossom WITHOUT stepping through to
        // its mate (so don't call assignLabel).
        bv = blossomchilds[b][0];
        label[endpoint[p ^ 1]] = label[bv] = 2;
        labelend[endpoint[p ^ 1]] = labelend[bv] = p;
        bestedge[bv] = -1;
        // Continue along the blossom until we get back to entrychild.
        j = base + jstep;
        while (blossomchilds[b][j] !== entrychild) {
          // Examine the vertices of the sub-blossom to see whether
          // it is reachable from a neighbouring S-vertex outside the
          // expanding blossom.
          bv = blossomchilds[b][j];
          if (label[bv] === 1) {
            // This sub-blossom just got label S through one of its
            // neighbours; leave it.
            j += jstep;
            continue;
          }
          blossomLeaves(bv, function(v){
            if (label[v] !== 0) {
              // If the sub-blossom contains a reachable vertex, assign
              // label T to the sub-blossom.
              assert(label[v] === 2);
              assert(inblossom[v] === bv);
              label[v] = 0;
              label[endpoint[mate[blossombase[bv]]]] = 0;
              assignLabel(v, 2, labelend[v]);
              return true;
            }
          });

          j += jstep;
        }
      }
      // Recycle the blossom number.
      label[b] = labelend[b] = -1;
      blossomchilds[b] = blossomendps[b] = null;
      blossombase[b] = -1;
      blossombestedges[b] = null;
      bestedge[b] = -1;
      unusedblossoms.push(b);
    };

    var rotate = function (a, n) {
      var head = a.splice(0, n);
      for (var i = 0; i < n; ++i) {
        a.push(head[i]);
      }
    };

    // Swap matched/unmatched edges over an alternating path through blossom b
    // between vertex v and the base vertex. Keep blossom bookkeeping consistent.
    var augmentBlossom = function(b, v){
      if (DEBUG) DEBUG('augmentBlossom(' + b + ',' + v + ')');
      // Bubble up through the blossom tree from vertex v to an immediate
      // sub-blossom of b.
      var i, j, t, jstep, endptrick, stop, len, p;
      t = v;
      while (blossomparent[t] !== b)
        t = blossomparent[t];
      // Recursively deal with the first sub-blossom.
      if (t >= nvertex)
        augmentBlossom(t, v);
      // Decide in which direction we will go round the blossom.
      i = j = blossomchilds[b].indexOf(t);
      len = blossomchilds[b].length;
      if (i & 1) {
        // Start index is odd; go forward.
        jstep = 1;
        endptrick = 0;
        stop = len;
      }
      else {
        // Start index is even; go backward.
        jstep = -1;
        endptrick = 1;
        stop = 0;
      }
      // Move along the blossom until we get to the base.
      while (j !== stop) {
        // Step to the next sub-blossom and augment it recursively.
        j += jstep;
        t = blossomchilds[b][j];
        p = blossomendps[b][j-endptrick] ^ endptrick;
        if (t >= nvertex)
          augmentBlossom(t, endpoint[p]);
        // Step to the next sub-blossom and augment it recursively.
        j += jstep;
        t = blossomchilds[b][Math.abs(j % len)];
        if (t >= nvertex)
          augmentBlossom(t, endpoint[p ^ 1]);
        // Match the edge connecting those sub-blossoms.
        mate[endpoint[p]] = p ^ 1;
        mate[endpoint[p ^ 1]] = p;
        if (DEBUG) DEBUG('PAIR ' + endpoint[p] + ' ' + endpoint[p^1] + ' (k=' + Math.floor(p/2) + ')');
      }
      // Rotate the list of sub-blossoms to put the new base at the front.
      rotate(blossomchilds[b], i);
      rotate(blossomendps[b], i);
      blossombase[b] = blossombase[blossomchilds[b][0]];
      assert(blossombase[b] === v);
    };

    // Swap matched/unmatched edges over an alternating path between two
    // single vertices. The augmenting path runs through edge k, which
    // connects a pair of S vertices.
    var augmentMatching = function(k) {

      var bs, t, bt, j;

      var v = edges[k][0];
      var w = edges[k][1];
      var wt = edges[k][2];

      if (DEBUG) DEBUG('augmentMatching(' + k + ') (v=' + v + ' w=' + w + ')');
      if (DEBUG) DEBUG('PAIR ' + v + ' ' + w + ' (k=' + k + ')');

      [[v, 2 * k + 1], [w, 2 * k]].forEach(function(e){
        var s = e[0];
        var p = e[1];
        // Match vertex s to remote endpoint p. Then trace back from s
        // until we find a single vertex, swapping matched and unmatched
        // edges as we go.
        while (true) {
          bs = inblossom[s];
          assert(label[bs] === 1);
          assert(labelend[bs] === mate[blossombase[bs]]);
          // Augment through the S-blossom from s to base.
          if (bs >= nvertex)
            augmentBlossom(bs, s);
          // Update mate[s]
          mate[s] = p;
          // Trace one step back.
          if (labelend[bs] === -1) {
            // Reached single vertex; stop.
            break;
          }
          t = endpoint[labelend[bs]];
          bt = inblossom[t];
          assert(label[bt] === 2);
          // Trace one step back.
          assert(labelend[bt] >= 0);
          s = endpoint[labelend[bt]];
          j = endpoint[labelend[bt] ^ 1];
          // Augment through the T-blossom from j to base.
          assert(blossombase[bt] === t);
          if (bt >= nvertex)
            augmentBlossom(bt, j);
          // Update mate[j]
          mate[j] = labelend[bt];
          // Keep the opposite endpoint;
          // it will be assigned to mate[s] in the next step.
          p = labelend[bt] ^ 1;
          if (DEBUG) DEBUG('PAIR ' + s + ' ' + t + ' (k=' + Math.floor(p/2) + ')');
        }
      });
    };


    // Verify that the optimum solution has been reached.
    var verifyOptimum = function() {
      var i, j, wt, v, b, p, k, s, vdualoffset, iblossoms, jblossoms;
      if (maxcardinality) {
        // Vertices may have negative dual;
        // find a constant non-negative number to add to all vertex duals.
        vdualoffset = Math.max(0, -min(dualvar, 0, nvertex));
      }
      else vdualoffset = 0;
      // 0. all dual variables are non-negative
      assert(min(dualvar, 0, nvertex) + vdualoffset >= 0);
      assert(min(dualvar, nvertex, 2 * nvertex) >= 0);
      // 0. all edges have non-negative slack and
      // 1. all matched edges have zero slack;
      for (k = 0; k < nedge; ++k) {
        i = edges[k][0];
        j = edges[k][1];
        wt = edges[k][2];

        s = dualvar[i] + dualvar[j] - 2 * wt;
        iblossoms = [i];
        jblossoms = [j];
        while (blossomparent[iblossoms[iblossoms.length - 1]] !== -1)
          iblossoms.push(blossomparent[iblossoms[iblossoms.length - 1]]);
        while (blossomparent[jblossoms[jblossoms.length - 1]] !== -1)
          jblossoms.push(blossomparent[jblossoms[jblossoms.length - 1]]);
        iblossoms.reverse();
        jblossoms.reverse();
        zip([iblossoms, jblossoms], function(bi, bj){
          if (bi !== bj) return true;
          s += 2 * dualvar[bi];
        });
        assert(s >= 0);
        if (Math.floor(mate[i] / 2) === k || Math.floor(mate[j] / 2) === k) {
          assert(Math.floor(mate[i] / 2) === k && Math.floor(mate[j] / 2) === k);
          assert(s === 0);
        }
      }
      // 2. all single vertices have zero dual value;
      for (v = 0; v < nvertex; ++v)
        assert(mate[v] >= 0 || dualvar[v] + vdualoffset === 0);
      // 3. all blossoms with positive dual value are full.
      for (b = nvertex; b < 2 * nvertex; ++b) {
        if (blossombase[b] >= 0 && dualvar[b] > 0) {
          assert(blossomendps[b].length % 2 === 1);
          for (i = 1; i < blossomendps[b].length; i += 2) {
            p = blossomendps[b][i];
            assert(mate[endpoint[p]] === p ^ 1);
            assert(mate[endpoint[p ^ 1]] === p);
          }
        }
      }
      // Ok.
    };

    // Check optimized delta2 against a trivial computation.
    var checkDelta2 = function(){
      for (var v = 0; v < nvertex; ++v) {
        if (label[inblossom[v]] === 0) {
          var bd = null;
          var bk = -1;
          for (var i = 0; i < neighbend[v].length; ++i) {
            var p = neighbend[v][i];
            var k = Math.floor(p / 2);
            var w = endpoint[p];
            if (label[inblossom[w]] === 1) {
              var d = slack(k);
              if (bk === -1 || d < bd) {
                bk = k;
                bd = d;
              }
            }
          }
          if (DEBUG && (bestedge[v] !== -1 || bk !== -1) &&
            (bestedge[v] === -1 || bd !== slack(bestedge[v]))) {
            DEBUG(
              'v=' + v +
              ' bk=' + bk +
              ' bd=' + bd +
              ' bestedge=' + bestedge[v] +
              ' slack=' + slack(bestedge[v])
            );
          }
          assert((bk === -1 && bestedge[v] === -1) || (bestedge[v] !== -1 && bd === slack(bestedge[v])));
        }
      }
    };

    // Check optimized delta3 against a trivial computation.
    var checkDelta3 = function() {
      var bk = -1;
      var bd = null;
      var tbk = -1;
      var tbd = null;
      for (var b = 0; b < 2 * nvertex; ++b) {
        if (blossomparent[b] === -1 && label[b] === 1) {
          blossomLeaves(b, function(v){

            for (var x = 0; x < neighbend[v].length; ++x) {
              var p = neighbend[v][x];
              var k = Math.floor(p / 2);
              var w = endpoint[p];
              if (inblossom[w] !== b && label[inblossom[w]] === 1) {
                var d = slack(k);
                if (bk === -1 || d < bd) {
                  bk = k;
                  bd = d;
                }
              }
            }

          });

          if (bestedge[b] !== -1) {
            var i = edges[bestedge[b]][0];
            var j = edges[bestedge[b]][1];
            var wt = edges[bestedge[b]][2];

            assert(inblossom[i] === b || inblossom[j] === b);
            assert(inblossom[i] !== b || inblossom[j] !== b);
            assert(label[inblossom[i]] === 1 && label[inblossom[j]] === 1);
            if (tbk === -1 || slack(bestedge[b]) < tbd) {
              tbk = bestedge[b];
              tbd = slack(bestedge[b]);
            }
          }
        }
      }
      if (DEBUG && bd !== tbd)
        DEBUG('bk=' + bk + ' tbk=' + tbk + ' bd=' + bd + ' tbd=' + tbd);
      assert(bd === tbd);
    };

    var b, d, t, v, augmented, kslack, base, deltatype, delta, deltaedge, deltablossom, wt, tmp;

    // Main loop: continue until no further improvement is possible.
    for (t = 0; t < nvertex; ++t) {

      // Each iteration of this loop is a "stage".
      // A stage finds an augmenting path and uses that to improve
      // the matching.
      if (DEBUG) DEBUG('STAGE ' + t);

      // Remove labels from top-level blossoms/vertices.
      i = 2 * nvertex;
      while (i--) label[i] = 0;

      // Forget all about least-slack edges.
      i = 2 * nvertex;
      while (i--) bestedge[i] = -1;
      i = nvertex;
      while (i--) blossombestedges[nvertex + i] = null;

      // Loss of labeling means that we can not be sure that currently
      // allowable edges remain allowable througout this stage.
      i = nedge;
      while (i--) allowedge[i] = false;

      // Make queue empty.
      queue = [];

      // Label single blossoms/vertices with S and put them in the queue.
      for (v = 0; v < nvertex; ++v) {
        if (mate[v] === -1 && label[inblossom[v]] === 0)
          assignLabel(v, 1, -1);
      }

      // Loop until we succeed in augmenting the matching.
      augmented = 0;
      while (true) {

        // Each iteration of this loop is a "substage".
        // A substage tries to find an augmenting path;
        // if found, the path is used to improve the matching and
        // the stage ends. If there is no augmenting path, the
        // primal-dual method is used to pump some slack out of
        // the dual variables.
        if (DEBUG) DEBUG('SUBSTAGE');

        // Continue labeling until all vertices which are reachable
        // through an alternating path have got a label.
        while (queue.length && !augmented) {

          // Take an S vertex from the queue.
          v = queue.pop();
          if (DEBUG) DEBUG('POP v=' + v);
          assert(label[inblossom[v]] === 1);

          // Scan its neighbours:
          len = neighbend[v].length;
          for (i = 0; i < len; ++i) {
            p = neighbend[v][i];
            k = Math.floor(p / 2);
            w = endpoint[p];
            // w is a neighbour to v
            if (inblossom[v] === inblossom[w]) {
              // this edge is internal to a blossom; ignore it
              continue;
            }
            if (!allowedge[k]) {
              kslack = slack(k);
              if (kslack <= 0) {
                // edge k has zero slack => it is allowable
                allowedge[k] = true;
              }
            }
            if (allowedge[k]) {
              if (label[inblossom[w]] === 0) {
                // (C1) w is a free vertex;
                // label w with T and label its mate with S (R12).
                assignLabel(w, 2, p ^ 1);
              }
              else if (label[inblossom[w]] === 1) {
                // (C2) w is an S-vertex (not in the same blossom);
                // follow back-links to discover either an
                // augmenting path or a new blossom.
                base = scanBlossom(v, w);
                if (base >= 0) {
                  // Found a new blossom; add it to the blossom
                  // bookkeeping and turn it into an S-blossom.
                  addBlossom(base, k);
                }
                else {
                  // Found an augmenting path; augment the
                  // matching and end this stage.
                  augmentMatching(k);
                  augmented = 1;
                  break;
                }
              }
              else if (label[w] === 0) {
                // w is inside a T-blossom, but w itthis has not
                // yet been reached from outside the blossom;
                // mark it as reached (we need this to relabel
                // during T-blossom expansion).
                assert(label[inblossom[w]] === 2);
                label[w] = 2;
                labelend[w] = p ^ 1;
              }
            }
            else if (label[inblossom[w]] === 1) {
              // keep track of the least-slack non-allowable edge to
              // a different S-blossom.
              b = inblossom[v];
              if (bestedge[b] === -1 || kslack < slack(bestedge[b]))
                bestedge[b] = k;
            }
            else if (label[w] === 0) {
              // w is a free vertex (or an unreached vertex inside
              // a T-blossom) but we can not reach it yet;
              // keep track of the least-slack edge that reaches w.
              if (bestedge[w] === -1 || kslack < slack(bestedge[w]))
                bestedge[w] = k;
            }
          }
        }

        if (augmented) break;

        // There is no augmenting path under these constraints;
        // compute delta and reduce slack in the optimization problem.
        // (Note that our vertex dual variables, edge slacks and delta's
        // are pre-multiplied by two.)
        deltatype = -1;
        delta = deltaedge = deltablossom = null;

        // Verify data structures for delta2/delta3 computation.
        if (CHECK_DELTA) {
          checkDelta2();
          checkDelta3();
        }

        // Compute delta1: the minumum value of any vertex dual.
        if (!maxcardinality) {
          deltatype = 1;
          delta = min(dualvar, 0, nvertex);
        }

        // Compute delta2: the minimum slack on any edge between
        // an S-vertex and a free vertex.
        for (v = 0; v < nvertex; ++v) {
          if (label[inblossom[v]] === 0 && bestedge[v] !== -1) {
            d = slack(bestedge[v]);
            if (deltatype === -1 || d < delta) {
              delta = d;
              deltatype = 2;
              deltaedge = bestedge[v];
            }
          }
        }

        // Compute delta3: half the minimum slack on any edge between
        // a pair of S-blossoms.
        for (b = 0; b < 2 * nvertex; ++b) {
          if ( blossomparent[b] === -1 && label[b] === 1 && bestedge[b] !== -1 ) {
            kslack = slack(bestedge[b]);
            d = kslack / 2;
            if (deltatype === -1 || d < delta) {
              delta = d;
              deltatype = 3;
              deltaedge = bestedge[b];
            }
          }
        }

        // Compute delta4: minimum z variable of any T-blossom.
        for (b = nvertex; b < 2 * nvertex; ++b) {
          if ( blossombase[b] >= 0 && blossomparent[b] === -1 && label[b] === 2 &&
            (deltatype === -1 || dualvar[b] < delta) ) {
            delta = dualvar[b];
            deltatype = 4;
            deltablossom = b;
          }
        }

        if (deltatype === -1) {
          // No further improvement possible; max-cardinality optimum
          // reached. Do a final delta update to make the optimum
          // verifyable.
          assert(maxcardinality);
          deltatype = 1;
          delta = Math.max(0, min(dualvar, 0, nvertex));
        }

        // Update dual variables according to delta.
        for (v = 0; v < nvertex; ++v) {
          if (label[inblossom[v]] === 1) {
            // S-vertex: 2*u = 2*u - 2*delta
            dualvar[v] -= delta;
          }
          else if (label[inblossom[v]] === 2) {
            // T-vertex: 2*u = 2*u + 2*delta
            dualvar[v] += delta;
          }
        }
        for (b = nvertex; b < 2 * nvertex; ++b) {
          if (blossombase[b] >= 0 && blossomparent[b] === -1){
            if (label[b] === 1) {
              // top-level S-blossom: z = z + 2*delta
              dualvar[b] += delta;
            }
            else if (label[b] === 2){
              // top-level T-blossom: z = z - 2*delta
              dualvar[b] -= delta;
            }
          }
        }

        // Take action at the point where minimum delta occurred.
        if (DEBUG) DEBUG('delta' + deltatype + '=' + delta);
        if (deltatype === 1) {
          // No further improvement possible; optimum reached.
          break;
        }
        else if (deltatype === 2) {
          // Use the least-slack edge to continue the search.
          allowedge[deltaedge] = true;
          i  = edges[deltaedge][0];
          j  = edges[deltaedge][1];
          wt = edges[deltaedge][2];
          if (label[inblossom[i]] === 0){
            tmp = i;
            i = j;
            j = tmp;
          }
          assert(label[inblossom[i]] === 1);
          queue.push(i);
        }
        else if (deltatype === 3) {
          // Use the least-slack edge to continue the search.
          allowedge[deltaedge] = true;
          i  = edges[deltaedge][0];
          j  = edges[deltaedge][1];
          wt = edges[deltaedge][2];
          assert(label[inblossom[i]] === 1);
          queue.push(i);
        }
        else if (deltatype === 4) {
          // Expand the least-z blossom.
          expandBlossom(deltablossom, false);
        }
      }

        // End of a this substage.

      // Stop when no more augmenting path can be found.
      if (!augmented) break;

      // End of a stage; expand all S-blossoms which have dualvar = 0.
      for (b = nvertex; b < 2 * nvertex; ++b) {
        if ( blossomparent[b] === -1 && blossombase[b] >= 0 &&
          label[b] === 1 && dualvar[b] === 0 ) {
          expandBlossom(b, true);
        }
      }
    }

    // Verify that we reached the optimum solution.
    if (CHECK_OPTIMUM) verifyOptimum();

    // Transform mate[] such that mate[v] is the vertex to which v is paired.
    for (v = 0; v < nvertex; ++v) {
      if (mate[v] >= 0) {
        mate[v] = endpoint[mate[v]];
      }
    }
    for (v = 0; v < nvertex; ++v) {
      assert(mate[v] === -1 || mate[mate[v]] === v);
    }

    return mate;

  };

  return maxWeightMatching;

}
