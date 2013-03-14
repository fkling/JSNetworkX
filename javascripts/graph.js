/*jshint browser:true*/
/*global jsnx:true, d3:true*/
(function() {
    "use strict";
    var G = jsnx.Graph();
    G.add_nodes_from([1,2,3,4], {group:0});
    G.add_nodes_from([5,6,7], {group:1});
    G.add_nodes_from([8,9,10,11], {group:2});

    G.add_path([1,2,5,6,7,8,11]);
    G.add_edges_from([[1,3],[1,4],[3,4],[2,3],[2,4],[8,9],[8,10],[9,10],[11,10],[11,9]]);

    d3.select('#char').style('opacity', 0.01)
    .transition().style('opacity', 1);

    var color = d3.scale.category20();
    jsnx.draw(G, {element: '#chart',
              layout_attr: {
                  charge: -120,
                  linkDistance: 20
              },
              node_attr: {
                  r: 5,
                  title: function(d) { return d.label;}
              },
              node_style: {
                  fill: function(d) { return color(d.data.group); },
                  stroke: 'none'
              },
              edge_style: {
                  fill: '#999'
              }
    }, true);
}());
