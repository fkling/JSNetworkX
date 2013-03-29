/*jshint jquery:true, browser: true*/
/*global d3*/
(function() {
  "use strict";
  var $examples = $('.example');
  $examples.each(function(i) {
    this.id = "example" + i;
    $(this).find('h4').prepend('<a href="#example' + i + '">#' + i + ':&nbsp;</a>');
  });


  // Compute position of canvas based on screen size
  var bottom = $('#header').offset().top + $('#header').height();
  var available_height = $(window).height() - bottom;
  $('#canvas').css({
    'position': 'fixed',
    'height': available_height * 0.6,
    'top': bottom + 0.1 * available_height
  });


  var COMMENT = /^\/\//;
  var CONSOLE = /^console/;
  function extract_code(example) {
    return $(example).find('li').map(function() {
      var text = $(this).text();
      if (!COMMENT.test(text) && !CONSOLE.test(text)) {
        text = text.replace(/\/\/.*$/, '');
        return text;
      }
    }).get().join('');
  }

  var $description = $('#canvas > .description');
  function draw(example) {
    var $example = $(example);
    $description.text($example.children('h4').text());
    (new Function(extract_code(example))());
    d3.selectAll('#canvas svg').style('opacity', 0.01).transition().duration(1500)
    .style('opacity', 1);
  }

  // Find top most visible example and draw it
  var timer;
  var last = null;
  var dheight = $(document).height();
  var handler = function(event, force) {
    window.clearTimeout(timer);
    timer = setTimeout(function() {
      var cutoff = $(window).scrollTop();
      var half_height = $(window).height() / 2;
      if (cutoff + half_height * 2 >= dheight) {
        // bottom, show last example
        var l = $examples.last().get(0);
        if (l !== last || force) {
            $(last).removeClass('active');
            $(l).addClass('active');
            last = l;
            draw(l);
        }
      }
      else {
        $examples.each(function() {
          var top = $(this).offset().top;
          var center = top + $(this).height() / 2;
          if (center > cutoff && top < cutoff + half_height) {
            if (last !== this || force) {
              $(last).removeClass('active');
              $(this).addClass('active');
              last = this;
              draw(this);
            }
            return false;
          }
        });
      }
    }, 50);
  };

  window.onhashchange = function() {
    $(document).trigger('scroll');
  };
  $(document).on('scroll', handler).trigger('scroll');
  $(window).resize(function() {
    handler(null, true);
  });
}());
