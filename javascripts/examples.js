/*jshint jquery:true, browser: true*/
/*global d3*/
(function() {
  "use strict";
  var $examples = $('.example');
  $examples.each(function(i) {
    var link = '#' + i;
    $(this).find('h4').prepend('<a href="' + link + '">' + link + ':&nbsp;</a>');
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
  $(document).on('scroll', function() {
    window.clearTimeout(timer);
    timer = setTimeout(function() {
      var cutoff = $(window).scrollTop();
      var half_height = $(window).height() / 2;
      $examples.each(function() {
        var top = $(this).offset().top;
        if (top > cutoff && top < cutoff + half_height) {
          if (last !== this) {
            $(last).removeClass('active');
            $(this).addClass('active');
            last = this;
            draw(this);
          }
          return false;
        }
      });
    }, 50);
  }).trigger('scroll');
}());
