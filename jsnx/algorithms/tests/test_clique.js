/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

var cnlti = jsnx.convert_node_labels_to_integers;

function TestCliques(name) {
    goog.base(this, name || "TestCliques");
}

goog.inherits(TestCliques, BaseTestClass);

TestCliques.prototype.setUp = function() {
    var z = [3,4,3,4,2,4,2,1,1,1,1];
    this.G = cnlti(jsnx.havel_hakimi_graph(z), /*first_label=*/1);
    this.cl = jsnx.toArray(jsnx.find_cliques(this.G));
    var H = jsnx.complete_graph(6);
    H = jsnx.relabel_nodes(H, {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6});
    H.remove_edges_from([[2,6], [2,5], [2,4], [1,3], [5,3]]);
    this.H = H;
};


TestCliques.prototype.test_find_cliques1 = function() {
    var cl = jsnx.toArray(jsnx.find_cliques(this.G)),
        rcl = jsnx.find_cliques_recursive(this.G);

    expect(this.sorted(cl.map(function(v) {
        v = goog.array.clone(v);
        v.sort();
        return v;
    }))).toEqual(this.sorted(rcl.map(function(v) {
        v = goog.array.clone(v);
        v.sort();
        return v;
    })));

    // Sort values because different browsers iterate over nodes in different
    // order
    expect(cl.map(function(v) {
      v = goog.array.clone(v);
      v.sort();
      return v;
    })).toEqual([['1', '2', '3', '6'], ['2', '4', '6'], ['4', '5', '7'],
                        ['8', '9'], ['10', '11']]);
};


TestCliques.prototype.test_selfloops = function() {
    this.G.add_edge(1,1);
    var cl = jsnx.toArray(jsnx.find_cliques(this.G));
    var rcl = jsnx.find_cliques_recursive(this.G);

    expect(this.sorted(cl.map(function(v) {
        v = goog.array.clone(v);
        v.sort();
        return v;
    }))).toEqual(this.sorted(rcl.map(function(v) {
        v = goog.array.clone(v);
        v.sort();
        return v;
    })));

    expect(cl, [['2','6','1','3'], ['2','6','4'], 
           ['5','4','7'], ['8','9'], ['10','11']]);
}; 


TestCliques.prototype.test_find_cliques2 = function() {
    var hcl = jsnx.toArray(jsnx.find_cliques(this.H));

    expect(this.sorted(hcl.map(function(v) {
        v = goog.array.clone(v);
        v.sort();
        return v;
    }))).toEqual([['1','2'], ['1','4','5','6'],['2','3'],['3','4','6']]);
};


TestCliques.prototype.test_clique_number = function() {
    expect(jsnx.graph_clique_number(this.G)).toBe(4);
    expect(jsnx.graph_clique_number(this.G, this.cl)).toBe(4);
};


TestCliques.prototype.test_number_of_cliques = function() {
    var G = this.G;
    expect(jsnx.graph_number_of_cliques(G)).toBe(5);
    expect(jsnx.graph_number_of_cliques(G, this.cl)).toBe(5);
    expect(jsnx.number_of_cliques(G, 1)).toBe(1);
    expect(goog.object.getValues(jsnx.number_of_cliques(G,[1]))).toEqual([1]); 
    expect(goog.object.getValues(jsnx.number_of_cliques(G,[1,2]))).toEqual([1,2]); 
    expect(jsnx.number_of_cliques(G,[1,2])).toEqual({1:1, 2:2});
    expect(jsnx.number_of_cliques(G,2)).toBe(2);

    expect(jsnx.number_of_cliques(G)).toEqual(
                 {1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                  6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1});

    expect(jsnx.number_of_cliques(G, G.nodes())).toEqual(
                 {1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                  6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1});

    expect(jsnx.number_of_cliques(G, [2,3,4])).toEqual(
                 {2: 2, 3: 1, 4: 2});

    expect(jsnx.number_of_cliques(G, null, this.cl)).toEqual(
                 {1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                  6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1});
    expect(jsnx.number_of_cliques(G, G.nodes(), this.cl)).toEqual(
                 {1: 1, 2: 2, 3: 1, 4: 2, 5: 1,
                  6: 2, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1});
};

//TODO: test_node_clique_number
//TODO: test_cliques_containing_node
//TODO: test_make_clique_bipartite

(new TestCliques()).run();
