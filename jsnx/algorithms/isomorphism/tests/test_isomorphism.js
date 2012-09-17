/*jshint strict:false, sub:true*/
/*global expect:true, goog: true, jsnx:true, BaseTestClass:true*/

var iso = jsnx.algorithms.isomorphism;

function TestIsomorph(name) {
    goog.base(this, name || "TestIsomorph");
}

goog.inherits(TestIsomorph, BaseTestClass);


TestIsomorph.prototype.setUp = function() {
    this.G1 = jsnx.Graph();
    this.G2 = jsnx.Graph();
    this.G3 = jsnx.Graph();
    this.G4 = jsnx.Graph();
    this.G1.add_edges_from([[1,2],[1,3],[1,5],[2,3]]);
    this.G2.add_edges_from([[10,20],[20,30],[10,30],[10,50]]);
    this.G3.add_edges_from([[1,2],[1,3],[1,5],[2,5]]);
    this.G4.add_edges_from([[1,2],[1,3],[1,5],[2,4]]);
};

TestIsomorph.prototype.test_could_be_isomorphic = function() {
    expect(iso.could_be_isomorphic(this.G1, this.G2)).toBe(true);
    expect(iso.could_be_isomorphic(this.G1, this.G3)).toBe(true);
    expect(iso.could_be_isomorphic(this.G1, this.G4)).toBe(false);
    expect(iso.could_be_isomorphic(this.G3, this.G2)).toBe(true);
};

TestIsomorph.prototype.test_fast_could_be_isomorphic = function() {
    expect(iso.fast_could_be_isomorphic(this.G3, this.G2)).toEqual(true);
};

TestIsomorph.prototype.test_faster_could_be_isomorphic = function() {
    expect(iso.faster_could_be_isomorphic(this.G3, this.G2)).toEqual(true);
};

/* TODO:
TestIsomorph.prototype.test_is_isomorphic = function() {
    expect(iso.is_isomorphic(this.G1, this.G2)).toEqual(true);
    expect(iso.is_isomorphic(this.G1, this.G4)).toEqual(false);
};
*/

(new TestIsomorph()).run();

