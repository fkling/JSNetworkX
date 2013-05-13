"use strict";
/**
 * @fileoverview
 *
 * D3(http://mbostock.github.com/d3/) is a powerful library to associate data
 * with elements and provides various helpful methods to visualize the data, 
 * such as color generators, layouts and DOM manipulation methods.
 *
 * Note: D3 must be included before running these functions
 */

goog.provide('jsnx.drawing.jsnx_d3');

goog.require('goog.array');
goog.require('goog.iter');
goog.require('goog.math');
goog.require('goog.object');
goog.require('jsnx.helper');



/**
 * Holds a reference to the last container element for convenience.
 *
 * @type {?(string|Element)}
 * @private
 */
jsnx.drawing.jsnx_d3.last_container_element_ = null;


/**
 * Holds a reference to the last configuration for convenience.
 *
 * @type {Object}
 * @private
 */
jsnx.drawing.jsnx_d3.last_configuration_ = null;



/**
 * A list of graph mutator methods.
 *
 * @type {Array.<string>}
 * @const
 * @private
 */
jsnx.drawing.jsnx_d3.MUTATOR_METHODS_ = ['add_node', 'add_nodes_from', 
    'add_edge', 'add_edges_from', 'remove_node', 'remove_nodes_from',
    'remove_edge', 'remove_edges_from', 'clear'];


/**
 * The name of the attribute the D3 data is assigned to in the node and
 * edge data.
 *
 * @type {string}
 * @const
 * @private
 */
jsnx.drawing.jsnx_d3.D3_DATA_NAME_ = '__d3datum__';


/**
 * Draw graph G with D3.
 *
 *
 * @param {jsnx.classes.Graph} G The graph to draw
 * @param {?Object=} config A dictionary of configuration parameters
 *      for D3. The following options are available:
 *
 *      - element: DOMElement or selector string. REQUIRED
 *                 The element to draw the graph into.
 *      - d3: A reference to D3. Can be used if d3 is not global.
 *      - width: number The width of the drawing area in pixel.
 *               Default is the width of element.
 *      - height: number The height of the drawing are in pixel.
 *                Default is the height of element.
 *      - layout_attr: Object A dictionary of layout attributes.
 *              The default layout is force, so the the attributes
 *              can be size, linkDistance, linkStrength, friction,
 *              charge, theta and gravity. nodes and links are set
 *              through the graph
 *      - nodelist: Array An array of nodes to be drawn. Nodes not in the
 *          Graph are ignored
 *      - node_shape: string Name of a SVG element. Default is circle
 *      - node_attr: Object A dictionary of attributes to set on each
 *          node SVG element. See D3 documentation for more information.
 *      - node_style: Object A dictionary of CSS styles to set on each
 *          node SVG element. See D3 documentation for more information.
 *      - edge_attr: Object
 *      - edge_style: Object
 *      - with_labels: boolean (default=false) Set to true to draw labels
 *          on the nodes. Each label is a SVG text node.
 *      - labels: function or Dictionary ore string to return or retrieve the 
 *          label for each node.
 *      - label_attr: Object
 *      - label_style: Object
 *      - with_edge_labels: boolean
 *      - edge_labels: function or Dictionary or string
 *      - edge_label_attr: Object
 *      - edge_label_style: Object
 *      - weighted: boolean
 *      - weights: string or function
 *      - edge_offset: number or function
 *      - pan_zoom: object with properties `enabled` (bool) and `scale` (bool)
 *
 *  @param {?boolean=} opt_bind Set to true to automatically update
 *      the output upon graph manipulation. Only works for adding nodes or edges
 *      for now.
 * @suppress {checkTypes}
 */
