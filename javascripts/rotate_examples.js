/*jshint browser:true, jquery:true*/
/*globals examples, jsnx, d3*/
(function () {
  "use strict";

  function fisherYates ( myArray ) {
    var i = myArray.length, j, tempi, tempj;
    if ( i === 0 ) { return false;}
    while ( --i ) {
      j = Math.floor( Math.random() * ( i + 1 ) );
      tempi = myArray[i];
      tempj = myArray[j];
      myArray[i] = tempj;
      myArray[j] = tempi;
    }
  }

  function create_random_order() {
    var order = [];
    for (var i = 0, l = examples.length; i < l; i++) {
      order[i] = i;
    }
    fisherYates(order);
    return order;
  }

  var canvas = document.getElementById('canvas');
  var $desc = $(canvas).children('.description');
  var order = create_random_order();
  var i = order.shift();
  var color = d3.scale.category10();

  function rotate() {
    examples[i](function(G, desc, config) {
      jsnx.draw(G, $.extend({
        element: canvas,
        layout_attr: {
          charge: -300,
          linkDistance: 20,
          gravity: 0.5
        },
        pan_zoom: {
          enabled: false
        },
        node_attr: {
          r: 6,
          title: function(d) { return d.label;}
        },
        node_style: {
          fill: function(d) { return color(d.node % 4); },
          stroke: 'none'
        },
        edge_style: {
          fill: '#999'
        }
      }, config));
      $desc.text(desc);
    });

    if (!order.length) {
      order = create_random_order();
    }
    i = order.shift();
    window.setTimeout(rotate, 10000);
  }
  rotate();
}());
