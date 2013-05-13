'use strict';
goog.provide('jsnx.classes.DiGraph');

goog.require('goog.object');
goog.require('jsnx.convert');
goog.require('jsnx.exception');
goog.require('jsnx.classes.Graph');
goog.require('jsnx.contrib.Map');

/**
 * Base class for directed graphs.
 *
 * A DiGraph stores nodes and edges with optional data, or attributes.
 *
 * DiGraphs hold directed edges.  Self loops are allowed but multiple
 * (parallel) edges are not.
 *
 * Nodes can be arbitrary (hashable) Python objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.MultiGraph
 * @see jsnx.classes.MultiDiGraph
 *
 * @param {?=} opt_data 
 *      Data to initialize graph.  If data=None (default) an empty
 *      graph is created.  The data can be an edge list, or any
 *      NetworkX graph object.
 *
 * @param {Object=} opt_attr 
 *       Attributes to add to graph as key=value pairs.
 *
 * WARNING: If only {@code opt_attr} is provided, it will be interpreted as
 * {@code opt_data}, since both arguments can be of the same type. Hence you
 * have to pass {@code null} explicitly:
 *
 * var G = new jsnx.DiGraph(null, {name: 'test'});
 *
 * @extends jsnx.classes.Graph
 * @constructor
 * @export
 */
jsnx.classes.DiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.DiGraph)) {
        return new jsnx.classes.DiGraph(opt_data, opt_attr);
    }

    this['graph'] = {}; // dictionary for graph attributes
    this['node'] = new jsnx.contrib.Map(); // dictionary for node attributes
    // We store two adjacency lists:
    // the  predecessors of node n are stored in the dict self.pred
    // the successors of node n are stored in the dict self.succ=self.adj
    this['adj'] = new jsnx.contrib.Map(); // empty adjacency dictionary
    this['pred'] = new jsnx.contrib.Map(); // predecessor
    this['succ'] = this['adj']; // successor

    //attempt to load graph with data
    if(goog.isDefAndNotNull(opt_data)) {
        jsnx.convert.to_networkx_graph(opt_data, this);
    }
    // load graph attributes (must be afte convert)
    goog.object.extend(this['graph'], opt_attr || {});
    this['edge'] = this['adj'];
};
goog.exportSymbol('jsnx.DiGraph', jsnx.classes.DiGraph);
goog.inherits(jsnx.classes.DiGraph, jsnx.classes.Graph);


/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.DiGraph['__name__'] = 'DiGraph';


/**
 * @type {jsnx.contrib.Map}
 * @export
 */
jsnx.classes.DiGraph.prototype.pred = null;


/**
 * @type {jsnx.contrib.Map}
 * @export
 */
jsnx.classes.DiGraph.prototype.succ = null;


/**
 * Add a single node n and update node attributes.
 *
 * @see #add_nodes_from
 *
 * @param {jsnx.Node} n Node
 * @param {Object=} opt_attr_dict Dictionary of node attributes.
 *      Key/value pairs will update existing data associated with the node.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_node = function(n, opt_attr_dict) {
    // set up attribute dict
    if(!goog.isDefAndNotNull(opt_attr_dict)) {
        opt_attr_dict = {};
    }

    if(goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    if(!this['succ'].has(n)) {
        this['succ'].set(n, new jsnx.contrib.Map());
        this['pred'].set(n, new jsnx.contrib.Map());
        this['node'].set(n, opt_attr_dict);
    }
    else { // update attr even if node already exists
        goog.object.extend(this['node'].get(n), opt_attr_dict);
    }
};


/**
 * Add multiple nodes.
 *
 * @see #add_node
 *
 * @param {jsnx.NodeContainer} nodes 
 *      A container of nodes (list, dict, set, etc.).
 *      OR
 *      A container of (node, attribute dict) tuples. 
 *
 * @param {Object=} opt_attr  Update attributes for all nodes in nodes.
 *       Node attributes specified in nodes as a tuple
 *       take precedence over attributes specified generally.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_nodes_from = function(nodes, opt_attr) {
    var newnode, nn, ndict, newdict, olddict;

    if (!goog.isDefAndNotNull(opt_attr)) {
      opt_attr = {};
    }

    // if an object, only iterate over the keys
    jsnx.helper.forEach(jsnx.helper.iter(nodes), function(n) {
        newnode = !this['succ'].has(n);

        // test whether n is a (node, attr) tuple
        if (goog.isArray(n) && n.length === 2 && goog.isObject(n[1])) {
            nn = n[0];
            ndict = n[1];

            if (!this['succ'].has(nn)) {
                this['succ'].set(nn, new jsnx.contrib.Map());
                this['pred'].set(nn, new jsnx.contrib.Map());
                newdict = goog.object.clone(/** @type {!Object} */ (opt_attr));
                goog.object.extend(newdict, ndict);
                this['node'].set(nn, newdict);
            }
            else {
                olddict = this['node'].get(nn);
                goog.object.extend(olddict, opt_attr, ndict);
            }
            return; // continue next iteration
        }
        if (newnode) {
            this['succ'].set(n, new jsnx.contrib.Map());
            this['pred'].set(n, new jsnx.contrib.Map());
            this['node'].set(
              n,
              goog.object.clone(/** @type {!Object} */ (opt_attr))
            );
        }
        else {
            goog.object.extend(this['node'].get(n), opt_attr);
        }
    }, this);
};