jsnx.drawing.jsnx_d3.draw = function(G, config, opt_bind) {
    if(goog.isBoolean(config)) {
        opt_bind = /** @type {boolean} */ (config);
        config = null;
    }

    config = config || jsnx.drawing.jsnx_d3.last_configuration_ || {};
    var d3 = /** @type d3 */ (config['d3'] || window['d3']);

    var config_ = {};
    jsnx.helper.extend(config_, jsnx.drawing.jsnx_d3.default_config_, config);
    jsnx.drawing.jsnx_d3.last_configuration_ = config;

    if(!d3) {
        throw new Error('D3 requried for draw()');
    }


    if(!goog.isDefAndNotNull(config_.element) &&
       !goog.isDefAndNotNull(jsnx.drawing.jsnx_d3.last_element_)) {
        throw new Error('Output element required for draw()');
    }


    // initialize
    jsnx.drawing.jsnx_d3.last_element_ = goog.object.get(config_, 'element', 
            jsnx.drawing.jsnx_d3.last_element_);

    // remove any possible previous graph
    d3.select(jsnx.drawing.jsnx_d3.last_element_).select('svg.jsnx').remove();


    // set up base elements
    var container = d3.select(jsnx.drawing.jsnx_d3.last_element_),
        d3nodes = [], d3links = [],
        canvas = container
                .append('svg')
                .classed('jsnx', true)
                .attr('pointer-events', 'all'),
        parent_container = canvas.append('g');


    var edge_selection = parent_container
                        .append('g')
                        .classed('edges', true)
                        .selectAll('g.edge'),

        node_selection = parent_container
                        .append('g')
                        .classed('nodes', true)
                        .selectAll('g.node'),
        force = d3.layout.force(),
        width = config_['width'] || parseInt(container.style('width'), 10),
        height = config_['height'] || parseInt(container.style('height'), 10),
        layout_attr = config_['layout_attr'],
        nodelist = config_['nodelist'] || null,
        label_func,
        edge_label_func,
        weight_func,
        directed = G.is_directed(),
        weighted =  config_['weighted'],
        selections = {
            node_selection: node_selection,
            edge_selection: edge_selection
        };

    // determine node label function
    if(config_['with_labels']) {
        var labels =  config_['labels'];
        if(goog.typeOf(labels) === 'object') {
            label_func = function(d) {
                return goog.object.get(labels, d['node'], '');
            };
        }
        else if(goog.isFunction(labels)) {
            label_func = labels;
        }
        else if (goog.isString(labels)) {
            label_func = function(d) {
                return d['data'][labels];
            };
        }
        else {
            label_func = function(d) {
                return d['node'];
            };
        }
    }
    config_['labels'] = label_func;


    // if the graph should be weighted, we need a weight function
    // these will be used as edge lables if no others are provided
    if(weighted) {
        var weights =  config_['weights'];
        if(goog.typeOf(weights) === 'object') {
            weight_func = function(d) {
                return goog.object.get(weights, d['node'], 1);
            };
        }
        else if(goog.isFunction(weights)) {
            weight_func = weights;
        }
        else if (goog.isString(weights)) {
            weight_func = function(d) {
                return goog.object.get(d['data'], weights, 1);
            };
        }
        else {
            weight_func = function(d) {
                return 1;
            };
        }
    }

    // determine edge labels
    if(config_['with_edge_labels']) {
        var elabels = config_['edge_labels'];

        if(weighted && !goog.isDef(elabels)) {
            edge_label_func = weight_func;
        }
        else if(goog.typeOf(elabels) === 'object') {
            edge_label_func = function(d) {
                return goog.object.get(labels, d['node'], '');
            };
        }
        else if(goog.isFunction(elabels)) {
            edge_label_func = elabels;
        }
        else if (goog.isString(elabels)) {
            edge_label_func = function(d) {
                return d['data'][elabels];
            };
        }
        else {
            edge_label_func = function(d) {
                return d['edge'];
            };
        }
        config_['edge_labels'] = edge_label_func;
    }

    // scale the width of the edge according to the weight
    if(weighted && config_['weighted_stroke']) {
        var max_weight = goog.iter.reduce(
            G.edges_iter(null, true), 
            function(u, v) {
                v = weight_func({data: v[2]});
                return u > v ? u : v;
            },
            0
        );
        var scale = d3.scale.linear()
            .range([2, config_['edge_style']['stroke-width']])
            .domain([0, max_weight]);

        config_['edge_style']['stroke-width'] = function(d) {
            return scale(weight_func.call(this, d));
        };
    }

    // remove any possible previous graph
    canvas.select('svg.jsnx').remove();

    // set size and hide the wild movement of nodes at the beginning
    canvas
        .attr('width', width + 'px')
        .attr('height', height + 'px')
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);


    // initialize layout
    // don't let the user set these:
    var exclude = {'size': true, 'nodes': true, 'links': true, 'start': true};

    jsnx.helper.forEach(layout_attr, function(attr) {
        if(!goog.object.containsKey(exclude, attr)) {
            force[attr](layout_attr[attr]);
        }
    });

    force.nodes(d3nodes).links(d3links).size([width, height]);


    // set up zoom and pan behaviour
    var zoom = 1,
        inv_scale = 1; // used to scale nodes and text accordingly

    if(config_['pan_zoom']['enabled']) {
        var scaled = config_['pan_zoom']['scale'];

        // private scope, since these are just helper variables
        (function() {

            var zooming = false,
                zoom_start_scale = 1,
                zoom_start = zoom,
                scale_regex = /scale\([^)]+\)/;

            canvas.call(d3.behavior.zoom().on('zoom', function() {
                var shiftKey = d3.event.sourceEvent.shiftKey,
                    zoomed = (scaled && shiftKey) || !(scaled || shiftKey);

                // if the graph is zoomed, we have to keep track of the 
                // ration it was zoomed by
                if(zoomed && !zooming) {
                    zoom_start_scale = d3.event.scale;
                    zoom_start = zoom;
                    zooming = true;
                }
                else if (!zoomed && zooming) {
                    zooming = false;
                }

                zoom =  zoomed ? zoom_start * (d3.event.scale/zoom_start_scale) : zoom;
                inv_scale = !zoomed ?  zoom / d3.event.scale : inv_scale;

                var tr = d3['event']['translate'];
                parent_container.attr('transform', 'translate(' +  tr[0] + ',' +  tr[1] + ')scale(' + d3.event.scale + ')');
                redraw();
            }));

        }());
    }

    var update_edge_position = goog.nullFunction,
        update_edge_label_position = goog.nullFunction;


          var offset = config_['edge_offset'],
            node_radius = config_['node_attr']['r'],
            node_strw = config_['node_style']['stroke-width'];

        if (config_['node_shape'] === 'circle') {
          if (!goog.isFunction(node_radius)) {
            node_radius = function() {
              return config_['node_attr']['r'];
            };
          }
          if (!goog.isFunction(node_strw)) {
            node_strw = function() {
              return config_['node_style']['stroke-width'];
            };
          }
          offset = function(d) {
            return [node_radius(d.source) + node_strw(d.source), 
                   node_radius(d.target) + node_strw(d.target)];
          };
        }
        else {
          if(goog.isArray(offset)) {
              offset = function() {
                  return  config_['edge_offset'];
              };
          }
          if(goog.isNumber(offset)) {
              offset = function() {
                  return  [config_['edge_offset'], config_['edge_offset']];
              };
          }
        }
        var strw = config_['edge_style']['stroke-width'];
        if (!goog.isFunction(strw)) {
          strw = function() {
            return config_['edge_style']['stroke-width'];
          };
        }
        var label_offset = config_['edge_label_offset'];

    if(directed) { // don't rotate labels and draw curvy lines
        update_edge_position = function() {
            selections.edge_selection.each(function(d) {
                if(d['source'] !== d['target']) {
                    var $this = d3.select(this),
                        x1 = d['source']['x'],
                        y1 = d['source']['y'],
                        x2 = d['target']['x'],
                        y2 = d['target']['y'],
                        angle =  goog.math.angle(x1,y1,x2,y2),
                        dx = Math.sqrt(Math.pow(x2 - x1, 2) +
                                   Math.pow(y2 - y1, 2)),
                        offset_ = offset(d);

                    offset_ = [offset_[0] * inv_scale, offset_[1] * inv_scale];

                    $this.attr('transform', 
                      ['translate(',x1,',',y1,')', 'rotate(', angle,')'].join('')
                    );

                    var shift = strw(d) * inv_scale;
                    var arrow_start_point = dx - offset_[1] - 2*shift;
                    var half_shift = shift/2;
                    $this.select('.line').attr('d', ['M', offset_[0], 0, 'L', offset_[0], -half_shift, 'L', arrow_start_point, -half_shift, 'L', arrow_start_point,  -shift, 'L', dx - offset_[1], 0, 'z'].join(' ')); 

                    var scale = 1/inv_scale;
                    $this.select('text')
                        .attr('x',  (label_offset['x'] * scale) + offset_[0] + (dx*scale - offset_[0] - offset_[1]) / 2)
                        .attr('y', -strw(d)/2 + -label_offset['y'] * scale)
                        .attr('transform', 'scale(' + inv_scale + ')');
                }
            });
        };
    }
    else {
        update_edge_position = function() {
            selections.edge_selection.each(function(d) {
                if(d['source'] !== d['target']) {
                    var $this = d3.select(this),
                        x1 = d['source']['x'],
                        y1 = d['source']['y'],
                        x2 = d['target']['x'],
                        y2 = d['target']['y'],
                        angle =  goog.math.angle(x1,y1,x2,y2),
                        dx = Math.sqrt(Math.pow(x2 - x1, 2) +
                                       Math.pow(y2 - y1, 2)),
                        center = dx/2,
                        offset_ = offset(d);

                    offset_ = [offset_[0] * inv_scale, offset_[1] * inv_scale];

                    var scale = 1/inv_scale;
                    var shift = strw(d) * inv_scale;
                    var flip = angle > 90 && angle < 279;
                    $this.attr('transform', ['translate(',x1,',',y1,')', 'rotate(', angle,')'].join(''));
                    $this.select('.line').attr('d', ['M', offset_[0], shift/4, 'L', offset_[0], -shift/4, 'L', dx - offset_[1], -shift/4, 'L', dx - offset_[1], shift/4, 'z'].join(' ')); 
                    if(config_['with_edge_labels']) {
                        $this.select('text')
                        .attr('x',  ((flip ? 1 : -1) * label_offset['x'] * scale) + offset_[0] + (dx*scale - offset_[0] - offset_[1]) / 2)
                        .attr('y', -strw(d)/4 + -label_offset['y'] * scale)
                          .attr('transform', 'scale(' + inv_scale + ')' + 
                              (flip ? 
                              'rotate(180,' +  center * (1/inv_scale) +',0)' : '')
                          );
                    }
                }
            });
        };
    }

    var redraw = function() {
        // update node position
        selections.node_selection
        .attr("transform", function(d) { 
            return ['translate(',d['x'],',',d['y'],')', 'scale(' , inv_scale , ')'].join(''); 
        });

        update_edge_position();
    };

    force.on('tick', redraw);

    var nodes = G.nodes_iter(),
        edges = G.edges_iter();

    if(nodelist) { // limit drawn nodes, disable binding
        opt_bind = false;
        nodes = G.nbunch_iter(nodelist);
        edges = G.edges_iter(nodelist);
    }

    // update d3 node and link data
    selections.node_selection = jsnx.drawing.jsnx_d3.add_nodes_(G, nodes, force, 
                            node_selection, config_['node_shape'], label_func);

    selections.edge_selection  = jsnx.drawing.jsnx_d3.add_edges_(G, edges, force, 
                                             edge_selection, edge_label_func);

    // apply attributes and styles

    jsnx.drawing.jsnx_d3.update_node_attr_(selections.node_selection, {
        attr: config_['node_attr'],
        style: config_['node_style'],
        label_style: config_['label_style'],
        label_attr: config_['label_attr']
    }, config_['with_labels']);

    jsnx.drawing.jsnx_d3.update_edge_attr_(selections.edge_selection, {
        attr: config_['edge_attr'],
        style: config_['edge_style'],
        label_style: config_['edge_label_style'],
        label_attr: config_['edge_label_attr']
    }, config_['with_edge_labels'], null, directed);

    if(opt_bind) {
        jsnx.drawing.jsnx_d3.bind_(G, force, config_, selections);
    }
    else {
        if(jsnx.drawing.jsnx_d3.is_bound(G)) {
            jsnx.drawing.jsnx_d3.unbind(G);
        }
        else {
            jsnx.drawing.jsnx_d3.clean_(G);
        }
    }

    force.start();

    return force;
};

