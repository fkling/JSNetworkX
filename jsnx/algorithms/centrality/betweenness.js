"use strict";
/*jshint loopfunc:true*/

goog.provide('jsnx.algorithms.centrality.betweenness');


goog.require('jsnx.contrib.Map');
goog.require('jsnx.exception');
goog.require('jsnx.helper');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.iter');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.object');

/*jshint expr:true*/

/**
 * Optional "named" arguments to pass to 
 * jsnx.algorithms.centrality.betweenness_centrality.
 *
 * k (default=null)
 *     If k is not null use k node samples to estimate betweenness.
 *     The value of k <= n where n is the number of nodes in the graph.
 *     Higher values give better approximation.
 * normalized (default=false)
 *     If true the betweenness values are normalized by `2/((n-1)(n-2))` 
 *     for graphs, and `1/((n-1)(n-2))` for directed graphs where `n` 
 *     is the number of nodes in G. 
 * weight (default=null)
 *     If null, all edge weights are considered equal.
 *     Otherwise holds the name of the edge attribute used as weight.
 * endpoints (default=false)
 *     If true include the endpoints in the shortest path counts.
 *
 * @typedef {Object|{k: (number|undefined), normalized: (boolean|undefined), weight: (string|undefined), endpoints: (boolean|undefined)}}
*/
jsnx.algorithms.centrality.betweenness.betweenness_centrality_args;

/*jshint expr:false*/

/**
 * Compute the shortest-path betweenness centrality for nodes.
 *
 * Betweenness centrality of a node `v` is the sum of the
 * fraction of all-pairs shortest paths that pass through `v`:
 *
 *    c_B(v) = sum(sigma(s, t|v) / sigma(s, t)) over {s, t} in V
 *
 * where `V` is the set of nodes, `sigma(s, t)` is the number of 
 * shortest `(s, t)`-paths,  and `sigma(s, t|v)` is the number of those 
 * paths  passing through some  node `v` other than `s, t`. 
 * If `s = t`, `sigma(s, t) = 1`, and if `v in {s, t}`,  
 * `sigma(s, t|v) = 0` [2]_.
 *
 * See Also
 * --------
 * edge_betweenness_centrality
 * load_centrality
 *
 * Notes
 * -----
 * The algorithm is from Ulrik Brandes [1]_.
 * See [2]_ for details on algorithms for variations and related metrics.
 *
 * For approximate betweenness calculations set k=#samples to use 
 * k nodes ("pivots") to estimate the betweenness values. For an estimate
 * of the number of pivots needed see [3]_.
 *
 * For weighted graphs the edge weights must be greater than zero.
 * Zero edge weights can produce an infinite number of equal length 
 * paths between pairs of nodes.
 *
 * References
 * ----------
 * .. [1]  A Faster Algorithm for Betweenness Centrality.
 *    Ulrik Brandes, 
 *    Journal of Mathematical Sociology 25(2):163-177, 2001.
 *    http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf
 * .. [2] Ulrik Brandes: On Variants of Shortest-Path Betweenness 
 *    Centrality and their Generic Computation. 
 *    Social Networks 30(2):136-145, 2008.
 *    http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 * .. [3] Ulrik Brandes and Christian Pich: 
 *    Centrality Estimation in Large Networks. 
 *    International Journal of Bifurcation and Chaos 17(7):2303-2318, 2007.
 *    http://www.inf.uni-konstanz.de/algo/publications/bp-celn-06.pdf
 *
 * @param {!jsnx.classes.Graph} G A JSNetworkX graph 
 * @param {jsnx.algorithms.centrality.betweenness.betweenness_centrality_args=} opt_arg_dict (default=null)
 * 
 * @return {jsnx.contrib.Map} object with node keys with betweenness centrality
 *    as the value.
 * @export
*/
jsnx.algorithms.centrality.betweenness.betweenness_centrality = function(
  G,
  opt_arg_dict
) {
  if (!goog.isDefAndNotNull(opt_arg_dict)) {
    opt_arg_dict = {};
  }
  if (goog.typeOf(opt_arg_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The arg_dict argument must be an object.'
    );
  }

  var betweenness = jsnx.helper.mapfromkeys(G, 0.0);

  var nodes = G.nodes();
  if ('k' in opt_arg_dict) {
    // TODO:
    // if ('seed' in opt_arg_dict) {
    //     random.seed(seed)
    // }
    goog.array.shuffle(nodes);
    nodes = nodes.slice(0, opt_arg_dict['k']);
  }
  jsnx.helper.forEach(nodes.sort(), function(s) {
    // single source shortest paths
    var results = [];
    goog.asserts.assertObject(opt_arg_dict);
    if (goog.object.get(opt_arg_dict, 'weight', null) === null) {
      results = jsnx.algorithms.centrality.betweenness
        .single_source_shortest_path_basic(G, s);
    } else {    // use Dijkstra's algorithm
      results = jsnx.algorithms.centrality.betweenness
        .single_source_dijkstra_path_basic(G, s, opt_arg_dict['weight']);
    }
    var S = results[0];
    var P = results[1];
    var sigma = results[2];
    // accumulation
    if (goog.object.get(opt_arg_dict, 'endpoints', false)) {
      betweenness = jsnx.algorithms.centrality.betweenness
        .accumulate_endpoints(betweenness, S, P, sigma, s);
    } else {
      betweenness = jsnx.algorithms.centrality.betweenness
        .accumulate_basic(betweenness, S, P, sigma, s);
    }
  });
  // rescaling
  betweenness = jsnx.algorithms.centrality.betweenness.rescale(
    betweenness,
    jsnx.helper.len(G),
    goog.object.get(opt_arg_dict, 'normalized', true),
    G.is_directed(),
    goog.object.get(opt_arg_dict, 'k', null)
  );
  return betweenness;
};
goog.exportSymbol(
  'jsnx.betweenness_centrality',
  jsnx.algorithms.centrality.betweenness.betweenness_centrality
);


