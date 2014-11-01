'use strict';


var Graph = require('./graph');
/*jshint ignore:start*/
var Map = require('../_internals/Map');
/*jshint ignore:end*/
var JSNetworkXError = require('../exceptions/JSNetworkXError');

var assign = require('../_internals/assign');
var clear = require('../_internals/clear');
var clone = require('../_internals/clone');
var convert = require('../convert');
var deepcopy = require('../_internals/deepcopy');
var forEach = require('../_internals/forEach');
var isArray = require('../_internals/isArray');
var isBoolean = require('../_internals/isBoolean');
var isPlainObject = require('../_internals/isPlainObject');
var iteratorToArray = require('../_internals/itertools/toArray');
var mapIterator = require('../_internals/itertools/mapIterator');
var next = require('../_internals/itertools/next');
var size = require('../_internals/size');
var sprintf = require('../_internals/sprintf');
var {
  tuple2,
  tuple3,
  tuple3c,
  createTupleFactory
} = require('../_internals/tuple');
var zipIterator = require('../_internals/itertools/zipIterator');

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
class DiGraph extends Graph {

  constructor(opt_data, opt_attr) {
    // makes it possible to call DigGraph without new
    if(!(this instanceof DiGraph)) {
        return new DiGraph(opt_data, opt_attr);
    }

    this.graph = {}; // dictionary for graph attributes
    this.node = new Map(); // dictionary for node attributes
    // We store two adjacency lists:
    // the  predecessors of node n are stored in the dict self.pred
    // the successors of node n are stored in the dict self.succ=self.adj
    this.adj = new Map(); // empty adjacency dictionary
    this.pred = new Map(); // predecessor
    this.succ = this.adj; // successor

    //attempt to load graph with data
    if(opt_data != null) {
        convert.to_networkx_graph(opt_data, this);
    }
    // load graph attributes (must be afte convert)
    assign(this.graph, opt_attr || {});
    this.edge = this.adj;
  }