goog.exportSymbol('jsnx.draw', jsnx.drawing.jsnx_d3.draw);


/**
 * Helper function to create new node objects for the force layout and
 * create the necessary SVG elements.
 * 
 * @param {jsnx.classes.Graph} G 
 * @param {jsnx.NodeContainer} nodes The nodes to include from the Graph
 *      default are all nodes
 * @param {d3.layout.force} force The layout
 * @param {d3.selection} selection D3 DOM node selection of nodes
 * @param {string} node_shape The name of a SVG element to use for the node
 * @param {Function=} opt_label_func A function to extract the value of 
 *     the labels of the nodes. If none is provided, no labels are drawn.
 *
 * @return {!d3.selection} The new selection of SVG elements.
 *
 * @private
*/
jsnx.drawing.jsnx_d3.add_nodes_ = function(G, nodes, force, selection, 
                                           node_shape, opt_label_func) {
    // Get current data
    var data = /** @type {Array} */ (force.nodes());
    // add new data
    jsnx.helper.forEach(nodes, function(n) {
        var d = G['node'].get(n),
        nobj = {'node': n, 'data': d, 'G': G};
        data.push(nobj);
        d[jsnx.drawing.jsnx_d3.D3_DATA_NAME_] = nobj;
    });
    // update data join
    selection = /** @type {d3.selection} */ (selection.data(
      data,
      jsnx.drawing.jsnx_d3.node_key_function
    ));
    // create new elements
    var nsel = selection.enter()
        .append('g')
        .classed('node', true)
        .call(force.drag);

    nsel.append(node_shape).classed('node-shape', true);

    if(opt_label_func) {
        nsel.append('text').text(opt_label_func);
    }

    return selection;
};


