/*global goog:true, jsnx:true */
// "use strict" prevents using goog.base
/*jshint strict:false */

goog.provide('jsnx.exception');

/**
 * Base class for exceptions in JSNetworkX.
 * @constructor
 * @extends {Error}
 * @export
 */
jsnx.exception.JSNetworkXException = function(message) {
    this.name = 'JSNetworkXException';
    this.message = message;
};
// goog.inherits does not work properly with built in Error function
// (message is ignored)
jsnx.exception.JSNetworkXException.prototype = new Error();
jsnx.exception.JSNetworkXException.prototype.constructor = jsnx.exception.JSNetworkXException;
goog.exportSymbol('jsnx.JSNetworkXException', jsnx.exception.JSNetworkXException);


/**
 * Exception for a serious error in JSNetworkX.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXException}
 * @export
 */
jsnx.exception.JSNetworkXError = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXError';
};
goog.inherits(jsnx.exception.JSNetworkXError, jsnx.exception.JSNetworkXException);
goog.exportSymbol('jsnx.JSNetworkXError', jsnx.exception.JSNetworkXError);

/**
 * Harary, F. and Read, R. "Is the Null Graph a Pointless Concept?" 
 * In Graphs and Combinatorics Conference, George Washington University.
 * New York: Springer-Verlag, 1973.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXException}
 * @export
 */
jsnx.exception.JSNetworkXPointlessConcept = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXPointlessConcept';
};
goog.inherits(jsnx.exception.JSNetworkXPointlessConcept, jsnx.exception.JSNetworkXException);
goog.exportSymbol('jsnx.JSNetworkXPointlessConcept', jsnx.exception.JSNetworkXPointlessConcept);


/**
 * Exception for unexpected termination of algorithms.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXException}
 * @export
 */
jsnx.exception.JSNetworkXAlgorithmError = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXAlgorithmError';
};
goog.inherits(jsnx.exception.JSNetworkXAlgorithmError, jsnx.exception.JSNetworkXException);
goog.exportSymbol('jsnx.JSNetworkXAlgorithmError', jsnx.exception.JSNetworkXAlgorithmError);


/**
 * Exception raised by algorithms trying to solve a problem
 * instance that has no feasible solution.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXAlgorithmError}
 * @export
 */
jsnx.exception.JSNetworkXUnfeasible = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXUnfeasible';
};
goog.inherits(jsnx.exception.JSNetworkXUnfeasible, jsnx.exception.JSNetworkXAlgorithmError);
goog.exportSymbol('jsnx.JSNetworkXUnfeasible', jsnx.exception.JSNetworkXUnfeasible);


/**
 * Exception for algorithms that should return a path when running
 * on graphs where such a path does not exist.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXUnfeasible}
 * @export
 */
jsnx.exception.JSNetworkXNoPath = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXNoPath';
};
goog.inherits(jsnx.exception.JSNetworkXNoPath, jsnx.exception.JSNetworkXUnfeasible);
goog.exportSymbol('jsnx.JSNetworkXNoPath', jsnx.exception.JSNetworkXNoPath);


/**
 * Exception raised by algorithms trying to solve a maximization
 * or a minimization problem instance that is unbounded.
 * @constructor
 * @extends {jsnx.exception.JSNetworkXAlgorithmError}
 * @export
 */
jsnx.exception.JSNetworkXUnbounded = function(message) {
    goog.base(this, message);
    this.name = 'JSNetworkXUnbounded';
};
goog.inherits(jsnx.exception.JSNetworkXUnbounded, jsnx.exception.JSNetworkXAlgorithmError);
goog.exportSymbol('jsnx.JSNetworkXUnbounded', jsnx.exception.JSNetworkXUnbounded);

/*** Simulate Python error classes ***/
/**
 * @constructor
 */
jsnx.exception.KeyError = function(message) {
  this.name = 'KeyError';
  this.message = message;
};
jsnx.exception.KeyError.prototype = new Error();
jsnx.exception.KeyError.prototype.constructor = jsnx.exception.KeyError;
goog.exportSymbol('jsnx.KeyError', jsnx.exception.KeyError);
