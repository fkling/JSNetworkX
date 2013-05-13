/*jshint strict:false*/
goog.provide('jsnx.classes.MultiGraph');

goog.require('goog.iter');
goog.require('goog.json');
goog.require('goog.object');
goog.require('jsnx.classes.Graph');
goog.require('jsnx.contrib.Map');
goog.require('jsnx.exception');
goog.require('jsnx.helper');

/**
 * An undirected graph class that can store multiedges.
 *
 * Multiedges are multiple edges between two nodes.  Each edge
 * can hold optional data or attributes.
 *
 * A MultiGraph holds undirected edges.  Self loops are allowed.
 *
 * Nodes can be numbers or strings.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.DiGraph
 * @see jsnx.classes.MultiDiGraph
 *
 * @param {?=} opt_data Data to initialze graph.
 *      If no data is provided, an empty graph is created. The data can be
 *      an edge list or any graph object.
 * @param {Object=} opt_attr Attributes to add to graph as key=value pairs.
 *
 * @extends jsnx.classes.Graph
 * @constructor
 * @export
 */
jsnx.classes.MultiGraph = function(opt_data, opt_attr) {
  // makes it possible to call jsnx.Graph without new
  if(!(this instanceof jsnx.classes.MultiGraph)) {
    return new jsnx.classes.MultiGraph(opt_data, opt_attr);
  }
  goog.base(this, opt_data, opt_attr);
};
goog.inherits(jsnx.classes.MultiGraph, jsnx.classes.Graph);
goog.exportSymbol('jsnx.MultiGraph', jsnx.classes.MultiGraph);

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.MultiGraph['__name__'] = 'MultiGraph';


/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 *
 * Edge attributes can be specified with keywords or by providing
 * a dictionary with key/value pairs.
 *
 * Notes:
 *
 * To replace/update edge data, use the optional key argument
 * to identify a unique edge.  Otherwise a new edge will be created.
 *
 * NetworkX algorithms designed for weighted graphs cannot use
 * multigraphs directly because it is not clear how to handle
 * multiedge weights.  Convert to Graph using edge attribute
 * 'weight' to enable weighted graph algorithms.
 *
 * @see #add_edges_from
 *
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {?(number|string)=} opt_key identifier
 *      Used to distinguish multiedges between a pair of nodes. Default is
 *      the lowest unused integer.
 * @param {?Object=} opt_attr_dict  Dictionary of edge attributes.  
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiGraph.prototype.add_edge = function(u, v, opt_key, opt_attr_dict) {
  var datadict, keydict;

  if (
    goog.isDefAndNotNull(opt_key) &&
    !(goog.isString(opt_key) || goog.isNumber(opt_key))
  ) {
    opt_attr_dict = goog.asserts.assertObject(opt_key);
    opt_key = null;
  }

  // set up attribute dict
  opt_attr_dict = opt_attr_dict || {};

  if (goog.typeOf(opt_attr_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The attr_dict argument must be an object.'
    );
  }

  // add nodes
  if(!this['adj'].has(u)) {
    this['adj'].set(u, new jsnx.contrib.Map());
    this['node'].set(u, {});
  }
  if(!this['adj'].has(v)) {
    this['adj'].set(v, new jsnx.contrib.Map());
    this['node'].set(v, {});
  }
  if(this['adj'].get(u).has(v)) {
    keydict = this['adj'].get(u).get(v);
    if(!goog.isDefAndNotNull(opt_key)) {
      // find a unique integer key
      // other methods might be better here?
      opt_key = goog.object.getCount(keydict);
      while(goog.object.containsKey(keydict, opt_key)) {
        opt_key += 1;
      }
    }
    datadict = goog.object.get(keydict, ''+opt_key, {});
    goog.object.extend(datadict, opt_attr_dict);
    keydict[opt_key] = datadict;
  }
  else {
    // selfloops work this way without special treatment
    if(!goog.isDefAndNotNull(opt_key)) {
      opt_key = 0;
    }
    datadict = {};
    goog.object.extend(datadict, opt_attr_dict);
    keydict = goog.object.create(opt_key, datadict);
    this['adj'].get(u).set(v, keydict);
    this['adj'].get(v).set(u, keydict);
  }
};