  /**
   * Holds the graph type (class) name for information.
   * This is compatible to Pythons __name__ property.
   *
   * @type {string}
   */
  static get __name__() {
    return 'DiGraph';
  }

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
  add_node(n, opt_attr_dict={}) {
    if(!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError(
        'The opt_attr_dict argument must be an object.'
      );
    }

    if(!this.succ.has(n)) {
      this.succ.set(n, new Map());
      this.pred.set(n, new Map());
      this.node.set(n, opt_attr_dict);
    }
    else { // update attr even if node already exists
      assign(this.node.get(n), opt_attr_dict);
    }
  }


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
  add_nodes_from(nodes, opt_attr={}) {
    // if an object, only iterate over the keys
    forEach(nodes, function(n) {
      var newnode = !this.succ.has(n);

      // test whether n is a (node, attr) tuple
      if (isArray(n) && n.length === 2 && isPlainObject(n[1])) {
        var nn = n[0];
        var ndict = n[1];

        if (!this.succ.has(nn)) {
          this.succ.set(nn, new Map());
          this.pred.set(nn, new Map());
          var newdict = clone(opt_attr);
          assign(newdict, ndict);
          this.node.set(nn, newdict);
        }
        else {
          var olddict = this.node.get(nn);
          assign(olddict, opt_attr, ndict);
        }
      } else if (newnode) {
        this.succ.set(n, new Map());
        this.pred.set(n, new Map());
        this.node.set(n, clone(opt_attr));
      }
      else {
        assign(this.node.get(n), opt_attr);
      }
    }, this);
  }

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
  remove_node(n) {
    if (this.node.delete(n)) {
      var nbrs = this.succ.get(n);
      nbrs.forEach(function(_, u) {
        this.pred.get(u).delete(n); // remove all edges n-u in digraph
      }, this);
      this.succ.delete(n); // remove node from succ
      this.pred.get(n).forEach(function(_, u) {
        this.succ.get(u).delete(n); // remove all edges n-u in digraph
      }, this);
      this.pred.delete(n); // remove node from pred
    }
    else {
      throw new JSNetworkXError(
        sprintf('The node "%j" is not in the graph', n)
      );
    }
  }

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
  remove_nodes_from(nodes) {
    forEach(nodes, function(n) {
      if (this.succ.has(n)) {
        var succs = this.succ.get(n);

        this.node.delete(n);
        succs.forEach(function(_, u) {
          // remove all edges n-u in digraph
          this.pred.get(u).delete(n);
        }, this);
        this.succ.delete(n); // remove node from succ
        this.pred.get(n).forEach(function(_, u) {
          // remove all edges n-u in digraph
          this.succ.get(u).delete(n);
        }, this);
        this.pred.delete(n); // remove node from pred
      }
    }, this);
  }


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
  add_edge(u, v, opt_attr_dict={}) {
    if (!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError(
        'The top_attr_dict argument must be a plain object.'
      );
    }

    // add nodes
    if (!this.succ.has(u)) {
      this.succ.set(u, new Map());
      this.pred.set(u, new Map());
      this.node.set(u, {});
    }

    if (!this.succ.has(v)) {
      this.succ.set(v, new Map());
      this.pred.set(v, new Map());
      this.node.set(v, {});
    }

    // add the edge
    var datadict = this.adj.get(u).get(v) || {};
    assign(datadict, opt_attr_dict);
    this.succ.get(u).set(v, datadict);
    this.pred.get(v).set(u, datadict);
  }


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
  add_edges_from(ebunch, opt_attr_dict={}) {
    if (!isPlainObject(opt_attr_dict)) {
      throw new JSNetworkXError(
        'The opt_attr_dict argument must be an object.'
      );
    }

    // process ebunch
    forEach(ebunch, function(edge) {
      var length = size(edge);
      var u, v, edge_data;
      if (length === 3) {
        u = edge[0];
        v = edge[1];
        edge_data = edge[2];
      }
      else if (length === 2) {
        u = edge[0];
        v = edge[1];
        edge_data = {};
      }
      else {
        throw new JSNetworkXError(
          sprintf('Edge tuple "%j" must be a 2-tuple or 3-tuple.', edge)
        );
      }

      if (!this.succ.has(u)) {
        this.succ.set(u, new Map());
        this.pred.set(u, new Map());
        this.node.set(u, {});
      }
      if (!this.succ.has(v)) {
        this.succ.set(v, new Map());
        this.pred.set(v, new Map());
        this.node.set(v, {});
      }

      var datadict = this.adj.get(u).get(v) || {};
      assign(datadict, opt_attr_dict, edge_data);
      this.succ.get(u).set(v, datadict);
      this.pred.get(v).set(u, datadict);
    }, this);
  }

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
  remove_edge(u, v) {
    var edge = this.succ.get(u);
    if (edge !== undefined && edge.delete(v)) {
      this.pred.get(v).delete(u);
    }
    else {
      throw new JSNetworkXError(
        sprintf('The edge "%j-%j" is not in the graph', u, v)
      );
    }
  }

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
  remove_edges_from(ebunch) {
    forEach(ebunch, function(edge) {
      var u = edge[0]; // ignore edge data if present
      var v = edge[1];

      try {
        this.succ.get(u).delete(v);
        this.pred.get(v).delete(u);
      }
      catch(ex){
        // pass
      }
    }, this);
  }

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
  has_successor(u, v) {
    return this.succ.has(u) && this.succ.get(u).has(v);
  }

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
  has_predecessor(u, v) {
    return this.pred.has(u) && this.pred.get(u).has(v);
  }

  /**
   * Return an iterator over successor nodes of n.
   *
   * {@code neighbors_iter()} and {@code successors_iter()} are the same.
   *
   * @param {jsnx.Node} n Node
   *
   * @return {!Iterator} Iterator over successor nodes of n
   *
   * @export
   */
  successors_iter(n) {
    var nbrs = this.succ.get(n);
    if (nbrs !== undefined) {
      return nbrs.keys();
    }
    throw new JSNetworkXError(
      sprintf('The node "%j" is not in the digraph.', n)
    );
  }

  /**
   * Return an iterator over predecessor nodes of n.
   *
   * @param {jsnx.Node} n Node
   *
   * @return {!Iterator} Iterator over predecessor nodes of n
   *
   * @export
   */
  predecessors_iter(n) {
    var nbrs = this.pred.get(n);
    if (nbrs !== undefined) {
      return nbrs.keys();
    }
    throw new JSNetworkXError(
      sprintf('The node "%j" is not in the digraph.', n)
    );
  }

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
  successors(n) {
    return iteratorToArray(this.successors_iter(n));
  }

  /**
   * Return list of predecessor nodes of n.
   *
   * @param {jsnx.Node} n Node
   *
   * @return {!Array} List of predecessor nodes of n
   *
   * @export
   */
  predecessors(n) {
    return iteratorToArray(this.predecessors_iter(n));
  }


  // digraph definitions
  /**
   * @see #successors
   *
   * @override
   * @export
   */
  get neighbors() {
    return this.successors;
  }