/*jshint expr:true*/

/**
 * Optional "named" arguments to pass to 
 * jsnx.algorithms.centrality.edge_betweenness_centrality.
 *
 * normalized (default=false)
 *     If true the betweenness values are normalized by `2/(n(n-1))`
 *     for graphs, and `1/(n(n-1))` for directed graphs where `n`
 *     is the number of nodes in G.
 * weight (default=null)
 *     If null, all edge weights are considered equal.
 *     Otherwise holds the name of the edge attribute used as weight.
 * 
 * @typedef {Object|{normalized: (boolean|undefined), weight: (string|undefined)}}
*/
jsnx.algorithms.centrality.betweenness.edge_betweenness_centrality_args;

/*jshint expr:false*/


/**
 * Compute betweenness centrality for edges.
 * Betweenness centrality of an edge `e` is the sum of the
 * fraction of all-pairs shortest paths that pass through `e`:
 *
 *    c_B(v) = sum(sigma(s, t|e) / sigma(s, t)) over {s, t} in V
 *
 * where `V` is the set of nodes,`sigma(s, t)` is the number of
 * shortest `(s, t)`-paths, and `sigma(s, t|e)` is the number of
 * those paths passing through edge `e` [2]_.
 *
 * See Also
 * --------
 * betweenness_centrality
 * edge_load
 *
 * Notes
 * -----
 * The algorithm is from Ulrik Brandes [1]_.
 *
 * For weighted graphs the edge weights must be greater than zero.
 * Zero edge weights can produce an infinite number of equal length 
 * paths between pairs of nodes.
 *
 * References
 * ----------
 * .. [1]  A Faster Algorithm for Betweenness Centrality. Ulrik Brandes,
 *    Journal of Mathematical Sociology 25(2):163-177, 2001.
 *    http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf
 * .. [2] Ulrik Brandes: On Variants of Shortest-Path Betweenness
 *    Centrality and their Generic Computation.
 *    Social Networks 30(2):136-145, 2008.
 *    http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 *
 * @param {!jsnx.classes.Graph} G A NetworkX graph
 * @param {jsnx.algorithms.centrality.betweenness.edge_betweenness_centrality_args=} opt_arg_dict (default=null)
 * 
 * @return {jsnx.contrib.Map} object with edge keys with betweenness centrality 
 *    as the value.
 * @export
*/
jsnx.algorithms.centrality.betweenness.edge_betweenness_centrality = function(G, opt_arg_dict) {
  if (!goog.isDefAndNotNull(opt_arg_dict)) {
    opt_arg_dict = {};
  }
  if (goog.typeOf(opt_arg_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The arg_dict argument must be an object.'
    );
  }

  var betweenness = jsnx.helper.mapfromkeys(G, 0.0);
  goog.iter.forEach(G.edges_iter(), function(ed) {
    betweenness.set(ed, 0.0);
  });

  var nodes = G.nodes();
  jsnx.helper.forEach(nodes.sort(), function(s) {
    // single source shortest paths
    var results = [];
    goog.asserts.assertObject(opt_arg_dict);
    if (goog.object.get(opt_arg_dict, 'weight', null) === null) {
      results = jsnx.algorithms.centrality.betweenness
        .single_source_shortest_path_basic(G, s);
    } else {    // use Dijkstra's algorithm
      results = jsnx.algorithms.centrality.betweenness
        .single_source_dijkstra_path_basic(G, s, opt_arg_dict['weight']);
    }
    var S = results[0];
    var P = results[1];
    var sigma = results[2];
    // accumulation
    betweenness = jsnx.algorithms.centrality.betweenness
      .accumulate_edges(betweenness, S, P, sigma, s);
  });
  // rescaling
  jsnx.helper.forEach(nodes, function(s) {
    betweenness.remove(s);
  });
  betweenness = jsnx.algorithms.centrality.betweenness.rescale_e(
    betweenness,
    jsnx.helper.len(G),
    goog.object.get(opt_arg_dict, 'normalized', true),
    G.is_directed()
  );
  return betweenness;
};
goog.exportSymbol(
  'jsnx.edge_betweenness_centrality',
  jsnx.algorithms.centrality.betweenness.edge_betweenness_centrality
);