/**
 * Add all the edges in ebunch.
 *
 * Notes:
 *
 *      Adding the same edge twice has no effect but any edge data
 *       will be updated when each duplicate edge is added.
 *
 * @see #add_edge
 * @see #ad_weighted_edges_from
 *
 *
 * @param {jsnx.helper.Iterable} ebunch container of edges
 *      Each edge given in the container will be added to the
 *      graph. The edges can be:
 *
 *          - 2-tuples (u,v) or
 *          - 3-tuples (u,v,d) for an edge attribute dict d or
 *          - 4-tuples (u,v,k,d) for an edge identified by key k
 *
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *       Key/value pairs will update existing data associated with each edge.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.add_edges_from = function(ebunch, opt_attr_dict) {
  // set up attribute dict
  opt_attr_dict = opt_attr_dict || {};

  if (goog.typeOf(opt_attr_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The attr_dict argument must be an object.'
    );
  }

  // process ebunch
  jsnx.helper.forEach(ebunch, function(e) {
    var ne = jsnx.helper.len(e),
    u,v,key = null,dd = {}, keydict, datadict;

    if(ne === 4) {
      u = e[0];
      v = e[1];
      key = e[2];
      dd = e[3];
    }
    else if(ne === 3) {
      u = e[0];
      v = e[1];
      dd = e[2];
    }
    else if(ne === 2) {
      u = e[0];
      v = e[1];
    }
    else {
      throw new jsnx.exception.JSNetworkXError(
        'Edge tuple ' + goog.json.serialize(e) + ' must be a 2-tuple, 3-tuple or 4-tuple.'
      );
    }

    if(this['adj'].has(u)) {
      keydict = this['adj'].get(u).get(v, {});
    }
    else {
      keydict = {};
    }

    if(!goog.isDefAndNotNull(key)) {
      // find a unique integer key
      // other methods might be better here?
      key = goog.object.getCount(keydict);
      while(goog.object.containsKey(keydict, key)) {
        key += 1;
      }
    }
    datadict = goog.object.get(keydict, key, {});
    goog.object.extend(datadict, opt_attr_dict, dd);
    this.add_edge(u, v, key, datadict);
  }, this);
};


/**
 * Remove an edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u
 * @param {jsnx.Node} v
 * @param {(number|string)=} opt_key
 *      Used to distinguish multiple edges between a pair of nodes.
 *      If null or undefined remove a single (abritrary) edge between u and v.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.remove_edge = function(u, v, opt_key) {
  var d;
  try {
    d = this['adj'].get(u).get(v);
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    throw new jsnx.exception.JSNetworkXError(
      'The edge ' + u + '-' + v + ' is not in the graph'
    );
  }

  // remove the edge with specified data
  if(!goog.isDefAndNotNull(opt_key)) {
    goog.object.remove(d, goog.object.getAnyKey(d));
  }
  else {
    if(!goog.object.containsKey(d, opt_key)) {
      throw new jsnx.exception.JSNetworkXError(
        'The edge ' + u + '-' + v + ' with key ' + opt_key + ' is not in the graph'
      );
    }
    goog.object.remove(d, opt_key);
  }
  if(goog.object.getCount(d) === 0) {
    // remove the key entries if last edge
    this['adj'].get(u).remove(v);
    if( u !== v) { // check for selfloop
      this['adj'].get(v).remove(u);
    }
  }
};


/**
 * Remove all edges specified in ebunch.
 *
 * Notes:
 *      Will fail silently if an edge in ebunch is not in the graph.
 *
 * @see #remove_edge
 *
 * 
 * @param {?} ebunch list or container of edge tuples
 *      Each edge given in the list or container will be removed
 *      from the graph. The edges can be:
 *
 *          - 2-tuples (u,v) All edges between u and v are removed.
 *          - 3-tuples (u,v,key) The edge identified by key is removed.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.remove_edges_from = function(ebunch) {
  jsnx.helper.forEach(ebunch, function(e) {
    try {
      this.remove_edge(e[0], e[1], e[2]);
    }
    catch(ex) {
      if(!(ex instanceof jsnx.exception.JSNetworkXError)) {
        throw ex;
      }
    }
  }, this);
};


/**
 * Return True if the graph has an edge between nodes u and v.
 *
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {(string|number)=} opt_key If specified return True only 
 *      if the edge with key is found.
 *
 * @return {boolean} True if edge is in the graph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.has_edge = function(u, v, opt_key) {
  try {
    if(!goog.isDefAndNotNull(opt_key)) {
      return this['adj'].get(u).has(v);
    }
    else {
      return goog.object.containsKey(this['adj'].get(u).get(v), opt_key);
    }
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    return false;
  }
};


/**
 * Return a list of edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *
 * @see #edges_iter
 *
 * @param {?jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {?boolean=} opt_data (default=False)
 *      Return two tuples (u,v) (False) or three-tuples (u,v,data) (True).
 * @param {?boolean=} opt_keys (default=False)
 *      Return two tuples (u,v) (False) or three-tuples (u,v,key) (True).
 *
 * @return {!Array} list of edge tuples
 *      Edges that are adjacent to any node in nbunch, or a list
 *      of all edges if nbunch is not specified.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.edges = function(opt_nbunch, opt_data, opt_keys) {
  return goog.iter.toArray(this.edges_iter(opt_nbunch, opt_data, opt_keys));
};


/**
 * Return an iterator over edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *
 * @see #edges_iter
 *
 * @param {?(jsnx.NodeContainer|boolean)=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {?boolean=} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {?boolean=} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {!goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.edges_iter = function(opt_nbunch, opt_data, opt_keys) {
  if(goog.isBoolean(opt_nbunch)) {
    if(goog.isBoolean(opt_data)) {
      opt_keys = opt_data;
    }
    opt_data = goog.asserts.assertBoolean(opt_nbunch);
    opt_nbunch = null;
  }

  var seen = new jsnx.contrib.Map();
  var iterator, nodes_nbrs, n, nbr;

  if (!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nbrs = goog.iter.toIterator(this['adj']);
  }
  else {
    // reusable tuple
    var t = [];
    nodes_nbrs = /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      this.nbunch_iter(opt_nbunch),
      function(n) {
        t[0] = n;
        t[1] = this['adj'].get(n);
        return t;
      },
      this
    ));
  }

  if(opt_data) {
    return jsnx.helper.nested_chain(nodes_nbrs, function(nd) {
      n = nd[0];

      var iterator = new goog.iter.Iterator();
      var iterable = goog.iter.toIterator(nd[1]);

      iterator.next = function() {
        try {
          return iterable.next();
        }
        catch(e) {
          if(e === goog.iter.StopIteration) {
            seen.set(n, true);
          }
          throw e;
        }
      };

      return iterator;
    }, function(nbrd) {
      nbr = nbrd[0];

      if(!seen.has(nbr)) {
        return jsnx.helper.iteritems(nbrd[1]);
      }
    }, function(keydict) {
      if(opt_keys) {
        return [n, nbr, keydict[0], keydict[1]];
      }
      else {
        return [n, nbr, keydict[1]];
      }
    });
  }
  else {
    return jsnx.helper.nested_chain(nodes_nbrs, function(nd) {
      n = nd[0];

      var iterator = new goog.iter.Iterator();
      var iterable = goog.iter.toIterator(nd[1]);

      iterator.next = function() {
        try {
          return iterable.next();
        }
        catch(e) {
          if(e === goog.iter.StopIteration) {
            seen.set(n, true);
          }
          throw e;
        }
      };

      return iterator;
    }, function(nbrd) {
      nbr = nbrd[0];

      if(!seen.has(nbr)) {
        return jsnx.helper.iteritems(nbrd[1]);
      }
    }, function(keydict) {
      if(opt_keys) {
        return [n, nbr, keydict[0]];
      }
      else {
        return [n, nbr];
      }
    });
  }
};


/**
 * Return the attribute dictionary associated with edge (u,v).
 *
 * Notes:
 *
 *      It is faster to use G.get_node(u)[v][key]
 *
 * Warning:
 *
 *      Assigning G.get_node(u)[v][key] corrupts the graph data structure.
 *      But it is safe to assign attributes to that dictionary.
 *
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {(string|number)=} opt_key Return data only for the edge with 
 *      specified key.
 * @param {T=} opt_default Value to return if the edge (u,v) is not found.
 *
 * @return {(Object|T)} The edge attribute dictionary.
 * @template T
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.get_edge_data = function(u, v, opt_key, opt_default) {
  if (!goog.isDef(opt_default)) {
    opt_default = null;
  }

  try {
    if(!goog.isDefAndNotNull(opt_key)) {
      return this['adj'].get(u).get(v);
    }
    else {
      return goog.object.get(this['adj'].get(u).get(v), ''+opt_key, opt_default);
    }
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    return opt_default;
  }
};


/**
 * Return an iterator for (node, degree).
 *
 * @see #degree
 *
 *
 * @param {?(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch  A container of nodes
 *      The container will be iterated through once.
 * @param {?string=} opt_weight  The edge attribute that holds the numerical 
 *      value used as a weight.  If None, then each edge has weight 1.
 *      The degree is the sum of the edge weights adjacent to the node.
 *
 * @return {!goog.iter.Iterator} The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
  var iterator, nodes_nbrs;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nbrs = goog.iter.toIterator(this['adj']);
  }
  else {
    var t = [];
    nodes_nbrs = /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      this.nbunch_iter(opt_nbunch),
      function(n) {
        t[0] = n;
        t[1] = this['adj'].get(n);
        return t;
      },
      this
    ));
  }

  if (!goog.isDefAndNotNull(opt_weight)) {
    iterator = goog.iter.map(nodes_nbrs, function(nd) {
      var n = nd[0];
      var nbrs = nd[1];
      var deg = 0;

      nbrs.forEach(function(_, data) {
        deg += goog.object.getCount(data);
      });

      return [n, deg + (+(nbrs.has(n) && goog.object.getCount(nbrs.get(n))))];
    });
  }
  else {
    // edge weighted graph - degree is sum of nbr edge weights
    iterator = goog.iter.map(nodes_nbrs, function(nd) {
      var n = nd[0];
      var nbrs = nd[1];
      var deg = 0;

      nbrs.forEach(function(_, data) {
        goog.object.forEach(data, function(d) {
          deg += goog.object.get(d, goog.asserts.assert(opt_weight), 1);
        });
      });

      if (nbrs.has(n)) {
        goog.object.forEach(nbrs.get(n), function(d) {
          deg += goog.object.get(d, goog.asserts.assert(opt_weight), 1);
        });
      }

      return [n, deg];
    });
  }

  return iterator;
};


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.is_multigraph = function() {
  return true;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.is_directed = function() {
  return false;
};


/**
 * Return a directed representation of the graph.
 *
 * Notes:
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar D = DiGraph(G) which returns a
 *      shallow copy of the data.
 *
 * @return {!jsnx.classes.MultiDiGraph} 
 *      A directed graph with the same name, same nodes, and with
 *      each edge (u,v,data) replaced by two directed edges
 *      (u,v,data) and (v,u,data).
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.to_directed = function() {
  var G = new jsnx.classes.MultiDiGraph();
  G.add_nodes_from(this);
  G.add_edges_from((function() {
    var u,v;
    return jsnx.helper.nested_chain(this.adjacency_iter(), function(nd) {
      u = nd[0];
      return goog.iter.toIterator(nd[1]);
    }, function(nbrd) {
      v = nbrd[0];
      return jsnx.helper.iteritems(nbrd[1]);
    }, function(keydictd) {
      return [u,v,keydictd[0], jsnx.helper.deepcopy(keydictd[1])];
    });
  }.call(this)));

  G['graph'] = jsnx.helper.deepcopy(this['graph']);
  G['node'] = jsnx.helper.deepcopy(this['node']);
  return G;
};


/**
 * Return a list of selfloop edges.
 *
 *
 * @see #nodes_with_selfloops
 * @see #number_of_selfloops
 *
 *
 * @param {boolean=} opt_data  (default=False)
 *      Return selfloop edges as two tuples (u,v) (data=False)
 *      or three-tuples (u,v,data) (data=True)
 * @param {boolean=} opt_keys  (default=False)
 *       If True, return edge keys with each edge
 *
 * @return {Array} A list of all selfloop edges
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.selfloop_edges = function(opt_data, opt_keys) {
  var edges = [];
  if (opt_data) {
    if (opt_keys) {
      this['adj'].forEach(function(n, nbrs) {
        if (nbrs.has(n)) {
          goog.object.forEach(nbrs.get(n), function(d, k) {
            edges.push([n,n,k,d]);
          });
        }
      });
    }
    else {
      this['adj'].forEach(function(n, nbrs) {
        if (nbrs.has(n)) {
          goog.object.forEach(nbrs.get(n), function(d) {
            edges.push([n,n,d]);
          });
        }
      });
    }
  }
  else {
    if (opt_keys) {
      this['adj'].forEach(function(n, nbrs) {
        if (nbrs.has(n)) {
          goog.object.forEach(nbrs.get(n), function(d, k) {
            edges.push([n,n,k]);
          });
        }
      });
    }
    else {
      this['adj'].forEach(function(n, nbrs) {
        if (nbrs.has(n)) {
          goog.object.forEach(nbrs.get(n), function() {
            edges.push([n,n]);
          });
        }
      });
    }
  }

  return edges;
};


/**
 * Return the number of edges between two nodes.
 *
 * @see #size
 *
 * @param {jsnx.Node=} opt_u node
 * @param {jsnx.Node=} opt_v node
 *      If u and v are specified, return the number of edges between
 *      u and v. Otherwise return the total number of all edges.
 *
 * @return {number} The number of edges in the graph.
 *      If nodes u and v are specified return the number of edges between 
 *      those nodes.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.number_of_edges = function(opt_u, opt_v) {
  if(!goog.isDefAndNotNull(opt_u)) {
    return this.size();
  }

  try {
    return goog.object.getCount(this['adj'].get(opt_u).get(opt_u));
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    return 0;
  }
};


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * Notes:
 *
 *      The graph, edge or node attributes just point to the original graph.
 *      So changes to the node or edge structure will not be reflected in
 *      the original graph while changes to the attributes will.
 *
 *      To create a subgraph with its own copy of the edge/node attributes use:
 *      jsnx.Graph(G.subgraph(nbunch))
 *
 *      If edge attributes are containers, a deep copy can be obtained using:
 *      G.subgraph(nbunch).copy()
 *
 *
 * @param {jsnx.NodeContainer=} nbunch A container of nodes which will be 
 *      iterated through once.
 * @return {jsnx.classes.MultiGraph} A subgraph of the graph with the same 
 *      edge attributes.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.subgraph = function(nbunch) {
  var bunch = this.nbunch_iter(nbunch);
  // create new graph and copy subgraph into it
  var H = new this.constructor();
  // namespace shortcuts for speed
  var H_adj = H['adj'],
  this_adj = this['adj'];

  // add nodes and edges (undirected method)
  goog.iter.forEach(bunch, function(n) {
    var Hnbrs = new jsnx.contrib.Map();
    H_adj.set(n, Hnbrs);

    this_adj.get(n).forEach(function(nbr, edgedict) {
      if(H_adj.has(nbr)) {
        // add both representations of edge: n-nbr and nbr-n
        // they share the same edgedict
        var ed = goog.object.clone(edgedict);
        Hnbrs.set(nbr, ed);
        H_adj.get(nbr).set(n, ed);
      }
    });
  });

  // copy node and attribute dictionaries
  this['node'].forEach(function(n, d) {
    H['node'].set(n, d);
  });
  H['graph'] = this['graph'];

  return H;
};