/**
 * Remove node n.
 *
 * Removes the node n and all adjacent edges.
 * Attempting to remove a non-existent node will raise an exception.
 *
 * @see #remove_nodes_from
 *
 * @param {jsnx.Node} n  A node in the graph
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_node = function(n) {
    var nbrs;

    try {
      nbrs = this['succ'].get(n);
      this['node'].remove(n);
    }
    catch(ex) {
      if (!(ex instanceof jsnx.exception.KeyError)) {
        throw ex;
      }
      throw new jsnx.exception.JSNetworkXError(
        goog.string.subs(
          'The node %s is not in the graph',
          goog.json.serialize(n)
        )
      );
    }

    nbrs.forEach(function(u) {
      this['pred'].get(u).remove(n); // remove all edges n-u in digraph
    }, this);
    this['succ'].remove(n); // remove node from succ
    this['pred'].get(n).forEach(function(u) {
        this['succ'].get(u).remove(n); // remove all edges n-u in digraph
    }, this);
    this['pred'].remove(n); // remove node from pred
};


/**
 * Remove multiple nodes.
 *
 * @see #remove_node
 *
 * @param {jsnx.NodeContainer} nodes  A container of nodes.
 *      If a node in the container is not in the graph it is silently ignored.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_nodes_from = function(nodes) {
  var succs;
  jsnx.helper.forEach(nodes, function(n) {
    if (this['succ'].has(n)) {
      succs = this['succ'].get(n);

      this['node'].remove(n);
      succs.forEach(function(u) {
        // remove all edges n-u in digraph
        this['pred'].get(u).remove(n);
      }, this);
      this['succ'].remove(n); // remove node from succ
      this['pred'].get(n).forEach(function(u) {
        // remove all edges n-u in digraph
        this['succ'].get(u).remove(n); 
      }, this);
      this['pred'].remove(n); // remove node from pred
    }
  }, this);
};


/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 * 
 * Edge attributes can be specified with keywords or by providing
 * a dictionary with key/value pairs.
 *
 * @see #add_edges_from
 *
 * Note: Adding an edge that already exists updates the edge data.
 * 
 *       Many NetworkX algorithms designed for weighted graphs use as
 *       the edge weight a numerical value assigned to a keyword
 *       which by default is 'weight'.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_edge = function(u, v, opt_attr_dict) {
  opt_attr_dict = opt_attr_dict || {};

  if (goog.typeOf(opt_attr_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The attr_dict argument must be an object.'
    );
  }

  // add nodes
  if (!this['succ'].has(u)) {
    this['succ'].set(u, new jsnx.contrib.Map());
    this['pred'].set(u, new jsnx.contrib.Map());
    this['node'].set(u, {});
  }

  if (!this['succ'].has(v)) {
    this['succ'].set(v, new jsnx.contrib.Map());
    this['pred'].set(v, new jsnx.contrib.Map());
    this['node'].set(v, {});
  }

  // add the edge
  var datadict = this['adj'].get(u).get(v, {});
  goog.object.extend(datadict, opt_attr_dict);
  this['succ'].get(u).set(v, datadict);
  this['pred'].get(v).set(u, datadict);
};


/**
 * Add all the edges in ebunch.
 *
 * Notes: 
 * Adding the same edge twice has no effect but any edge data
 * will be updated when each duplicate edge is added.
 *
 * @see #add_edge
 * @see #add_weighted_edges_from
 *
 * @param {?} ebunch container of edges
 *      Each edge given in the container will be added to the
 *      graph. The edges must be given as as 2-tuples (u,v) or
 *      3-tuples (u,v,d) where d is a dictionary containing edge data.
 *
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *      Dictionary of edge attributes.  Key/value pairs will
 *      update existing data associated with each edge.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.add_edges_from = function(ebunch, opt_attr_dict) {
  opt_attr_dict = opt_attr_dict || {};

  if (goog.typeOf(opt_attr_dict) !== 'object') {
    throw new jsnx.exception.JSNetworkXError(
      'The attr_dict argument must be an object.'
    );
  }

  // process ebunch
  jsnx.helper.forEach(ebunch, function(e) {
    var ne = jsnx.helper.len(e);
    var u, v, dd;
    if (ne === 3) {
      u = e[0];
      v = e[1];
      dd = e[2];
    }
    else if (ne === 2) {
      u = e[0];
      v = e[1];
      dd = {};
    }
    else {
      throw new jsnx.exception.JSNetworkXError(
        'Edge tuple ' + e.toString() + ' must be a 2-tuple or 3-tuple.'
      );
    }

    if (!this['succ'].has(u)) {
      this['succ'].set(u, new jsnx.contrib.Map());
      this['pred'].set(u, new jsnx.contrib.Map());
      this['node'].set(u, {});
    }
    if (!this['succ'].has(v)) {
      this['succ'].set(v, new jsnx.contrib.Map());
      this['pred'].set(v, new jsnx.contrib.Map());
      this['node'].set(v, {});
    }

    var datadict = this['adj'].get(u).get(v, {});
    goog.object.extend(datadict, opt_attr_dict, dd);
    this['succ'].get(u).set(v, datadict);
    this['pred'].get(v).set(u, datadict);
  }, this);
};


/**
 * Remove the edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_edge = function(u, v) {
  try {
    this['succ'].get(u).remove(v);
    this['pred'].get(v).remove(u);
  }
  catch (e) {
    if (e instanceof TypeError) {
      throw new jsnx.exception.JSNetworkXError(
        goog.string.subs(
          'The edge %s-%s is not in the graph',
          goog.json.serialize(u),
          goog.json.serialize(v)
        )
      );
    }
    throw e;
  }
};


/**
 * Remove all edges specified in ebunch.
 *
 * Notes: Will fail silently if an edge in ebunch is not in the graph.
 *
 * @param {?} ebunch 1list or container of edge tuples
 *      Each edge given in the list or container will be removed
 *      from the graph. The edges can be:
 *          - 2-tuples (u,v) edge between u and v.
 *          - 3-tuples (u,v,k) where k is ignored.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_edges_from = function(ebunch) {
  jsnx.helper.forEach(ebunch, function(e) {
    var u = e[0]; // ignore edge data if present
    var v = e[1];

    try {
      this['succ'].get(u).remove(v);
      this['pred'].get(v).remove(u);
    }
    catch(ex){
      // pass
    }
  }, this);
};


/**
 * Return True if node u has successor v.
 *
 * This is true if graph has the edge u->v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has successor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_successor = function(u, v) {
  return this['succ'].has(u) && this['succ'].get(u).has(v);
};


/**
 * Return True if node u has predecessor v.
 *
 * This is true if graph has the edge u<-v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has predecessor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_predecessor = function(u, v) {
  return this['pred'].has(u) && this['pred'].get(u).has(v);
};


/**
 * Return an iterator over successor nodes of n.
 *
 * {@code neighbors_iter()} and {@code successors_iter()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors_iter = function(n) {
  try {
    return goog.iter.map(this['succ'].get(n), function(d) {
      return d[0];
    });
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    throw new jsnx.exception.JSNetworkXError(
      'The node ' + n + ' is not in the digraph.'
    );
  }
};


/**
 * Return an iterator over predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors_iter = function(n) {
  try {
    return goog.iter.map(this['pred'].get(n), function(d) {
      return d[0];
    });
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    throw new jsnx.exception.JSNetworkXError(
      'The node ' + n + ' is not in the digraph.'
    );
  }
};


/**
 * Return a list of successor nodes of n.
 *
 * {@code neighbors()} and {@code successors()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors = function(n) {
  try {
    return this['succ'].get(n).keys();
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    throw new jsnx.exception.JSNetworkXError(
      'The node ' + n + ' is not in the digraph.'
    );
  }
};


/**
 * Return list of predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors = function(n) {
  try {
    return this['pred'].get(n).keys();
  }
  catch(ex) {
    if (!(ex instanceof jsnx.exception.KeyError)) {
      throw ex;
    }
    throw new jsnx.exception.JSNetworkXError(
      'The node ' + n + ' is not in the digraph.'
    );
  }
};


// digraph definitions
/**
 * @see #successors
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors = 
  jsnx.classes.DiGraph.prototype.successors;

/**
 * @see #successors_iter
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors_iter = 
  jsnx.classes.DiGraph.prototype.successors_iter;


/**
 * Return an iterator over the edges.
 *
 * Edges are returned as tuples with optional data
 * in the order (node, neighbor, data).
 *
 * @see #edges
 *
 * Note:
 *
 *      Nodes in nbunch that are not in the graph will be (quietly) ignored.
 * 
 * @param {?(jsnx.NodeContainer|boolean)=} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {?boolean=} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!goog.iter.Iterator} An iterator of (u,v) or (u,v,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.edges_iter = function(opt_nbunch, opt_data) {
  // handle calls with opt_data being the only argument
  if (goog.isBoolean(opt_nbunch)) {
    opt_data = /** @type {boolean} */ (opt_nbunch);
    opt_nbunch = null;
  }

  var nodes_nrbs, n, nbr;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nrbs = this['adj'];
  }
  else {
    // reuse tuple
    var t = [];
    nodes_nrbs = /** @type {goog.iter.Iterable} */ (jsnx.helper.map(
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
    return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
      n = nd[0];
      return goog.iter.toIterator(nd[1]);
    }, function(nbrd) {
      return [n, nbrd[0], nbrd[1]];
    });
  }
  else {
    return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
      n = nd[0];
      return goog.iter.toIterator(nd[1]);
    }, function(nbrd) {
      return [n, nbrd[0]];
    });
  }
};