// helpers for betweenness centrality

jsnx.algorithms.centrality.betweenness.single_source_shortest_path_basic = function(
  G,
  s
) {
  var S = [];
  var P = new jsnx.contrib.Map();
  goog.iter.forEach(G.nodes_iter(), function (v) { 
    P.set(v, []);
  });
  var sigma = jsnx.helper.mapfromkeys(G, 0.0);
  var D = new jsnx.contrib.Map();

  sigma.set(s, 1.0);
  D.set(s, 0);
  var Q = [s];
  while (Q.length > 0) {  // use BFS to find shortest paths
    var v = Q.shift();
    S.push(v);
    var Dv = D.get(v);
    var sigmav = sigma.get(v);
    goog.array.forEach(G.neighbors(v), function (w) {
      if (!D.has(w)) {
        Q.push(w);
        D.set(w, Dv + 1);
      }
      if (D.get(w) === Dv + 1) {   // this is a shortest path, count paths
        sigma.set(w, sigma.get(w) + sigmav);
        P.get(w).push(v);    // predecessors 
      }
    });
  }
  return [S, P, sigma];
};


jsnx.algorithms.centrality.betweenness.single_source_dijkstra_path_basic = function(
  G,
  s,
  weight
) {
  // modified from Eppstein
  var S = [];
  var P = new jsnx.contrib.Map();
  jsnx.helper.forEach(G.nodes(), function (v) { 
    P.set(v, []);
  });
  var sigma = jsnx.helper.mapfromkeys(G, 0.0);   // sigma[v]=0 for v in G
  var D = new jsnx.contrib.Map();

  sigma.set(s, 1.0);
  var seen = new jsnx.contrib.Map();
  seen.set(s, 0.0);
  // use Q as heap with (distance,node id) tuples
  var Q = new goog.structs.PriorityQueue(); 
  Q.enqueue(0, [s, s]);
  while (!Q.isEmpty()) {
    var dist = Q.peekKey();
    var pair = Q.dequeue();
    var pred = pair[0];
    var v = pair[1];
    if (D.has(v)) {
      continue;   // already searched this node.
    }
    sigma.set(v, sigma.get(v) + sigma.get(pred));    // count paths
    S.push(v);
    D.set(v, dist);
    goog.iter.forEach(G.edges_iter(v, true), function(edge) {
      var w = edge[1];
      var edgedata = edge[2];
      var vw_dist = dist + goog.object.get(edgedata, weight, 1);
      if (!D.has(w) &&
          (!seen.has(w) || vw_dist < /**@type {number}*/(seen.get(w)))
       ) {
        seen.set(w, vw_dist);
        Q.enqueue(vw_dist, [v, w]);
        sigma.set(w, 0.0);
        P.set(w, [v]);
      }
      else if (vw_dist === seen.get(w)) {  // handle equal paths
        sigma.set(w, sigma.get(w) + sigma.get(v));
        P.get(w).push(v);
      }
    });
  }
  return [S, P, sigma];
};


