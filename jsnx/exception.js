/*global goog:true, jsnx:true */

goog.provide('jsnx.exception');

/**
 * Base class for exceptions in JSNetworkX.
 * @constructor
 */
jsnx.exception.JSNetworkXException = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXException';
};
goog.inherits(jsnx.exception.JSNetworkXException, Error);


/**
 * Exception for a serious error in JSNetworkX.
 * @constructor
 */
jsnx.exception.JSNetworkXError = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXError';
};
goog.inherits(jsnx.exception.JSNetworkXError, jsnx.exception.JSNetworkXException);

/**
 * Harary, F. and Read, R. "Is the Null Graph a Pointless Concept?" 
 * In Graphs and Combinatorics Conference, George Washington University.
 * New York: Springer-Verlag, 1973.
 * @constructor
 */
jsnx.exception.JSNetworkXPointlessConcept = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXPointlessConcept';
};
goog.inherits(jsnx.exception.JSNetworkXPointlessConcept, jsnx.exception.JSNetworkXException);


/**
 * Exception for unexpected termination of algorithms.
 * @constructor
 */
jsnx.exception.JSNetworkXAlgorithmError = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXAlgorithmError';
};
goog.inherits(jsnx.exception.JSNetworkXAlgorithmError, jsnx.exception.JSNetworkXException);


/**
 * Exception raised by algorithms trying to solve a problem
 * instance that has no feasible solution.
 * @constructor
 */
jsnx.exception.JSNetworkXUnfeasible = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXUnfeasible';
};
goog.inherits(jsnx.exception.JSNetworkXUnfeasible, jsnx.exception.JSNetworkXAlgorithmError);


/**
 * Exception for algorithms that should return a path when running
 * on graphs where such a path does not exist.
 * @constructor
 */
jsnx.exception.JSNetworkXNoPath = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXNoPath';
};
goog.inherits(jsnx.exception.JSNetworkXNoPath, jsnx.exception.JSNetworkXUnfeasible);


/**
 * Exception raised by algorithms trying to solve a maximization
 * or a minimization problem instance that is unbounded.
 * @constructor
 */
jsnx.exception.JSNetworkXUnbounded = function() {
    goog.base(this, arguments);
    this.name = 'JSNetworkXUnbounded';
};
goog.inherits(jsnx.exception.JSNetworkXUnbounded, jsnx.exception.JSNetworkXAlgorithmError);