// alias out_edges to edges

/**
 * @see #edges_iter
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges_iter = 
  jsnx.classes.DiGraph.prototype.edges_iter;


/**
 * @see jsnx.Graph#edges
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges = 
  jsnx.classes.Graph.prototype.edges;


/**
 * Return an iterator over the incoming edges.
 *
 * @see #edges_iter
 *
 * 
 * @param {(?jsnx.NodeContainer|boolean)=} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {?boolean=} opt_data
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!goog.iter.Iterator} An iterator of (u,v) or (u,v,d) tuples of 
 *      incoming edges.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges_iter = function(opt_nbunch, opt_data) {
  // handle calls with opt_data being the only argument
  if (goog.isBoolean(opt_nbunch)) {
    opt_data = /** @type {boolean} */ (opt_nbunch);
    opt_nbunch = null;
  }

  var nodes_nrbs, n;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nrbs = this['pred'];
  }
  else {
    // reusable tuple
    var t = [];
    nodes_nrbs = /** @type goog.iter.Iterator */ (jsnx.helper.map(
      this.nbunch_iter(opt_nbunch),
      function(n) {
        t[0] = n;
        t[1] = this['pred'].get(n);
        return t;
      },
      this
    ));
  }

  if(opt_data) {
    return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
      n = nd[0];
      return goog.iter.toIterator(nd[1]);
    }, function(nbrd) {
      // reuse nbrd array to save memory
      nbrd[2] = nbrd[1];
      nbrd[1] = n;
      return nbrd;
    });
  }
  else {
    return jsnx.helper.nested_chain(
      nodes_nrbs,
      function(nd) {
        n = nd[0];
        return goog.iter.toIterator(nd[1]);
      },
      function(nbrd) {
        // reuse nbrd array to save memory
        nbrd[1] = n;
        return nbrd;
      }
    );
  }
};