jsnx.algorithms.centrality.betweenness.accumulate_basic = function(
  betweenness,
  S,
  P,
  sigma,
  s
) {
  var delta = jsnx.helper.mapfromkeys(S, 0);

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1.0 + delta.get(w)) / sigma.get(w);
    goog.array.forEach(P.get(w), function(v) {
      delta.set(v, delta.get(v) + sigma.get(v) * coeff);
    });
    if (w !== s || goog.isObject(w) && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w));
    }
  }
  return betweenness;
};


jsnx.algorithms.centrality.betweenness.accumulate_endpoints = function(
  betweenness,
  S,
  P,
  sigma,
  s
) {
  betweenness.set(s, betweenness.get(s) + S.length - 1);
  var delta = jsnx.helper.mapfromkeys(S,0);

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1.0 + delta.get(w)) / sigma.get(w);
    goog.array.forEach(P.get(w), function(v) {
      delta.set(v, delta.get(v) + sigma.get(v) * coeff);
    });
    if (w !== s || goog.isObject(w) && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w) + 1);
    }
  }
  return betweenness;
};


jsnx.algorithms.centrality.betweenness.accumulate_edges = function(
  betweenness,
  S,
  P,
  sigma,
  s
) {
  var delta = jsnx.helper.mapfromkeys(S, 0);

  while (S.length > 0) {
    var w = S.pop();
    var coeff = (1.0 + delta.get(w)) / sigma.get(w);
    goog.array.forEach(P.get(w), function(v) {
      var c = sigma.get(v) * coeff;
      var n = [v, w];
      // TODO:
      if (!betweenness.has(n)) {
        n = [w, v];
        betweenness.set(n, betweenness.get(n) + c);
      } else {
        betweenness.set(n, betweenness.get(n) + c);
      }
      delta.set(v, delta.get(v) + c);
    });
    if (w !== s || goog.isObject(w) && w.toString() !== s.toString()) {
      betweenness.set(w, betweenness.get(w) + delta.get(w));
    }
  }
  return betweenness;
};


jsnx.algorithms.centrality.betweenness.rescale = function(
  betweenness,
  n,
  opt_normalized,
  opt_directed,
  opt_k
) {
  var scale;
  if (goog.isBoolean(opt_normalized) && opt_normalized) {
    if (n > 2) {
      scale = 1.0 / ((n - 1) * (n - 2));
    }
  }
  else {  // rescale by 2 for undirected graphs
    if (goog.isBoolean(opt_directed) && !opt_directed) {
      scale = 1.0 / 2.0;
    }
  }
  if (goog.isDef(scale)) {
    if (goog.isDefAndNotNull(opt_k)) {
      scale = scale * n / opt_k;
    }
    betweenness.forEach(function(k, v) {
      betweenness.set(k, v * scale);
    });
  }
  return betweenness;
};


jsnx.algorithms.centrality.betweenness.rescale_e = function(
  betweenness,
  n,
  opt_normalized,
  opt_directed
) {
  var scale;
  if (goog.isBoolean(opt_normalized) && opt_normalized) {
    if (n > 1) {
      scale = 1.0 / (n * (n - 1));
    }
  }
  else {  // rescale by 2 for undirected graphs
    if (goog.isBoolean(opt_directed) && !opt_directed) {
      scale = 1.0 / 2.0;
    }
  }
  if (goog.isDef(scale)) {
    betweenness.forEach(function(k, v) {
      betweenness.set(k, v * scale);
    });
  }
  return betweenness;
};
