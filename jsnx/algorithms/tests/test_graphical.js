/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

function TestGraphical(name) {
    goog.base(this, name || "TestGraphical");
}

goog.inherits(TestGraphical, BaseTestClass);


TestGraphical.prototype.test_valid_degree_sequence1 = function() {
    var n = 100,
        p = 0.3;
    for(var i = 0; i < 10; i++) {
        var G = jsnx.erdos_renyi_graph(n, p),
            deg = goog.object.getValues(G.degree());
        expect(jsnx.is_valid_degree_sequence(deg, /*method=*/'eg')).toBe(true);
        expect(jsnx.is_valid_degree_sequence(deg, /*method=*/'hh')).toBe(true);
    }
};

//TODO: test_valid_degree_sequence2
//TODO: test_atlas

TestGraphical.prototype.test_small_graph_true = function() {
    var z = [5,3,3,3,3,2,2,2,1,1,1];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(true);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(true);
    z = [10,3,3,3,3,2,2,2,2,2,2];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(true);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(true);
    z = [1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(true);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(true);
};

TestGraphical.prototype.test_small_graph_false = function() {
    var z = [1000,3,3,3,3,2,2,2,1,1,1];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(false);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(false);
    z = [6,5,4,4,2,1,1,1];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(false);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(false);
    z = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
    expect(jsnx.is_valid_degree_sequence(z, 'hh')).toBe(false);
    expect(jsnx.is_valid_degree_sequence(z, 'eg')).toBe(false);
};


(new TestGraphical()).run();