/**
 * Helper function to create new edge objects for the force layout.
 * 
 * @param {jsnx.classes.Graph} G 
 * @param {?} edges The nodes to include from the Graph
 *      default are all nodes
 * @param {d3.layout.force} force 
 * @param {d3.selection} selection D3 DOM node selection of nodes
 * @param {Function=} opt_label_func Function to extract text for labels
 *
 * @return {!d3.selection}
 *
 * @private
*/
jsnx.drawing.jsnx_d3.add_edges_ = function(G, edges, force, selection, 
                                                              opt_label_func) {
    // Get current data
    var data = /** @type {Array} */ (force.links());
    // add new data
    jsnx.helper.forEach(edges,  function(ed) {
        var u = ed[0], v = ed[1],
        d = ed[2] || G.get_edge_data(u, v),
        eobj = {
            'edge': [u,v],
            'redge': [v, u],
            'source': G['node'].get(u)[jsnx.drawing.jsnx_d3.D3_DATA_NAME_], 
            'target': G['node'].get(v)[jsnx.drawing.jsnx_d3.D3_DATA_NAME_], 
            'data': d,
            'G': G
        };
        data.push(eobj);
        d[jsnx.drawing.jsnx_d3.D3_DATA_NAME_] = eobj;
    });
    // update data join
    selection = /** @type {d3.selection} */ (selection.data(
      data,
      jsnx.drawing.jsnx_d3.edge_key_function
    ));
    // create new elements
    var esel = selection.enter()
        .append('g')
        .classed('edge', true);


    esel.append('path').classed('line', true);

    if(opt_label_func) {
        esel.append('text').text(opt_label_func);
    }

    return selection;
};