/**
 * Return a list of the incoming edges.
 *
 * @see #edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {boolean} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!Array} A list of incoming edges
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges = function(opt_nbunch, opt_data) {
  return /** @type {!Array} */ (jsnx.helper.toArray(
    this.in_edges_iter(opt_nbunch, opt_data)
  ));
};


/**
 * Return an iterator for (node, degree).
 *
 * The node degree is the number of edges adjacent to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
 * @see #out_degree_iter
 *
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {!goog.iter.Iterator}  The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
  var nodes_nbrs;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nbrs = /**@type {goog.iter.Iterator} */(jsnx.helper.zip(
      goog.iter.toIterator(this['succ']),
      goog.iter.toIterator(this['pred'])
    ));
  }
  else {
    nodes_nbrs = /**@type {goog.iter.Iterator} */(jsnx.helper.zip(
      goog.iter.map(this.nbunch_iter(opt_nbunch), function(n) {
        return [n, this['succ'].get(n)];
      }, this),
      jsnx.helper.map(this.nbunch_iter(opt_nbunch), function(n) {
        return [n, this['pred'].get(n)];
      }, this)
    ));
  }

  if(!goog.isString(opt_weight)) {
    return /** @type {!goog.iter.Iterator} */ (goog.iter.map(
      nodes_nbrs, 
      function(nd) {
        return [ nd[0][0], nd[0][1].count() + nd[1][1].count()];
      }
    ));
  }
  else {
    // edge weighted graph - degree is sum of edge weights
    return /** @type {!goog.iter.Iterator} */ (jsnx.helper.map(
      nodes_nbrs, 
      function(nd) {
        var succ = nd[0][1];
        var pred = nd[1][1];
        var sum = 0;
        var nbr;

        succ.forEach(function(nbr, data) {
          sum += +goog.object.get(data, /** @type {!string} */ (opt_weight), 1);
        });

        pred.forEach(function(nbr, data) {
          sum += +goog.object.get(data, /** @type {!string} */ (opt_weight), 1);
        });

        return [nd[0][0], sum];
      }
    ));
  }
};


