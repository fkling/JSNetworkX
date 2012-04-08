/*global describe:true, it:true, beforeEach:true*/
"use strict";
function BaseTestClass(name) {
    this.name_ = name;
}

BaseTestClass.prototype.setUp = function() {};

BaseTestClass.prototype.run = function() {
    var self = this;

    describe(this.name_, function() {
        beforeEach(self.setUp.bind(self));

        for(var prop in self) {
            if(prop.indexOf('test_') === 0) {
                it(prop.replace('test_', ''), self[prop].bind(self));
            }
        }
    });
};

BaseTestClass.prototype.sorted = function(arr, f) {
    arr = jsnx.toArray(arr);
    arr.sort(f);
    return arr;
};
