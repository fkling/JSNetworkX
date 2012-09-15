/*jshint strict:false, sub:true*/

function TestMisc() {
    goog.base(this, 'TestMisc');
}

goog.inherits(TestMisc, BaseTestClass);

//TODO: test_is_string_like ?
//TODO: test_iterable ?
//TODO: test_graph_iterable ?

TestMisc.prototype.test_is_list_of_ints = function() {
    expect(jsnx.utils.is_list_of_ints([1,2,3,42])).toEqual(true);
    expect(jsnx.utils.is_list_of_ints([1,2,3,'kermit'])).toEqual(false);
};

// Not in original tests
TestMisc.prototype.test_cumulative_sum = function() {
    expect(jsnx.toArray(jsnx.utils.cumulative_sum([1,2,3,4])))
          .toEqual([1,3,6,10]);
};

//TODO: test_random_number_distribution

(new TestMisc()).run();