/**
 * Updates attributes of nodes.
 *
 * @param {d3.selection} selection
 * @param {{style, attr, label_style, label_attr}} node_style
 *      Holds the values for various attributes and styles of the node
 *      and its label
 * @param {boolean=} opt_with_labels
 * @param {jsnx.NodeContainer=} opt_nodes a container of nodes. If set, 
 *      only update these nodes.
 * 
 * @private
 */
jsnx.drawing.jsnx_d3.update_node_attr_ = function(
  selection,
  node_style,
  opt_with_labels,
  opt_nodes
) {

    if(goog.isDefAndNotNull(opt_nodes)) {
        var nd = {};
        jsnx.helper.forEach(opt_nodes, function(value) {
            nd[goog.isArrayLike(value) ? value[0] : value] = true;  
        });
        selection = selection.filter(function(d) { 
            return goog.object.containsKey(nd, d['node']);
        });
    }

    var nodes = selection.selectAll('.node-shape');

    goog.object.forEach(node_style.attr, function(value, attr) {
        nodes.attr(attr, value);
    });

    goog.object.forEach(node_style.style, function(value, style) {
        nodes.style(style, value);
    });


    if(opt_with_labels) {
        var text = selection.selectAll('text');
        goog.object.forEach(node_style.label_attr, function(value, attr) {
            text.attr(attr, value);
        });

        goog.object.forEach(node_style.label_style, function(value, style) {
            text.style(style, value);
        });
    }
};


/**
 * Updates attributes of edges.
 *
 * @param {d3.selection} selection
 * @param {{attr, style, label_attr, label_style}} edge_style
 * @param {boolean=} opt_with_edge_labels If true, the label is updated as well
 *      If true, the edge selection is not filtered for reverse edges
 * @param {?=} opt_edges If set, only updates the styles of the provided
 *      edges
 * @param {boolean=} opt_directed
 *
 * @private
 */
jsnx.drawing.jsnx_d3.update_edge_attr_ = function(selection, edge_style, 
                                                  opt_with_edge_labels, 
                                              opt_edges, opt_directed) {

    if(goog.isDefAndNotNull(opt_edges)) {
        var ed = {};
        jsnx.helper.forEach(opt_edges, function(value) {
            ed[[value[0], value[1]]] = true;  
        });
        selection = selection.filter(function(d) { 
            return goog.object.containsKey(ed, d['edge']) || opt_directed || 
                goog.object.containsKey(ed, d['redge']);
        });
    }

    var edges = selection.selectAll('.line');
    goog.object.forEach(edge_style.attr, function(value, attr) {
        edges.attr(attr, value);
    });

    goog.object.forEach(edge_style.style, function(value, style) {
        if (style != 'stroke-width') {
          edges.style(style, value);
        }
    });
    edges.style('stroke-width', 0);

    if(opt_with_edge_labels) {
        var labels = selection.selectAll('text');
        goog.object.forEach(edge_style.label_attr, function(value, attr) {
            labels.attr(attr, value);
        });

        goog.object.forEach(edge_style.label_style, function(value, style) {
            labels.style(style, value);
        });
    }
};


/**
 * Key function to extract the join value for the SVG nodes and the data.
 *
 * @param {Object} d The current datum
 * @return {jsnx.Node}
 *
 * @private
 */