/**
 * Return an iterator for (node, in-degree).
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #out_degree_iter
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, in-degree).
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree_iter = function(opt_nbunch, opt_weight) {
  var nodes_nbrs;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nbrs = this['pred'];
  }
  else {
    nodes_nbrs = /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      this.nbunch_iter(opt_nbunch),
      function(n) {
        return [n, this['pred'].get(n)];
      }, this
    ));
  }

  if(!goog.isDefAndNotNull(opt_weight)) {
    return /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      nodes_nbrs,
      function(nd) {
        nd[1] = nd[1].count();
        return nd;
      }
    ));
  }
  else {
    return /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      nodes_nbrs,
      function(nd) {
        var sum = 0;
        nd[1].forEach(function(_, data) {
          sum += +goog.object.get(data, /** @type {!string} */ (opt_weight), 1);
        });
        nd[1] = sum;
        return nd;
      }
    ));
  }
};


/**
 * Return an iterator for (node, out-degree).
 *
 * The node out-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, out-degree).
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree_iter = function(opt_nbunch, opt_weight) {
  var nodes_nbrs;

  if(!goog.isDefAndNotNull(opt_nbunch)) {
    nodes_nbrs = goog.iter.toIterator(this['succ']);
  }
  else {
    // reusable tuple
    var t = [];

    nodes_nbrs = /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      this.nbunch_iter(opt_nbunch),
      function(n) {
        t[0] = n;
        t[1] = this['succ'].get(n);
        return t;
      },
      this
    ));
  }

  if(!goog.isDefAndNotNull(opt_weight)) {
    return /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      nodes_nbrs,
      function(nd) {
        return [nd[0], nd[1].count()];
      }
    ));
  }
  else {
    return /** @type {goog.iter.Iterator} */ (jsnx.helper.map(
      nodes_nbrs,
      function(nd) {
        var sum = 0;
        nd[1].forEach(function(u, data) {
          sum += +goog.object.get(data, /** @type {!string} */ (opt_weight), 1);
        });
        return [nd[0], sum];
      }
    ));
  }
};


