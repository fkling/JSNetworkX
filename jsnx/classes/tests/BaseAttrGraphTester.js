/*jshint strict:false, node:true*/

var BaseGraphTester = require('./BaseGraphTester');
var assert = require('../../../mocha/assert');
var jsnx = require('../../../jsnetworkx-test');
var h = require('../../../mocha/helper');
var shared = require('./shared');

var BaseAttrGraphTester = h.extend({}, BaseGraphTester, {
  test_weighted_degree: function() {
    var G = new this.Graph();
    G.add_edge(1,2,{weight:2,other:3});
    G.add_edge(2,3,{weight:3,other:4});
    assert.deepEqual(G.degree(null, 'weight').values(), [2,5,3]);
    assert.deepEqual(G.degree(null, 'weight'), new jsnx.Map([[1,2],[2,5],[3,3]]));
    assert.equal(G.degree(1, 'weight'), 2);
    assert.deepEqual(G.degree([1], 'weight'), new jsnx.Map([[1,2]]));

    assert.deepEqual(G.degree(null, 'other').values(), [3,7,4]);
    assert.deepEqual(G.degree(null, 'other'), new jsnx.Map([[1,3],[2,7],[3,4]]));
    assert.equal(G.degree(1, 'other'), 3);
    assert.deepEqual(G.degree([1], 'other'), new jsnx.Map([[1,3]]));
  },

  test_name: function() {
    var G = this.Graph(null, {name:''});
    assert.equal(G.name(),'');
    G = this.Graph(null, {name: 'test'});
    assert.equal(G.toString(), 'test');
    assert.equal(G.name(), 'test');
  },

  test_copy: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = G.copy();
    shared.is_deepcopy(H, G);
    H = new G.constructor(G);
    shared.is_shallow_copy(H,G);
  },

  test_copy_attr: function() {
    var G = this.Graph(null, {foo: []});
    G.add_node(0, {foo: []});
    G.add_edge(1,2, {foo:[]});
    var H = G.copy();
    shared.is_deepcopy(H, G);
    H = new G.constructor(G); // just copy
    shared.is_shallow_copy(H, G);
  },

  test_graph_attr: function() {
    var G = this.K3;
    G.graph['foo'] = 'bar';
    assert.equal(G.graph['foo'], 'bar');
    delete G.graph['foo'];
    assert.deepEqual(G.graph, {});
    var H = this.Graph(null, {foo:'bar'});
    assert.equal(H.graph['foo'], 'bar');

  },

  test_node_attr: function() {
    var G = this.K3;
    G.add_node(1, {foo:'bar'});
    assert.deepEqual(G.nodes(), [0,1,2]);
    assert.deepEqual(G.nodes(true), [[0,{}],[1,{'foo':'bar'}],[2,{}]]);
    G.node.get(1)['foo']='baz';
    assert.deepEqual(G.nodes(true), [[0,{}],[1,{'foo':'baz'}],[2,{}]]);
  },

  test_node_attr2: function() {
    var G = this.K3;
    var a = {'foo':'bar'};
    G.add_node(3, a);
    assert.deepEqual(G.nodes(), [0,1,2,3]);
    assert.deepEqual(
      G.nodes(true),
      [[0,{}],[1,{}],[2,{}],[3,{'foo':'bar'}]]
    );

  },

  test_edge_attr: function() {
    var G = this.Graph();
    G.add_edge(1,2,{foo:'bar'});
    assert.deepEqual(G.edges(true), [[1,2,{'foo':'bar'}]]);
  },

  test_edge_attr2: function() {
    var G = this.Graph();
    G.add_edges_from([[1,2],[3,4]],{foo:'foo'});
    assert.deepEqual(
      h.sorted(G.edges(true)),
      [[1,2,{'foo':'foo'}],[3,4,{'foo':'foo'}]]
    );
  },

  test_edge_attr3: function() {
    var G = this.Graph();
    G.add_edges_from([[1,2,{'weight':32}],[3,4,{'weight':64}]],{foo:'foo'});
    assert.deepEqual(
      G.edges(true),
      [
        [1,2,{'foo':'foo','weight':32}],
        [3,4,{'foo':'foo','weight':64}]
      ]
    );

    G.remove_edges_from([[1,2],[3,4]]);
    G.add_edge(1,2,{data:7,spam:'bar',bar:'foo'});
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data':7,'spam':'bar','bar':'foo'}]]
    );
  },

  test_edge_attr4: function() {
    var G = this.Graph();
    G.add_edge(1,2,{data:7,spam:'bar',bar:'foo'});
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data':7,'spam':'bar','bar':'foo'}]]
    );
    G.get(1).get(2)['data'] = 10;  // OK to set data like this
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data':10,'spam':'bar','bar':'foo'}]]
    );

    G.edge.get(1).get(2)['data'] = 20; // another spelling, "edge"
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data':20,'spam':'bar','bar':'foo'}]]
    );
    G.edge.get(1).get(2)['listdata'] = [20,200];
    G.edge.get(1).get(2)['weight'] = 20;
    assert.deepEqual(
      G.edges(true),
      [[1,2,{'data':20,'spam':'bar',
        'bar':'foo','listdata':[20,200],'weight':20}]]
    );
  },

  test_attr_dict_not_dict: function() {
    // attr_dict must be dict
    var G = this.Graph();
    var edges = [[1,2]];
    assert.throws(function(){
      G.add_edges_from(edges,[]);
    }, jsnx.JSNetworkXError);
  },

  test_to_undirected: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = jsnx.Graph(G);
    shared.is_shallow_copy(H,G);
    H = G.to_undirected();
    shared.is_deepcopy(H,G);
  },

  test_to_directed: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = jsnx.DiGraph(G);
    shared.is_shallow_copy(H,G);
    H = G.to_directed();
    shared.is_deepcopy(H,G);
  },

  test_subgraph: function() {
    var G = this.K3;
    shared.add_attributes(G);
    var H = G.subgraph([0,1,2,5]);
    // assert.equal(H.name, 'Subgraph of ('+G.name+')')
    H.name = G.name;
    shared.graphs_equal(H, G);
    shared.same_attrdict(H, G);
    shared.shallow_copy_attrdict(H, G);

    H = G.subgraph(0);
    assert.deepEqual(H.adj, new jsnx.Map([[0, new jsnx.Map()]]));
    H = G.subgraph([]);
    assert.deepEqual(H.adj, new jsnx.Map());
    assert.notDeepEqual(G.adj, new jsnx.Map());
  },

  test_selfloops_attr: function() {
    var G = this.K3.copy();
    G.add_edge(0,0);
    G.add_edge(1,1,{weight: 2});
    assert.deepEqual(
      G.selfloop_edges(true),
      [[0,0,{}],[1,1,{weight:2}]]
    );
  }
});
module.exports = BaseAttrGraphTester;
