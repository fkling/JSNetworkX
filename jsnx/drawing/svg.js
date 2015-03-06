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

import {
  Map,
  Set,
  deepmerge,
  getDefault,
  isArrayLike
} from '../_internals';

var nullFunction = function() {};

function angleFor(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

/**
 * Safely converts an iterator to an array. Because we often use tuples when
 * using generators internally, we have to be careful when converting the
 * generator to an array. Every element has to be converted explicitly.
 */
function toArray(iterator) {
  // shortcut. If the value is actually an array, we can just return it
  if (Array.isArray(iterator)) {
    return iterator;
  }
  var result = [];
  var i = 0;
  for (var value of iterator) {
    result[i++] = Array.isArray(value) ? Array.from(value) : value;
  }
  return result;
}

/**
 * Holds a reference to the last container element for convenience.
 *
 * @type {?(string|Element)}
 * @private
 */
var LAST_ELEMENT = null;

/**
 * Holds a reference to the last configuration for convenience.
 *
 * @type {Object}
 * @private
 */
var LAST_CONFIGURATION = null;

/**
 * A list of graph mutator methods.
 *
 * @type {Array.<string>}
 * @const
 * @private
 */
var MUTATOR_METHODS = [
  'addNode',
  'addNodesFrom',
  'addEdge',
  'addEdgesFrom',
  'removeNode',
  'removeNodesFrom',
  'removeEdge',
  'removeEdgesFrom',
  'clear'
];

/**
 * The name of the attribute the D3 data is assigned to in the node and
 * edge data.
 *
 * @type {string}
 */
const D3_DATA_NAME = '__d3datum__';

/**
 * Keep a reference to d3.
 */
var d3 = global.d3;

/**
 * Draw graph G with D3.
 *
 * This method draws `G` with the provided `options`. If `optBind` is set to
 * `true`, changes to the graph structure will automatically update the
 * visualization.
 *
 * Returns the force layout used to compute the position of the nodes.
 *
 * The following options are available:
 *
 * - element (Element|String): This option is **required**. Specifies the
 *   container of the visualization. A string is interpreted as CSS selector.
 * - d3 (d3): Use to explicitly pass a reference to D3. If not present, the
 *   global variable d3 will be used instead.
 * - width (number): The width of the canvas in pixels. Defaults to the width
 *   of the container.
 * - height (number): The height of the canvas in pixels. Defaults to the
 *   height of the container.
 * - layoutAttr (Object): Layout options. The default layout is "force", so
 *   the options size, linkDistance, linkStrength, friction, charge, theta
 *   and gravity can be set. For example, setting `{linkDistance: 10}` will call
 *   `force.linkDistance(10)`.
 * - nodelist (Iterable): An iterable of nodes. If present, only nodes in that
 *   list will be drawn.
 * - nodeShape (string): The tag name of the SVG element to be used as nodes.
 *   Defaults to "circle".
 * - nodeAttr (Object): The attributes to set on the node SVG element. This 
 *   object is passed along to D3's `.attr()` method.
 * - nodeStyle (Object): The style properties to set on the node SVG element.
 *   This object is passed along to D3's `.style()` method.
 * - edgeAttr (Object): The attributes to set on an edge SVG element. Edges are
 *   represented by SVG path elements.
 * - edgeStyle (Object): The style properties to set on the edge SVG element.
 *   Note: Even though the edge element is a SVG path element, you cannot set
 *   `stroke-width` to set the stroke width. Instead, the value of
 *   `stroke-width` is used as maximum value for the edge width. 
 * - withLabels (boolean): Whether or not to draw node labels. SVG text elements
 *   are used for labels.
 * - labels (string|Object|function): The node labels to use.
 *   If `withLabels` is `true`, but `labels` is not present, defaults to the
 *   node itself.
 *   If a string is passed, the value of the property of the node data with the
 *   same name will be used.
 *   If an object is passed, the label is looked up in the object using the node
 *   as property name.
 *   If a function is passed, it gets called and passed the corresponding D3
 *   data object.
 * - labelAttr (Object): Like `nodeAttr` but for the label nodes. Labels are
 *   represented by SVG text nodes.
 * - labelStyle (Object): Like `nodeStyle` but for the label nodes. Labels are
 *   represented by SVG text nodes.
 * - withEdgeLabels (boolean): See `withLabels`, but for edges.
 * - edgeLabels (string|Object|function): See `labels`.
 * - edgeLabelAttr (Object): Like `labelAttr`.
 * - edgeLabelStyle (Object): Like `labelStyle`.
 * - weighted (boolean): Whether the edge width depends on the weight of the
 *   edge. The max and min weight are automatically computed. This is a
 *   convenience option so that you don't have to compute the edge weights
 *   yourself.
 * - weights (string|function): Specifies the weight for each edge.
 *   If `weighted` is `true` but `weights` is not present, defaults to
 *   `"weight"`.
 *   If a string is passed, the value of the property of the edge data with the
 *   same name is used as weight.
 *   If a function is passed, it gets called and passed the corresponding D3
 *   data object.
 * - edgeOffset (number|function): The distance in pixels between the edge start
 *   and the node. If not set and `nodeShape` is a `"circle"`, the offset will
 *   be automatically computed based on the radius.
 *   If a different shape for nodes is used it might be necessary to set the
 *   offset manually.
 * - edgeLabelOffset (number|function): By default edge labels are drawing in
 *   in the center of the edge. Can be used to adjust the position.
 * - panZoom (Object):
 *      - enabled (boolean): Enables panning and zooming of the canvas.
 *      - scale (boolean): Whether nodes and labels should keep their size 
 *        when zooming or not.
 *
 * @param {jsnx.classes.Graph} G The graph to draw
 * @param {?Object=} config A dictionary of configuration parameters.
 * @param {?boolean=} optBind Set to true to automatically update
 *      the output upon graph manipulation. Only works for adding nodes or edges
 *      for now.
 * @return {d3.layout.force}
 */
export function draw(G, config, optBind) {
  if (typeof config === 'boolean') {
      optBind = config;
      config = null;
  }

  config = config || LAST_CONFIGURATION || {};
  LAST_CONFIGURATION = config;
  if (config.d3) {
    d3 = config.d3;
  }
  config = deepmerge({}, DEFAULT_CONFIG, config);

  if (!d3) {
    throw new Error('D3 requried for draw()');
  }

  if (config.element == null && LAST_ELEMENT == null) {
    throw new Error('Output element required for draw()');
  }

  // initialize
  LAST_ELEMENT = config.element || LAST_ELEMENT;

  // remove any possible previous graph
  d3.select(LAST_ELEMENT).select('svg.jsnx').remove();

  // set up base elements
  var container = d3.select(LAST_ELEMENT);
  var d3nodes = [];
  var d3links = [];
  var canvas = container
    .append('svg')
    .classed('jsnx', true)
    .attr('pointer-events', 'all');
  var parent_container = canvas.append('g');
  var edge_selection = parent_container
    .append('g')
    .classed('edges', true)
    .selectAll('g.edge');
  var node_selection = parent_container
    .append('g')
    .classed('nodes', true)
    .selectAll('g.node');
  var force = d3.layout.force();
  var width = config.width || parseInt(container.style('width'), 10);
  var height = config.height || parseInt(container.style('height'), 10);
  var layout_attr = config.layoutAttr;
  var nodelist = config.nodelist || null;
  var label_func;
  var edge_label_func;
  var weight_func;
  var directed = G.isDirected();
  var weighted =  config.weighted;
  var selections = {
    node_selection: node_selection,
    edge_selection: edge_selection
  };

  // determine node label function
  if (config.withLabels) {
    var labels =  config.labels;
    switch (typeof labels) {
      case 'object':
        label_func = function(d) {
          return getDefault(labels[d.node], '');
        };
        break;
      case 'function':
        label_func = labels;
        break;
      case 'string':
        label_func = function(d) {
          return d.data[labels];
        };
        break;
      default:
        label_func = function(d) {
          return d.node;
        };
    }
  }
  config.labels = label_func;

  // if the graph should be weighted, we need a weight function
  // these will be used as edge labels if no others are provided
  if (weighted) {
    var weights =  config.weights;
    switch (typeof weigths) {
      case 'object':
        weight_func = function(d) {
          return getDefault(weights[d.node], 1);
        };
        break;
      case 'function':
        weight_func = weights;
        break;
      case 'string':
        weight_func = function(d) {
          return getDefault(d.data[weights], 1);
        };
        break;
      default:
        weight_func = function(d) {
          return 1;
        };
    }
  }

  // determine edge labels
  if (config.withEdgeLabels) {
    var elabels = config.edgeLabels;

    if (weighted && elabels == null) {
      edge_label_func = weight_func;
    }
    else {
      switch (typeof elabels) {
        case 'object':
          edge_label_func = function(d) {
            return getDefault(labels[d.node], '');
          };
          break;
        case 'function':
          edge_label_func = elabels;
          break;
        case 'string':
          edge_label_func = function(d) {
            return d.data[elabels];
          };
          break;
        default:
          edge_label_func = function(d) {
            return d.edge;
          };
      }
    }
    config.edgeLabels = edge_label_func;
  }

  // scale the width of the edge according to the weight
  if (weighted && config.weightedStroke) {
    var max_weight = 1;
    for (let {u,v,data} of G.edgesIter(null, true)) {
      let weight = weight_func({data});
      if (weight > max_weight) {
        max_weight = weight;
      }
    }
    var scale = d3.scale.linear()
      .range([2, config.edgeStyle['stroke-width']])
      .domain([0, max_weight]);

    config.edgeStyle['stroke-width'] = function(d) {
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
  var exclude = {
    size: true,
    nodes: true,
    links: true,
    start: true
  };

  for (let attr in layout_attr) {
    if (exclude[attr] !== true) {
      force[attr](layout_attr[attr]);
    }
  }
  force.nodes(d3nodes).links(d3links).size([width, height]);

  // set up zoom and pan behaviour
  var zoom = 1;
  var inv_scale = 1; // used to scale nodes and text accordingly

  if (config.panZoom.enabled) {
    let scaled = config.panZoom.scale;
    let zooming = false;
    let zoom_start_scale = 1;
    let zoom_start = zoom;

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

      var tr = d3.event.translate;
      parent_container.attr(
        'transform',
        'translate(' +  tr[0] + ',' +  tr[1] + ')scale(' + d3.event.scale + ')'
      );
      redraw();
    }));
  }

  var update_edge_position = nullFunction;
  var offset = config.edgeOffset;
  var node_radius = config.nodeAttr.r;
  var node_strw = config.nodeStyle['stroke-width'];

  if (config.nodeShape === 'circle') {
    if (typeof node_radius !== 'function') {
      node_radius = function() {
        return config.nodeAttr.r;
      };
    }
    if (typeof node_strw !== 'function') {
      node_strw = function() {
        return config.nodeStyle['stroke-width'];
      };
    }
    offset = function(d) {
      return [
        node_radius(d.source) + node_strw(d.source),
        node_radius(d.target) + node_strw(d.target)
      ];
    };
  }
  else {
    if (Array.isArray(offset)) {
      offset = function() {
        return  config.edgeOffset;
      };
    }
    else if (typeof offset === 'number') {
      offset = function() {
        return  [config.edgeOffset, config.edgeOffset];
      };
    }
  }
  var strw = config.edgeStyle['stroke-width'];
  if (typeof strw !== 'function') {
    strw = function() {
      return config.edgeStyle['stroke-width'];
    };
  }
  var label_offset = config.edgeLabelOffset;

  if (directed) { // don't rotate labels and draw curvy lines
    update_edge_position = function() {
      selections.edge_selection.each(function(d) {
        if (d.source !== d.target) {
          var $this = d3.select(this);
          var x1 = d.source.x;
          var y1 = d.source.y;
          var x2 = d.target.x;
          var y2 = d.target.y;
          var angle = angleFor(x1, y1, x2, y2);
          var dx = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
          );
          var offset_ = offset(d);

          offset_ = [offset_[0] * inv_scale, offset_[1] * inv_scale];

          $this.attr(
            'transform',
            ['translate(',x1,',',y1,')', 'rotate(', angle,')'].join('')
          );

          var shift = strw(d) * inv_scale;
          var arrow_start_point = dx - offset_[1] - 2*shift;
          var half_shift = shift/2;
          $this.select('.line').attr('d', [
              'M', offset_[0], 0,
              'L', offset_[0], -half_shift,
              'L', arrow_start_point, -half_shift,
              'L', arrow_start_point, -shift,
              'L', dx - offset_[1], 0,
              'z'
          ].join(' '));

          var scale = 1/inv_scale;
          $this.select('text')
            .attr('x', (label_offset.x * scale) + offset_[0] + (dx*scale - offset_[0] - offset_[1]) / 2)
            .attr('y', -strw(d)/2 + -label_offset.y * scale)
            .attr('transform', 'scale(' + inv_scale + ')');
        }
      });
    };
  }
  else {
    update_edge_position = function() {
      selections.edge_selection.each(function(d) {
        if (d.source !== d.target) {
          var $this = d3.select(this);
          var x1 = d.source.x;
          var y1 = d.source.y;
          var x2 = d.target.x;
          var y2 = d.target.y;
          var angle = angleFor(x1, y1, x2, y2);
          var dx = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
          );
          var center = dx/2;
          var offset_ = offset(d);

          offset_ = [offset_[0] * inv_scale, offset_[1] * inv_scale];

          var scale = 1/inv_scale;
          var shift = strw(d) * inv_scale;
          var flip = angle > 90 && angle < 279;
          $this.attr('transform', [
            'translate(',x1,',',y1,')',
            'rotate(', angle,')'
          ].join(''));
          $this.select('.line').attr('d', [
            'M', offset_[0], shift/4,
            'L', offset_[0], -shift/4,
            'L', dx - offset_[1], -shift/4,
            'L', dx - offset_[1], shift/4,
            'z'
          ].join(' '));
          if (config.withEdgeLabels) {
            $this.select('text')
              .attr('x',  ((flip ? 1 : -1) * label_offset.x * scale) + offset_[0] + (dx*scale - offset_[0] - offset_[1]) / 2)
              .attr('y', -strw(d)/4 + -label_offset.y * scale)
              .attr('transform', 'scale(' + inv_scale + ')' +
                (flip ? 'rotate(180,' +  center * (1/inv_scale) +',0)' : '')
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
        return [
          'translate(',d.x,',',d.y,')',
          'scale(' , inv_scale , ')'
        ].join('');
    });

    update_edge_position();
  };

  force.on('tick', redraw);

  var nodes = G.nodesIter();
  var edges = G.edgesIter();

  if (nodelist) { // limit drawn nodes, disable binding
    optBind = false;
    nodes = G.nbunch_iter(nodelist);
    edges = G.edges_iter(nodelist);
  }

  // update d3 node and link data
  selections.node_selection = addNodes(
    G,
    nodes,
    force,
    node_selection,
    config
  );

  selections.edge_selection = addEdges(
    G,
    edges,
    force,
    edge_selection,
    edge_label_func
  );

  // apply attributes and styles
  updateNodeAttr(selections.node_selection, config);

  updateEdgeAttr(selections.edge_selection, config, null, directed);

  if (optBind) {
    bind(G, force, config, selections);
  }
  else {
    if (isBound(G)) {
      unbind(G);
    }
    else {
      clean(G);
    }
  }

  force.start();

  return force;
}

/**
* Helper function to create new node objects for the force layout and
* create the necessary SVG elements.
*
* @param {Graph} G
* @param {Iterable} nodes The nodes to include from the Graph
*      default are all nodes
* @param {d3.layout.force} force The layout
* @param {d3.selection} selection D3 DOM node selection of nodes
* @param {Object} Drawing configuration
*
* @return {!d3.selection} The new selection of SVG elements.
*/
function addNodes(G, nodes, force, selection, config) {
  // Get current data
  var layoutNodes = force.nodes();
  // add new data
  for (let node of nodes) {
    let data = G.node.get(node);
    let nobj = {node, data, G};
    layoutNodes.push(nobj);
    data[D3_DATA_NAME] = nobj;
  }
  // update data join
  selection = selection.data(layoutNodes, nodeKeyFunction);
  // create new elements
  var drag = force.drag()
    .on("dragstart", function(d) {
      // Prevent pan if node is dragged
      d3.event.sourceEvent.stopPropagation();
      if (config.stickyDrag) {
        d.fixed = true;
        d3.select(this).classed("fixed", true);
      }
    });
  var nsel = selection.enter()
    .append('g')
    .classed('node', true)
    .call(drag);

  nsel.append(config.nodeShape).classed('node-shape', true);

  if (config.labels) {
    nsel.append('text').text(config.labels);
  }

  return selection;
}

/**
* Helper function to create new edge objects for the force layout.
*
* @param {Graph} G
* @param {Iterable} edges The nodes to include from the Graph
*      default are all nodes
* @param {d3.layout.force} force
* @param {d3.selection} selection D3 DOM node selection of nodes
* @param {Function=} opt_label_func Function to extract text for labels
*
* @return {!d3.selection}
*/
function addEdges(G, edges, force, selection, optLabelFunc) {
  // Get current data
  var layoutLinks = force.links();
  // add new data
  for (let [u, v, data] of edges) {
    data = data || G.getEdgeData(u, v);
    let eobj = {
      edge: [u, v],
      source: G.node.get(u)[D3_DATA_NAME],
      target: G.node.get(v)[D3_DATA_NAME],
      data,
      G
    };
    layoutLinks.push(eobj);
    data[D3_DATA_NAME] = eobj;
  }
  // update data join
  selection = selection.data(layoutLinks, edgeKeyFunction);
  // create new elements
  var esel = selection.enter()
    .append('g')
    .classed('edge', true);
  esel.append('path').classed('line', true);

  if (optLabelFunc) {
    esel.append('text').text(optLabelFunc);
  }
  return selection;
}

/**
* Updates attributes of nodes.
*
* @param {d3.selection} selection
* @param {Object} config
* @param {Iterable=} opt_nodes a container of nodes. If set,
*      only update these nodes.
*/
function updateNodeAttr(selection, config, optNodes) {
  if (optNodes != null) {
    var newNodes = new Set();
    for (let node of optNodes) {
      newNodes.add(isArrayLike(node) ? node[0] : node);
    }
    selection = selection.filter(d => newNodes.has(d.node));
  }
  selection.selectAll('.node-shape')
    .attr(config.nodeAttr)
    .style(config.nodeStyle);

  if (config.withLabels) {
    selection.selectAll('text')
      .attr(config.labelAttr)
      .style(config.labelStyle);
  }
}


/**
* Updates attributes of edges.
*
* @param {d3.selection} selection
* @param {Object} config
* @param {?=} optEdges If set, only updates the styles of the provided
*      edges
* @param {boolean=} optDirected
*/
function updateEdgeAttr(selection, config, optEdges, optDirected) {
  if (optEdges != null) {
    var newEdges = new Map();
    for (let [u, v] of optEdges) {
      newEdges.set(u, v);
    }
    selection = selection.filter(
      ({edge}) => newEdges.get(edge[0]) === edge[1] || optDirected ||
        newEdges.get(edge[1]) === edge[0]
    );
  }

  selection.selectAll('.line')
    .attr(config.edgeAttr)
    .style(config.edgeStyle)
    .style('stroke-width', 0);

  if (config.withEdgeLabels) {
    selection.selectAll('text')
      .attr(config.edgeLabelAttr)
      .style(config.edgeLabelStyle);
  }
}

/**
* Key function to extract the join value for the SVG nodes and the data.
*
* @param {Object} d The current datum
* @return {Node}
*/
function nodeKeyFunction(d) {
  return d.node;
}

/**
* Key function to extract the join value for the SVG nodes and the data.
*
* @param {Object} d The current datum
* @return {Array}
*/
function edgeKeyFunction(d) {
  return d.edge;
}

/**
* Helper function to remove node objects for the force layout.
*
* @param {Graph} G
* @param {Iterable} nodes to remove from the graph
* @param {d3.layout.force} force The force the nodes are bound to
* @param {d3.selection} selection Selection of node elements
*
* @return {d3.selection} Updated selection
*/
function removeNodes(G, nodes, force, selection) {
  // get current data set
  var data = force.nodes();

  // remove items from data
  for (let node of G.nbunchIter(nodes)) {
    let index = data.indexOf(G.node.get(node)[D3_DATA_NAME]);
    if (index > -1) {
      data.splice(index, 1);
    }
  }

  // rebind data
  selection = selection.data(data, nodeKeyFunction);
  // remove SVG elements
  selection.exit().remove();
  return selection;
}

/**
* Helper function to remove edge objects for the force layout.
*
* @param {jsnx.classes.Graph} G
* @param {?} edges Edges to remove
* @param {d3.layout.force} force The force the edges are bound to
* @param {d3.selection} selection Selection of edge elements
*
* @return {!d3.selection} Updated selection
*/
function removeEdges(G, edges, force, selection) {
  // get current data set
  var data = force.links();
  // remove items from data
  for (let [u,v] of edges) {
    let index = data.indexOf(G.getEdgeData(u, v, {})[D3_DATA_NAME]);
    if (index > -1) {
      data.splice(index, 1);
    }
  }
  // rebind data
  selection = selection.data(data, edgeKeyFunction);
  // remove SVG elements
  selection.exit().remove();
  return selection;
}

/**
* Binds the output to the graph. This overrides mutator methods. To "free"
* the graph, you can call jsnx.unbind (which is public)
*
* @param {Graph} G A Graph
* @param {d3.layout.force} force Force layout
* @param {Object} config The configuration for the output
* @param {{node_selection:d3.selection, edge_selection:d3.selection }} selections
*   Various D3 selections
*/
function bind(G, force, config, selections) {
  unbind(G, false);

  var proto = G.constructor.prototype;
  var edge_label_func = config.edgeLabels;
  var directed = G.isDirected();

  G.addNode = function(n, optAttr) {
    var new_node = !this.hasNode(n);
    proto.addNode.call(this, n, optAttr);

    if (new_node) {
      selections.node_selection = addNodes(
        this,
        [n],
        force,
        selections.node_selection,
        config
      );
    }

    // update node attributes
    updateNodeAttr(selections.node_selection, config, [n]);

    force.start();
  };

  G.addNodesFrom = function(nbunch, optAttr) {
    nbunch = toArray(nbunch);
    var new_nodes = nbunch.filter(
      node => !this.hasNode(isArrayLike(node) ? node[0] : node)
    );

    proto.addNodesFrom.call(this, nbunch, optAttr);

    if(new_nodes.length > 0) { // add new nodes and update
      selections.node_selection = addNodes(
        this,
        new_nodes,
        force,
        selections.node_selection,
        config
      );
    }

    updateNodeAttr(selections.node_selection, config, nbunch);
    force.start();
  };

  G.addEdge = function(u, v, optAttr) {
    var new_edge = !this.hasEdge(u, v);
    var edges = [[u,v]];
    var new_nodes = new_edge ?
      (u === v ? [u] : edges[0]).filter(node => !this.hasNode(node)) :
      [];
    proto.addEdge.call(G, u, v, optAttr);

    if(new_nodes.length > 0) {
      selections.node_selection = addNodes(
        this,
        new_nodes,
        force,
        selections.node_selection,
        config
      );

      updateNodeAttr(selections.node_selection, config, new_nodes);
    }

    if (new_edge) {
      selections.edge_selection = addEdges(
        this,
        edges,
        force,
        selections.edge_selection,
        edge_label_func
      );
    }

    updateEdgeAttr(selections.edge_selection, config, edges, directed);
    force.start();
  };

  G.addEdgesFrom = function(ebunch, optAttr) {
      var new_edges = [];
      var new_nodes = [];
      var seen_edges = new Map();
      var seen_nodes = new Set();
      var directed = this.isDirected();

      ebunch = toArray(ebunch);

      for (var [u, v] of ebunch) {
        if (!this.hasEdge(u, v) &&
            seen_edges.get(u) !== v &&
            (directed || seen_edges.get(v) === u)
        ) {
          new_edges.push([u, v]);
          seen_edges.set(u, v);
          if (!this.hasNode(u) && !seen_nodes.has(u)) {
            new_nodes.push(u);
            seen_nodes.add(u);
          }
          if (!this.hasNode(v) && !seen_nodes.has(v)) {
            new_nodes.push(v);
            seen_nodes.add(v);
          }
        }
      }

      proto.addEdgesFrom.call(G, ebunch, optAttr);

      if(new_nodes.length > 0) {
        selections.node_selection = addNodes(
          this,
          new_nodes,
          force,
          selections.node_selection,
          config
        );

        updateNodeAttr(selections.node_selection, config, new_nodes);
      }

      if (new_edges.length > 0) {
        selections.edge_selection = addEdges(
          this,
          new_edges,
          force,
          selections.edge_selection,
          edge_label_func
        );
      }

      updateEdgeAttr(selections.edge_selection, config, new_edges, directed);
      force.start();
  };

  G.removeNode = function(n) {
    if (this.hasNode(n)) {
      selections.node_selection = removeNodes(
        this,
        [n],
        force,
        selections.node_selection
      );
      var edges = this.edgesIter([n]);

      if (this.isDirected()) {
        edges = (function*(G, edges) {
          yield* edges;
          yield* G.inEdgesIter([n]);
        }(this, edges));
      }

      selections.edge_selection = removeEdges(
        this,
        edges,
        force,
        selections.edge_selection
      );

      force.resume();
    }
    proto.removeNode.call(this, n);
  };

  G.removeNodesFrom = function(nbunch) {
    nbunch = toArray(nbunch);
    selections.node_selection = removeNodes(
      this,
      nbunch,
      force,
      selections.node_selection
    );

    var edges = this.edgesIter(nbunch);
    if (this.isDirected()) {
        edges = (function*(G, edges) {
          yield* edges;
          yield* G.inEdgesIter(nbunch);
        }(this, edges));
    }

    selections.edge_selection = removeEdges(
      this,
      edges,
      force,
      selections.edge_selection
    );

    force.resume();
    proto.removeNodesFrom.call(this, nbunch);
  };

  G.removeEdge = function(u, v) {
    selections.edge_selection = removeEdges(
      this,
      [[u,v]],
      force,
      selections.edge_selection
    );

    force.resume();
    proto.removeEdge.call(this, u, v);
  };

  G.removeEdgesFrom = function(ebunch) {
    ebunch = toArray(ebunch);
    selections.edge_selection = removeEdges(
      this,
      ebunch,
      force,
      selections.edge_selection
    );

    force.resume();
    proto.removeEdgesFrom.call(G, ebunch);
  };

  G.clear = function() {
    selections.node_selection = selections.node_selection.data(
      [],
      nodeKeyFunction
    );
    selections.node_selection.exit().remove();
    selections.edge_selection = selections.edge_selection.data(
      [],
      edgeKeyFunction
    );
    selections.edge_selection.exit().remove();
    force.nodes([]).links([]).resume();
    proto.clear.call(this);
  };

  /**
   * @type boolean
   */
  G.bound = true;
}


/**
* Returns True if the graph is bound to an output.
*
* @param {Graph} G A Graph
* @return {boolean}
*/
function isBound(G) {
  return G.bound;
}

/**
* Resets mutator methods to the originals
*
* @param {} G graph
* @param {boolean=} opt_clean (default=True)
*    If true, all D3 data is removed from the graph
*/
function unbind(G, optClean=true) {
  if (isBound(G)) {
    var proto = G.constructor.prototype;
    MUTATOR_METHODS.forEach(m => G[m] = proto[m]);
    delete G.bound;
    if (optClean) {
      clean(G);
    }
  }
}

/**
* Removes any D3 data from the Graph.
*
* @param {Graph} G A Graph
*/
function clean(G) {
  for (let [_,data] of G.nodesIter(true)) {
    delete data[D3_DATA_NAME];
  }
  for (let [u,v,data] of G.edgesIter(null, true)) {
    delete data[D3_DATA_NAME];
  }
}

/**
* Default D3 configuration.
*
* @type Object
* @private
*/
var DEFAULT_CONFIG = {
  layoutAttr: {
    charge: -120,
    linkDistance: 60
  },
  nodeShape: 'circle',
  nodeAttr: {
    r: 10 // radius of 10
  },
  nodeStyle: {
    'stroke-width': 2,
    stroke: '#333',
    fill: '#999',
    cursor: 'pointer'
  },
  edgeAttr: {},
  edgeStyle: {
    fill: '#000',
    'stroke-width': 3
  },
  labelAttr: {},
  labelStyle: {
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    cursor: 'pointer',
    '-webkit-user-select': 'none',
    fill: '#000'
  },
  edgeLabelAttr: {},
  edgeLabelStyle: {
    'font-size': '0.8em',
    'text-anchor': 'middle',
    '-webkit-user-select': 'none'
  },
  edgeLabelOffset: {
    x: 0,
    y: 0.5
  },
  withLabels: false,
  withEdgeLabels: false,
  edgeOffset: 10,
  weighted: false,
  weights: 'weight',
  weighted_stroke: true,
  panZoom: {
    enabled: true,
    scale: true
  }
};