/**
 * Return the in-degree of a node or nodes.
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {(number|jsnx.contrib.Map)}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree = function(opt_nbunch, opt_weight) {
  if(goog.isDefAndNotNull(opt_nbunch) && this.has_node(opt_nbunch)) { 
    // return a single node
    return /** @type {number} */ (
      this.in_degree_iter(opt_nbunch, opt_weight).next()[1]
    );
  }
  else {
    return /** @type {jsnx.contrib.Map} */ (
      new jsnx.contrib.Map(this.in_degree_iter(opt_nbunch, opt_weight))
    );
  }
};


/**
 * Return the out-degree of a node or nodes.
 *
 * The node out-degree is the number of edges pointing out of the node.
 *
 * @see #degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {(number|jsnx.contrib.Map)}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree = function(opt_nbunch, opt_weight) {
  if(goog.isDefAndNotNull(opt_nbunch) && this.has_node(opt_nbunch)) {
    // return a single node
    return /** @type {number} */ (
      this.out_degree_iter(opt_nbunch, opt_weight).next()[1]
    );
  }
  else {
    return /** @type {jsnx.contrib.Map} */ (
      new jsnx.contrib.Map(this.out_degree_iter(opt_nbunch, opt_weight))
    );
  }
};


/**
 * Remove all nodes and edges from the graph.
 *
 * This also removes the name, and all graph, node, and edge attributes.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.clear = function() {
  this['succ'].clear();
  this['pred'].clear();
  this['node'].clear();
  goog.object.clear(this['graph']);
};


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_multigraph = function() {
    return false;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_directed = function() {
  return true;
};


/**
 * Return a directed copy of the graph.
 *
 * Notes:
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar D = new DiGraph(G) which returns a
 *      shallow copy of the data.
 *
 * @return {!jsnx.classes.DiGraph} A deepcopy of the graph
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.to_directed = function() {
  return jsnx.helper.deepcopy_instance(this);
};


/**
 * Return an undirected representation of the digraph.
 *
 * Notes:
 *
 * If edges in both directions (u,v) and (v,u) exist in the
 * graph, attributes for the new undirected edge will be a combination of
 * the attributes of the directed edges.  The edge data is updated
 * in the (arbitrary) order that the edges are encountered.  For
 * more customized control of the edge attributes use add_edge().
 *
 * This returns a "deepcopy" of the edge, node, and
 * graph attributes which attempts to completely copy
 * all of the data and references.
 *
 * This is in contrast to the similar G=DiGraph(D) which returns a
 * shallow copy of the data.
 *
 * @param {boolean=} opt_reciprocal 
 *      If True only keep edges that appear in both directions 
 *      in the original digraph. 
 *
 * @return {!jsnx.classes.Graph} 
 *      An undirected graph with the same name and nodes and
 *      with edge (u,v,data) if either (u,v,data) or (v,u,data)
 *      is in the digraph.  If both edges exist in digraph and
 *      their edge data is different, only one edge is created
 *      with an arbitrary choice of which edge data to use.
 *      You must check and correct for this manually if desired.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.to_undirected = function(opt_reciprocal) {
  var H = new jsnx.classes.Graph();
  H.name(this.name());
  H.add_nodes_from(this);

  var this_pred = this['pred'];
  // reusable tuple
  var t = [];

  if(opt_reciprocal) {
    H.add_edges_from(jsnx.helper.nested_chain(
      this.adjacency_iter(),
      function(nd) {
        t[0] = nd[0];
        return goog.iter.toIterator(nd[1]);
      },
      function(nbrd) {
        if (this_pred.get(t[0]).has(nbrd[0])) {
          t[1] = nbrd[0];
          t[2] = jsnx.helper.deepcopy(nbrd[1]);
          return t;
        }
      }
    ));
  }
  else {
    H.add_edges_from(jsnx.helper.nested_chain(
      this.adjacency_iter(),
      function(nd) {
        t[0] = nd[0];
        return goog.iter.toIterator(nd[1]);
      },
      function(nbrd) {
        t[1] = nbrd[0];
        t[2] = jsnx.helper.deepcopy(nbrd[1]);
        return t;
      }
    ));
  }

  H['graph'] = jsnx.helper.deepcopy(this['graph']);
  H['node'] = jsnx.helper.deepcopy(this['node']);
  return H;
};


/**
 * Return the reverse of the graph.
 *
 * The reverse is a graph with the same nodes and edges
 * but with the directions of the edges reversed.
 *
 * @param {boolean=} opt_copy (default=True)
 *      If True, return a new DiGraph holding the reversed edges.
 *      If False, reverse the reverse graph is created using
 *      the original graph (this changes the original graph).
 *
 * @return {!jsnx.classes.DiGraph} A copy of the graph or the graph itself
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.reverse = function(opt_copy) {
  opt_copy = !goog.isDef(opt_copy) || opt_copy;
  var H;

  if(opt_copy) {
    H = new this.constructor(null, {name: 'Reverse of (' + this.name() + ')'});
    H.add_nodes_from(this);
    H.add_edges_from(jsnx.helper.map(
      this.edges_iter(null, true),
      function(ed) {
        // reuse ed array to save memory
        var t = ed[0];
        ed[0] = ed[1];
        ed[1] = t;
        ed[2] = jsnx.helper.deepcopy(ed[2]);
        return ed;
      }
    ));
    H['graph'] = jsnx.helper.deepcopy(this['graph']);
    H['node'] = jsnx.helper.deepcopy(this['node']);
  }
  else {
    var this_pred = this['pred'];
    var this_succ = this['succ'];

    this['succ'] = this_pred;
    this['pred'] = this_succ;
    this['adj'] = this['succ'];
    H = this;
  }
  return H;
};


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * Notes:
 *
 * The graph, edge or node attributes just point to the original graph.
 * So changes to the node or edge structure will not be reflected in
 * the original graph while changes to the attributes will.
 *
 * To create a subgraph with its own copy of the edge/node attributes use:
 * nx.Graph(G.subgraph(nbunch))
 *
 * If edge attributes are containers, a deep copy can be obtained using:
 * G.subgraph(nbunch).copy()
 *
 * For an inplace reduction of a graph to a subgraph you can remove nodes:
 * G.remove_nodes_from([ n in G if n not in set(nbunch)])
 *
 * @param {jsnx.NodeContainer} nbunch  
 *      A container of nodes which will be iterated through once.
 *
 * @return {jsnx.classes.DiGraph} A subgraph of the graph with the same edge attributes.
 *
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.subgraph = function(nbunch) {
  var bunch = this.nbunch_iter(nbunch);
  // create new graph and copy subgraph into it
  var H = new this.constructor();
  // namespace shortcuts for speed
  var H_succ = H['succ'];
  var H_pred = H['pred'];
  var this_succ = this['succ'];

  // add nodes
  jsnx.helper.forEach(bunch, function(n) {
    H_succ.set(n, new jsnx.contrib.Map());
    H_pred.set(n, new jsnx.contrib.Map());
  });
  // add edges
  H_succ.forEach(function(u, Hnbrs) {
    this_succ.get(u).forEach(function(v, datadict) {
      if(H_succ.has(v)) {
        // add both representations of edge: u-v and v-u
        Hnbrs.set(v, datadict);
        H_pred.get(v).set(u, datadict);
      }
    });
  });
  jsnx.helper.forEach(H, function(n) {
    H['node'].set(n, this['node'].get(n));
  }, this);
  H['graph'] = this['graph'];
  return H;
};