jsnx.drawing.jsnx_d3.node_key_function = function(d) {
    return d['node'];
};


/**
 * Key function to extract the join value for the SVG nodes and the data.
 *
 * @param {Object} d The current datum
 * @return {string}
 *
 * @private
 */
jsnx.drawing.jsnx_d3.edge_key_function = function(d) {
    return d['edge'];
};


/**
 * Helper function to add new node objects for the force layout.
 * 
 * @param {jsnx.classes.Graph} G 
 * @param {jsnx.NodeContainer} nodes to remove from the graph
 * @param {d3.layout.force} force The force the nodes are bound to
 * @param {d3.selection} selection Selection of node elements
 *
 * @return {d3.selection} Updated selection
 *
 * @private
 */
jsnx.drawing.jsnx_d3.remove_nodes_ = function(G, nodes, force, selection) {
    // get current data set
    var data = /** @type {Array} */ (force.nodes());
    // remove items from data
    jsnx.helper.forEach(G.nbunch_iter(nodes), function(n) {
        goog.array.remove(data, G['node'].get(n)[jsnx.drawing.jsnx_d3.D3_DATA_NAME_]);
    });
    // rebind data
    selection = /** @type {d3.selection} */ (selection.data(
      data,
      jsnx.drawing.jsnx_d3.node_key_function
    ));
    // remove SVG elements
    selection.exit().remove();

    return selection;
};


/**
 * Helper function to remove edge objects for the force layout.
 * 
 * @param {jsnx.classes.Graph} G
 * @param {?} edges Edges to remove
 * @param {d3.layout.force} force The force the edges are bound to
 * @param {d3.selection} selection Selection of edge elements 
 *
 * @return {!d3.selection} Updated selection
 *
 * @private
 */
jsnx.drawing.jsnx_d3.remove_edges_ = function(G, edges, force, selection) {
    // get current data set
    var data = /** @type {Array} */ (force.links());
    // remove items from data
    jsnx.helper.forEach(edges, function(ed) {
        goog.array.remove(data, goog.object.get(
            G.get_edge_data(ed[0], ed[1], {}),
            jsnx.drawing.jsnx_d3.D3_DATA_NAME_, 
            null
         ));
    });
    // rebind data
    selection =/** @type d3.selection */ (selection.data(
      data,
      jsnx.drawing.jsnx_d3.edge_key_function
    ));
    // remove SVG elements
    selection.exit().remove();

    return selection;
};



/**
 * Binds the output to the graph. This overrides mutator methods. To "free"
 * the graph, you can call jsnx.unbind (which is public)
 *
 * @param {jsnx.classes.Graph} G A Graph
 * @param {d3.layout.force} force Force layout
 * @param {Object} config The configuration for the output
 * @param {{node_selection:d3.selection, edge_selection:d3.selection }} selections
 *      Various D3 selections
 *
 * @private
 */