  /**
   * @see #successors_iter
   *
   * @override
   * @export
   */
  get neighbors_iter() {
    return this.successors_iter;
  }

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
   * @return {!Iterator} An iterator of (u,v) or (u,v,d) tuples of edges.
   *
   * @override
   * @export
   */
  *edges_iter(opt_nbunch, opt_data=false) {
    // handle calls with opt_data being the only argument
    if (isBoolean(opt_nbunch)) {
      opt_data = opt_nbunch;
      opt_nbunch = undefined;
    }

    var nodes_nbrs;

    if (opt_nbunch === undefined) {
      nodes_nbrs = this.adj;
    }
    else {
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, this.adj.get(n))
      );
    }

    for (var node_nbrs of nodes_nbrs) {
      for (var nbr_data of node_nbrs[1]) {
        var result = [node_nbrs[0], nbr_data[0]];
        if (opt_data) {
          result[2] = nbr_data[1];
        }
        yield result;
      }
    }
  }

  // alias out_edges to edges

  /**
   * @see #edges_iter
   * @export
   */
  get out_edges_iter() {
    return this.edges_iter;
  }

  /**
   * @see jsnx.Graph#edges
   * @export
   */
  get out_edges() {
    return this.edges;
  }

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
   * @return {!Iterator} An iterator of (u,v) or (u,v,d) tuples of
   *      incoming edges.
   *
   * @export
   */
  *in_edges_iter(opt_nbunch, opt_data=false) {
    // handle calls with opt_data being the only argument
    if (isBoolean(opt_nbunch)) {
      opt_data = opt_nbunch;
      opt_nbunch = undefined;
    }

    var nodes_nbrs;

    if(opt_nbunch === undefined) {
      nodes_nbrs = this.pred;
    }
    else {
      // reusable tuple
      var t = [];
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, this.pred.get(n))
      );
    }

    for (var node_nbrs of nodes_nbrs) {
      for(var nbr_data of node_nbrs[1]) {
        var result = [nbr_data[0], node_nbrs[0]];
        if (opt_data) {
          result[2] = nbr_data[1];
        }
        yield result;
      }
    }
  }

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
  in_edges(opt_nbunch, opt_data=false) {
    return iteratorToArray(this.in_edges_iter(opt_nbunch, opt_data));
  }

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
   * @return {!Iterator}  The iterator returns two-tuples of (node, degree).
   *
   * @override
   * @export
   */
  degree_iter(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(opt_nbunch == null) {
      nodes_nbrs = zipIterator(this.succ.entries(), this.pred.entries());
    }
    else {
      var tuple2Succ = createTupleFactory(2);
      var tuple2Pred = createTupleFactory(2);
      nodes_nbrs = zipIterator(
        mapIterator(
          this.nbunch_iter(opt_nbunch),
          n => tuple2Succ(n, this.succ.get(n))
        ),
        mapIterator(
          this.nbunch_iter(opt_nbunch),
          n => tuple2Pred(n, this.pred.get(n))
        )
      );
    }

    if (opt_weight == null) {
      return mapIterator(
        nodes_nbrs,
        nd => [nd[0][0], nd[0][1].size + nd[1][1].size]
      );
    }
    else {
      // edge weighted graph - degree is sum of edge weights
      return mapIterator(
        nodes_nbrs,
        function(nd) {
          var succ = nd[0][1];
          var pred = nd[1][1];
          var sum = 0;
          var nbr;

          function sumData(data) {
            var weight = data[opt_weight];
            sum += weight != null ? +weight : 1;
          }

          succ.forEach(sumData);
          pred.forEach(sumData);

          return [nd[0][0], sum];
        }
      );
    }
  }

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
   * @return {Iterator}  The iterator returns two-tuples of (node, in-degree).
   *
   * @export
   */
  in_degree_iter(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if(opt_nbunch == null) {
      nodes_nbrs = this.pred;
    }
    else {
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, this.pred.get(n))
      );
    }

    if (opt_weight == null) {
      return mapIterator(
        nodes_nbrs,
        nd => [nd[0], nd[1].size]
      );
    }
    else {
      return mapIterator(
        nodes_nbrs,
        function(nd) {
          var sum = 0;
          nd[1].forEach(function(data) {
            var weight = data[opt_weight];
            sum += weight != null ? +weight :  1;
          });
          return [nd[0], sum];
        }
      );
    }
  }

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
   * @return {Iterator}  The iterator returns two-tuples of (node, out-degree).
   * @export
   */
  out_degree_iter(opt_nbunch, opt_weight) {
    var nodes_nbrs;

    if (opt_nbunch == null) {
      nodes_nbrs = this.succ;
    }
    else {
      nodes_nbrs = mapIterator(
        this.nbunch_iter(opt_nbunch),
        n => tuple2(n, this.succ.get(n))
      );
    }

    if(opt_weight == null) {
      return mapIterator(
        nodes_nbrs,
        nd => [nd[0], nd[1].size]
      );
    }
    else {
      return mapIterator(
        nodes_nbrs,
        function(nd) {
          var sum = 0;
          nd[1].forEach(function(data) {
            var weight = data[opt_weight];
            sum += weight != null ? +weight :  1;
          });
          return [nd[0], sum];
        }
      );
    }
  }

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
   * @return {(number|Map)}
   *       A dictionary with nodes as keys and in-degree as values or
   *       a number if a single node is specified.
   *
   * @export
   */
  in_degree(opt_nbunch, opt_weight) {
    if (opt_nbunch != null && this.has_node(opt_nbunch)) {
      // return a single node
      return next(this.in_degree_iter(opt_nbunch, opt_weight))[1];
    }
    else {
      return new Map(this.in_degree_iter(opt_nbunch, opt_weight));
    }
  }


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
   * @return {(number|Map)}
   *       A dictionary with nodes as keys and in-degree as values or
   *       a number if a single node is specified.
   *
   * @export
   */
  out_degree(opt_nbunch, opt_weight) {
    if (opt_nbunch != null && this.has_node(opt_nbunch)) {
      // return a single node
      return next(this.out_degree_iter(opt_nbunch, opt_weight))[1];
    }
    else {
      return new Map(this.out_degree_iter(opt_nbunch, opt_weight));
    }
  }

  /**
   * Remove all nodes and edges from the graph.
   *
   * This also removes the name, and all graph, node, and edge attributes.
   *
   * @override
   * @export
   */
  clear() {
    this.succ.clear();
    this.pred.clear();
    this.node.clear();
    clear(this.graph);
  }

  /**
   * Return True if graph is a multigraph, False otherwise.
   *
   * @return {boolean} True if graph is a multigraph, False otherwise.
   *
   * @override
   * @export
   */
  is_multigraph() {
    return false;
  }

  /**
   * Return True if graph is directed, False otherwise.
   *
   * @return {boolean}  True if graph is directed, False otherwise.
   *
   * @override
   * @export
   */
  is_directed() {
    return true;
  }

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
  to_directed() {
    return deepcopy(this);
  }

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
  to_undirected(opt_reciprocal) {
    var H = new Graph();
    H.name = this.name;
    H.add_nodes_from(this);

    var this_pred = this.pred;

    if(opt_reciprocal) {
      H.add_edges_from((function*() {
        for (var node_data of this.adjacency_iter()) {
          var node = node_data[0];
          var predecessors = this_pred.get(node);
          for (var nbr_data of node_data[1]) {
            if (predecessors.has(nbr_data[0])) {
              yield tuple3(node, nbr_data[0], deepcopy(nbr_data[1]));
            }
          }
        }
      }.call(this)));
    }
    else {
      H.add_edges_from((function*() {
        for (var node_data of this.adjacency_iter()) {
          for (var nbr_data of node_data[1]) {
            yield tuple3(node_data[0], nbr_data[0], deepcopy(nbr_data[1]));
          }
        }
      }.call(this)));
    }

    H.graph = deepcopy(this.graph);
    H.node = deepcopy(this.node);
    return H;
  }

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
  reverse(opt_copy=true) {
    var H;
    if(opt_copy) {
      H = new this.constructor(null, {name: 'Reverse of (' + this.name + ')'});
      H.add_nodes_from(this);
      H.add_edges_from(mapIterator(
        this.edges_iter(null, true),
        edge => tuple3c(edge[1], edge[0], deepcopy(edge[2]), edge)
      ));
      H.graph = deepcopy(this.graph);
      H.node = deepcopy(this.node);
    }
    else {
      var this_pred = this.pred;
      var this_succ = this.succ;

      this.succ = this_pred;
      this.pred = this_succ;
      this.adj = this.succ;
      H = this;
    }
    return H;
  }

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
  * @return {jsnx.classes.DiGraph} A subgraph of the graph with the same edge
  *   attributes.
  *
  *
  * @override
  * @export
  */
  subgraph(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor();
    // namespace shortcuts for speed
    var H_succ = H.succ;
    var H_pred = H.pred;

    // add nodes
    for (var n of bunch) {
      H_succ.set(n, new Map());
      H_pred.set(n, new Map());
    }
    // add edges
    for (var unbrs of H_succ) {
      var [u, Hnbrs] = unbrs;
      for (var vdataddict of this.succ.get(u)) {
        var [v, datadict] = vdataddict;
        if (H_succ.has(v)) {
          // add both representations of edge: u-v and v-u
          Hnbrs.set(v, datadict);
          H_pred.get(v).set(u, datadict);
        }
      }
    }

    for (n of H) {
      H.node.set(n, this.node.get(n));
    }
    H.graph = this.graph;
    return H;
  }
}

/**
* @type {Map}
* @export
*/
DiGraph.prototype.pred = null;


/**
* @type {Map}
* @export
*/
DiGraph.prototype.succ = null;

module.exports  = DiGraph;
