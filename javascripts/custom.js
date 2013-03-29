/*jshint browser:true, jquery:true*/
(function() {
  "use strict";
  var versions = {};
  var URL = 'https://raw.github.com/fkling/JSNetworkX/%VERSION%/jsnetworkx.js';

  function build_module_selection(version) {
    function collect_modules(obj, prefix, accum) {
      var found = false;
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
          found = true;
          collect_modules(obj[prop], prefix.concat(prop), accum);
        }
      }
      if (!found) {
        accum.push(prefix.join('.'));
      }
    }

    $('fieldset.cat').each(function() {
      var modules = [];
      var name = $(this).data('name');
      collect_modules(version[name], [], modules);
      modules.sort();
      for (var i = 0, l = modules.length; i < l; i++) {
        var fs = $('<li><label><input type="checkbox" name="' + name + '" value="' + [name, modules[i]].join('.') + '"> ' + modules[i] + '</label></li>')
          .appendTo($(this).find('ul').get(i < Math.ceil(l/2) ? 0 : 1));
      }
    });

    $('#builder').removeClass('loading');
    $('.cat').find('legend input').prop('checked', true).change();
  }

  $('input[name="version"]').change(function() {
    $('fieldset ul li').remove();
    $('#builder').addClass('loading');
    var version = this.value;
    if (!(version in versions)) {
      // download
      var script = document.createElement('script');
      script.onload = function() {
        this.parentNode.removeChild(this);
      };
      script.src = URL.replace('%VERSION%', version);
      window.define = function(factory) { 
        delete window.defined;
        versions[version] = factory();
        build_module_selection(versions[version]);
      };
      window.define.amd = true;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
    else {
      build_module_selection(versions[version]);
    }
  }).triggerHandler('change');

  $('.cat').on('change', 'input', function() {
    if (this.name === 'all') {
      $(this).closest('fieldset')
        .find('input').not(this)
        .prop('checked', this.checked);
    }
    else {
      // toggle category checkbox
      var chkbox = $(this).closest('.row').find('ul input');
      $(this).closest('fieldset')
        .find('legend input')
        .prop('checked', chkbox.length === chkbox.filter(function() { return this.checked;}).length);
    }
  });

  $('.download button').click(function() {
    // get all selected modules
    // first check categories
    var modules = [];
    $('.cat').each(function() {
      var all = $(this).find('input[name=all]').prop('checked');
      if (all) {
        modules.push($(this).data('name'));
      }
      else {
        $(this).find('ul input').filter(function() {
          return this.checked;
        }).each(function() {
          modules.push(this.value);
        });
      }
    });

    // make request
    var version = $('#builder input[name=version]').val();
    version = version === 'master' ? 'latest' : version;
    var name = 'jQuery_iframe_' + jQuery.now();
    var iframe;
    var form;

    iframe = $('<iframe>').attr('name', name).appendTo('head');

    form = $('<form>')
    .attr('method', 'POST') // GET or POST
    .attr('action', 'http://jsnetworkxh.herokuapp.com')
    .attr('target', name);

    $.each({version: version, modules: modules.join(',')}, function(k, v) {
      $('<input>')
      .attr('type', 'hidden')
      .attr('name', k)
      .attr('value', v)
      .appendTo(form);
    });

    form.appendTo('body').submit();
  });

}());