jsnx.drawing.jsnx_d3.bind_ = function(G, force, config, selections) {

    jsnx.drawing.jsnx_d3.unbind(G, false);

    var proto = G.constructor.prototype,
        node_shape =  config['node_shape'],
        node_style = {
            attr: config['node_attr'],
            style: config['node_style'],
            label_attr: config['label_attr'],
            label_style: config['label_style']
        },
        edge_style = {
            attr: config['edge_attr'],
            style: config['edge_style'],
            label_attr: config['edge_label_attr'],
            label_style: config['edge_label_style']
        },
        label_func = config['labels'],
        edge_label_func = config['edge_labels'],
        with_labels = config['with_labels'],
        with_edge_labels = config['with_edge_labels'],
        directed = G.is_directed();

    G['add_node'] = G.add_node = 
      /** @this jsnx.classes.Graph */ function(n) {
        var new_node = !this.has_node(n);
        proto['add_node'].apply(this, arguments);

        if(new_node) {
            selections.node_selection = jsnx.drawing.jsnx_d3.add_nodes_(this, 
                [n], force, selections.node_selection, node_shape, label_func);
        }

        // update node attributes
        jsnx.drawing.jsnx_d3.update_node_attr_(selections.node_selection, 
                                               node_style, with_labels, [n]);

       force.start();
    };


    G['add_nodes_from'] = G.add_nodes_from =  
      /** @this jsnx.classes.Graph */ function(nbunch) {
        var new_nodes = goog.array.filter(jsnx.helper.toArray(nbunch), function(n) {
            return !this.has_node(goog.isArrayLike(n) ? n[0] : n);
        }, this);

        proto['add_nodes_from'].apply(this, arguments);

        if(new_nodes.length > 0) { // add new nodes and update
            selections.node_selection = jsnx.drawing.jsnx_d3.add_nodes_(this, 
                new_nodes, force, selections.node_selection, node_shape, label_func);                
        }

        jsnx.drawing.jsnx_d3.update_node_attr_(selections.node_selection, 
                                               node_style, with_labels, nbunch);
       force.start();
    };


    G['add_edge'] = G.add_edge =
      /** @this jsnx.classes.Graph */ function(u, v) {
        var new_edge = !this.has_edge(u, v),
        new_nodes = [];
        if(new_edge) {
            new_nodes = goog.array.filter(u == v ? [u] : [u,v], function(n) {
                return !this.has_node(n);
            }, this);
        }
        proto['add_edge'].apply(G, arguments);

        if(new_nodes.length > 0) {
            selections.node_selection = jsnx.drawing.jsnx_d3.add_nodes_(this, 
                new_nodes, force, selections.node_selection, node_shape, label_func);

            jsnx.drawing.jsnx_d3.update_node_attr_(selections.node_selection, 
                                           node_style, with_labels, new_nodes);
        }

        if(new_edge) {
            selections.edge_selection = jsnx.drawing.jsnx_d3.add_edges_(this, 
                [[u,v]], force, selections.edge_selection, edge_label_func);
        }

        jsnx.drawing.jsnx_d3.update_edge_attr_(selections.edge_selection,  
                                   edge_style, with_edge_labels, [[u,v]], directed);

        force.start();
    };


    G['add_edges_from'] = G.add_edges_from =  
      /** @this jsnx.classes.Graph */ function(ebunch) {
        var new_edges = [], new_nodes = [],
            seen_edges = {}, seen_nodes = {},
            directed = this.is_directed();

        jsnx.helper.forEach(ebunch, function(ed) {
            var u = ed[0], v = ed[1];
            if(!this.has_edge(u, v) && 
               !goog.object.containsKey(seen_edges, [u,v]) && 
                       (directed || !goog.object.containsKey(seen_edges, [v, u]))) {

                new_edges.push([u, v]);
                seen_edges[[u,v]] = true;
                if(!this.has_node(u) && !goog.object.containsKey(seen_nodes, u)) {
                    new_nodes.push(u);
                    seen_nodes[u] = true;
                }
                if(!this.has_node(v) && !goog.object.containsKey(seen_nodes, v)) {
                    new_nodes.push(v);
                    seen_nodes[v] = true;
                }

            }
        }, this);

        proto['add_edges_from'].apply(G, arguments);

        if(new_nodes.length > 0) {
            selections.node_selection = jsnx.drawing.jsnx_d3.add_nodes_(this, 
                                new_nodes, force, selections.node_selection, 
                                                    node_shape, label_func);

            jsnx.drawing.jsnx_d3.update_node_attr_(selections.node_selection, 
                                           node_style, with_labels, new_nodes);
        }

        if(new_edges.length > 0) {
            selections.edge_selection = jsnx.drawing.jsnx_d3.add_edges_(this, 
                new_edges, force, selections.edge_selection, edge_label_func);
        }

        jsnx.drawing.jsnx_d3.update_edge_attr_(selections.edge_selection, 
                                   edge_style, with_edge_labels, new_edges, directed);

        force.start();
    };


    G['remove_node'] = G.remove_node =
      /** @this jsnx.classes.Graph */ function(n) {
        try {
            if(this.has_node(n)) {
                selections.node_selection = jsnx.drawing.jsnx_d3.remove_nodes_(this, 
                                       [n], force, selections.node_selection);

                var edges = this.edges_iter([n]);

                if(this.is_directed()) {
                    edges = goog.iter.chain(edges, this.in_edges_iter([n]));
                }

                selections.edge_selection = jsnx.drawing.jsnx_d3.remove_edges_(this, 
                    edges, force, selections.edge_selection);

                force.resume();
            }
        }
        catch(e) {} // node is not in the graph, pass on to throw appropriate exception
        proto['remove_node'].apply(G, arguments);
    };


    G['remove_nodes_from'] = G.remove_nodes_from =
      /** @this jsnx.classes.Graph */ function(nbunch) {
        try {
            selections.node_selection = jsnx.drawing.jsnx_d3.remove_nodes_(this, 
                                       nbunch, force, selections.node_selection);

           var edges = this.edges_iter(nbunch);
           if(this.is_directed()) {
               edges = goog.iter.chain(edges, this.in_edges_iter(nbunch));
           }

           selections.edge_selection = jsnx.drawing.jsnx_d3.remove_edges_(this, 
               edges, force, selections.edge_selection);

           force.resume();
        }
        catch(e){}
        proto['remove_nodes_from'].apply(G, arguments);
    };


    G['remove_edge'] = G.remove_edge =
      /** @this jsnx.classes.Graph */ function(u,v) {
        try {
            selections.edge_selection = jsnx.drawing.jsnx_d3.remove_edges_(this, 
               [[u,v]], force, selections.edge_selection);

            force.resume();
        }
        catch(e){}
        proto['remove_edge'].apply(G, arguments);
    };


    G['remove_edges_from'] = G.remove_edges_from =
      /** @this jsnx.classes.Graph */ function(ebunch) {
        try {
            selections.edge_selection = jsnx.drawing.jsnx_d3.remove_edges_(
                  this,
                  ebunch,
                  force,
                  selections.edge_selection
            );

            force.resume();
        }
        catch(e){}
        proto['remove_edges_from'].apply(G, arguments);
    };


    G['clear'] = G.clear =  /** @this jsnx.classes.Graph */ function() {
        selections.node_selection = 
          /** @type {d3.selection} */ (selections.node_selection.data(
            [],
            jsnx.drawing.jsnx_d3.node_key_function
        ));
        selections.node_selection.exit().remove();
        selections.edge_selection = 
          /** @type {d3.selection} */ (selections.edge_selection.data(
            [],
            jsnx.drawing.jsnx_d3.edge_key_function
        ));
        selections.edge_selection.exit().remove();
        force.nodes([]).links([]).resume();
        proto['clear'].apply(G, arguments);
    };

    /**
     * @type boolean
     */
    G.bound = true;
};


