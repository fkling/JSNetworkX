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

    // build algorithm list
    var algorithms = [];
    collect_modules(version.algorithms, [], algorithms);
    algorithms.sort();
    for (var i = 0, l = algorithms.length; i < l; i++) {
      var fs = $('<li><label><input type="checkbox" name="algorithm" value="algorithms.' + algorithms[i] + '"> ' + algorithms[i] + '</label></li>')
        .appendTo($('#builder-algorithms ul').get(i < Math.ceil(l/2) ? 0 : 1));
      // build children here
    }

    // build generators list
    var generators = [];
    collect_modules(version.generators, [], generators);
    algorithms.sort();
    for (var i = 0, l = generators.length; i < l; i++) {
      var fs = $('<li><label><input type="checkbox" name="generator" value="generators.' + generators[i] + '"> ' + generators[i] + '</label></li>')
        .appendTo($('#builder-generators ul').get(i < Math.ceil(l/2) ? 0 : 1));
      // build children here
    }
    $('#builder').removeClass('loading');
    $('#builder-algorithms, #builder-generators').find('legend input')
      .prop('checked', true).change();
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

  $('#builder-algorithms, #builder-generators').on('change', 'input', function() {
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
    var algorithms = $('#builder-algorithms input[name=all]').prop('checked');
    var generators = $('#builder-generators input[name=all]').prop('checked');

    if (algorithms) {
      modules.push('algorithms');
    }
    else {
      $('#builder-algorithms ul input').filter(function() {
        return this.checked;
      }).each(function() {
        modules.push(this.value);
      });
    }

    if (generators) {
      modules.push('generators');
    }
    else {
      $('#builder-generators ul input').filter(function() {
        return this.checked;
      }).each(function() {
        modules.push(this.value);
      });
    }

    // make request
    var version = $('#builder input[name=version]').val();
    version = version === 'master' ? 'latest' : version;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
      this.parentNode.removeChild(this);
    };
    iframe.style.display = 'none';
    iframe.src = 'http://jsnetworkxh.herokuapp.com/?version=' + version + '&modules=' + modules.join(',');
    document.body.appendChild(iframe);
  });

}());
