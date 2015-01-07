/*jshint browser:true, jquery:true*/
/*globals jsnx*/
(function() {
  "use strict";
  var COMMENT = /^\/\//;
  var CONSOLE = /^console/;
  var canvas = document.getElementById('demo-canvas');
  var draw_config = {
    element: canvas,
    withLabels: true,
    panZoom: {
      enabled: false
    }
  };
  var current_example = -1;
  var G;

  // Find all code examples which we have to process
  var $examples = $('pre[data-example=run]');
  $examples.css('position', 'relative');

  function run_example(code, draw) {
    G = (new Function('G', code + '; return G;'))(G);
    if (draw) {
      jsnx.draw(G, draw_config, true);
    }
  }

  function extract_code(example) {
    return $(example).find('li').map(function() {
      var text = $(this).text();
      if (!COMMENT.test(text) && !CONSOLE.test(text)) {
        text = text.replace(/\/\/.*$/, '');
        return text;
      }
    }).get().join('');
  }

  function prepare_example(example) {
    var data = $(example).data();
    var thisindex = $examples.index(example);
    var draw = false;
    if (thisindex === current_example && data.draw !== 'update') {
      return;
    }
    if (typeof data.depends === 'undefined' || data.depends === current_example) {
      // just run the example directly
      draw = data.draw === true;
      run_example(extract_code(example), draw);
    }
    else {
      // collect code
      var index = data.depends;
      var $example;
      var code = '';
      do {
        $example = $examples.eq(index);
        code = extract_code($example[0]) + code;
        if (!draw && $example.data('draw') === true) {
          draw = true;
        }
        index = $example.data('depends');
      }
      while (typeof index !== 'undefined' && index !== current_example);

      if (data.draw === true) {
        // since we have to redraw anyway, execute whole code at once
        code = extract_code(example) + code;
        run_example(code, true);
      }
      else {
        // draw previous state first an then update after 2 seconds
        run_example(code, draw);
        setTimeout(function() {
          run_example(extract_code(example), false);
        }, 2000);
      }
    }
    current_example = thisindex;
  }

  // append run button
  $('<button>', {
    'class': "btn btn-small btn-primary demo-button",
    style: "position: absolute; top:0;right:0;",
    text: 'Show'
  })
    .appendTo($examples)
    .click(function() {
      prepare_example(this.parentNode);
    });
}());
