/*jshint expr:true*/
/**
 * @fileoverview Externs for D3 V2
 *
 * @externs
 */

/**
 * @typedef {(Element|string)}
 */
var d3Selector;

/**
 * @typedef {(number|string|Function)}
 */
var d3Value;

/**
 * @typedef {Object}
 */
var d3;

// Core classes


/**
 * @param {d3Selector} selector
 * @return {!d3.selection} selector
 */
d3.select = function(selector){};

/**
 * @param {d3Selector} selector
 * @return {!d3.selection} selector
 */
d3.selectAll = function(selector){};


/**
 * @constructor
 * @return {!d3.selection}
 */
d3.selection = function(){};


/**
 * @param {string} key
 * @param {d3Value=} opt_value
 * @return {(string|!d3.selection)}
 */
d3.selection.prototype.attr = function(key, opt_value){};


/**
 * @param {string} value
 * @param {boolean=} opt_add_remove
 * @return {!d3.selection}
 */
d3.selection.prototype.classed = function(value, opt_add_remove){};


/**
 * @param {string} key
 * @param {d3Value=} opt_value
 * @return {(string|!d3.selection)}
 */
d3.selection.prototype.style = function(key, opt_value){};


/**
 * @param {d3Value=} opt_value
 * @return {(string|!d3.selection)}
 */
d3.selection.prototype.text = function(opt_value){};


/**
 * @param {string} name
 * @return {!d3.selection}
 */
d3.selection.prototype.append = function(name){};


/**
 * @return {!d3.selection}
 */
d3.selection.prototype.remove = function(){};


/**
 * @param {Array.<T>=} opt_value
 * @param {function(T)=} opt_key
 * @return {(Array | !d3.selection)}
 * @template T
 */
d3.selection.prototype.data = function(opt_value, opt_key){};


/**
 * @return {!d3.selection}
 */
d3.selection.prototype.enter = function(){};


/**
 * @return {!d3.selection}
 */
d3.selection.prototype.exit = function(){};


/**
 * @param {(d3Selector|function(Object))} selection
 * @return {!d3.selection}
 */
d3.selection.prototype.filter = function(selection){};


/**
 * @param {function(Object)} cb
 * @return {!d3.selection}
 */
d3.selection.prototype.each = function(cb){};


/**
 * @param {string} type
 * @param {function(Object)=} opt_listener
 * @param {boolean=} opt_capture
 * @return {!d3.selection}
 */
d3.selection.prototype.on = function(type, opt_listener, opt_capture){};


/**
 * @return {!d3.selection}
 */
d3.selection.prototype.transition = function(){};


/**
 * @param {d3Selector} selector
 * @return {!d3.selection}
 */
d3.selection.prototype.select = function(selector){};


/**
 * @param {d3Selector} selector
 * @return {!d3.selection}
 */
d3.selection.prototype.selectAll = function(selector){};


/**
 * @param {function()} func
 * @return {!d3.selection}
 */
d3.selection.prototype.call = function(func){};

/**
 * @constructor
 * @extends {d3.selection}
 */
d3.transition = function() {};

/**
 * @param {number} duration
 * @return {!d3.transition}
 */
d3.transition.prototype.duration = function(duration) {};


// Layouts
/**
 * @type {Object}
 */
d3.layout = {};


// Force layout

/**
 * @constructor
 * @return {!d3.layout.force}
 */
d3.layout.force = function(){};

/**
 * @param {Array} size
 * @return {(Array|!d3.layout.force)}
 */
d3.layout.force.prototype.size = function(size){};

/**
 * @param {number} distance
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.linkDistance = function(distance){};

/**
 * @param {number} strength
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.linkStrength = function(strength){};


/**
 * @param {number} friction
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.friction = function(friction){};


/**
 * @param {number} charge
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.charge = function(charge){};


/**
 * @param {number} theta
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.theta = function(theta){};


/**
 * @param {number} gravity
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.gravity = function(gravity){};


/**
 * @param {Array=} opt_nodes
 * @return {(Array|!d3.layout.force)}
 */
d3.layout.force.prototype.nodes = function(opt_nodes){};


/**
 * @param {Array=} opt_links
 * @return {(Array|!d3.layout.force)}
 */
d3.layout.force.prototype.links = function(opt_links){};


/**
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.start = function(){};


/**
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.resume = function(){};


/**
 * @param {string} type
 * @param {function()} listener
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.on = function(type, listener){};


/**
 * @return {!d3.layout.force}
 */
d3.layout.force.prototype.drag = function(){};


/**
 * @typedef {function(?):?}
 */
var d3scale;

// nasty hack to make scales work :-/

/**
 * @param {Array} domain
 * @return {d3scale}
 */
Function.prototype.domain = function(domain) {};

/**
 * @param {Array} range
 * @return {d3scale}
 */
Function.prototype.range = function(range) {};

/**
 * @return {!d3scale}
 */
d3.scale.linear = function() {};


/**
 * @type {Object}
 */
d3.behavior = {};


/**
 * @constructor
 * @return {d3.behavior.zoom}
 */
d3.behavior.zoom = function() {};


/**
 * @param {string} event
 * @param {function(string, function(Object))} listener
 */
d3.behavior.zoom.prototype.on = function(event, listener) {};


// Event object

/**
 * @typedef {Object}
 */
d3.event;


/**
 *  @type number 
 */
d3.event.scale = 0;


/**
 *  @type Object
 */
d3.event.sourceEvent = {
    /** @type boolean */
    shiftKey: false
};