/**
 * Returns True if the graph is bound to an output.
 *
 * @param {jsnx.classes.Graph} G A Graph
 *
 */
jsnx.drawing.jsnx_d3.is_bound = function(G) {
    return G.bound;
};
goog.exportSymbol('jsnx.is_bound', jsnx.drawing.jsnx_d3.is_bound);


/**
 * Resets mutator methods to the originals
 *
 * @param {jsnx.classes.Graph} G graph
 * @param {boolean=} opt_clean (default=True)
 *    If true, all D3 data is removed from the graph
 *
 */
jsnx.drawing.jsnx_d3.unbind = function(G, opt_clean) {
    if(jsnx.drawing.jsnx_d3.is_bound(G)) {
        var proto = G.constructor.prototype;
        goog.array.forEach(jsnx.drawing.jsnx_d3.MUTATOR_METHODS_, function(m) {
            G[m] = proto[m];
        });
        delete G.bound;
        if(!goog.isDef(opt_clean) || opt_clean) {
            jsnx.drawing.jsnx_d3.clean_(G);
        }
    }
};
goog.exportSymbol('jsnx.unbind', jsnx.drawing.jsnx_d3.unbind);


/**
 * Removes any D3 data from the Graph.
 *
 * @param {jsnx.classes.Graph} G A Graph
 *
 * @private
 */
jsnx.drawing.jsnx_d3.clean_ = function(G) {
    jsnx.helper.forEach(G.nodes_iter(true), function(nd) {
        goog.object.remove(nd[1], jsnx.drawing.jsnx_d3.D3_DATA_NAME_);
    });
    jsnx.helper.forEach(G.edges_iter(null, true), function(ed) {
        goog.object.remove(ed[2], jsnx.drawing.jsnx_d3.D3_DATA_NAME_);
    });
};


/**
 * Default D3 configuration.
 *
 * @type Object
 * @private
 */
jsnx.drawing.jsnx_d3.default_config_ = {
    'layout_attr': {
        'charge': -120,
        'linkDistance': 60
    },
    'node_shape': 'circle',
    'node_attr': {
        'r': 10 // radius of 5
    },
    'node_style': {
        'stroke-width': 2,
        'stroke': '#333',
        'fill': '#999',
        'cursor': 'pointer'
    },
    'edge_attr': {},
    'edge_style': {
        'fill': '#000',
        'stroke-width': 3
    },
    'label_attr': {},
    'label_style': {
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'cursor': 'pointer',
        '-webkit-user-select': 'none',
        'fill': '#000'
    },
    'edge_label_attr': {},
    'edge_label_style': {
        'font-size': '0.8em',
        'text-anchor': 'middle',
        '-webkit-user-select': 'none'
    },
    'edge_label_offset': {
      'x': 0,
      'y': 0.5
    },
    'with_labels': false,
    'with_edge_labels': false,
    'edge_offset': 10,
    'weighted': false,
    'weights': 'weight',
    'weighted_stroke': true,
    'pan_zoom': {
        'enabled': true,
        'scale': true
    }
};
