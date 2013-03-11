/*jshint node:true*/
/*global grunt*/

var path = require('path');

var namespaces = {};
namespaces.base = ['jsnx'];
namespaces.node = namespaces.base.concat('jsnx.algorithms', 'jsnx.generators');
namespaces.all = namespaces.node.concat('jsnx.drawing');

module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      dist: 'dist/',
      wrapper: "(function(global, factory) { function extractNS(){ var g = {}; return factory.call(g, global),g.jsnx;} if(typeof define === 'function' && define.amd){ /*AMD*/ define(extractNS); } else if (typeof module !== 'undefined' && module.exports){ /*node*/ module.exports = extractNS(); } else { factory.call(global, global); } }(this, function(window) {%output%}));",
      roots: ['jsnx/', 'vendor/closure-library/'],
      paths: {
        compiler: 'vendor/closure-compiler/compiler.jar',
        library: 'vendor/closure-library/'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'jsnx/**/*.js']
    },
    jasmine: {
      options: {
        specs: 'jsnx/**/tests/test_*.js',
        vendor: '<%= meta.paths.library %>closure/goog/base.js',
        helpers:  ['deps.js', 'jasmine/BaseTestClass.js', 'jasmine/*Matcher.js']
      },
      normal: {
        src: ['jsnx/jsnx.js', 'jsnx/algorithms/algorithms.js', 'jsnx/generators/generators.js']
      },
      compiled: {
        src: ['<%= pkg.name %>-test.js'],
        options: {
          outfile: '_SpecRunner_compiled.html',
          helpers:  ['jasmine/gcc_deps.js', 'jasmine/BaseTestClass.js', 'jasmine/*Matcher.js']
        }
      }
    },
    compile: {
      options: {
        closureLibraryPath: '<%= meta.paths.library  %>',
        compilerFile: '<%= meta.paths.compiler %>',
        compile: true,
        namespaces: [],
        compilerOpts: {
          output_wrapper: '<%= meta.wrapper %>',
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          generate_exports: null,
          define: ['goog.DEBUG=false', 'jsnx.TESTING=false'],
          externs: ['jsnx/externs/*'],
          warning_level: 'VERBOSE',
          jscomp_warning: ['strictModuleDepCheck'],
          jscomp_error: ['checkDebuggerStatement', 'const', 'constantProperty', 'accessControls', 'visibility']
        }
      },
      test: {
        options: {
          namespaces: namespaces.all,
          compilerOpts: {
            output_wrapper: '<%= meta.wrapper %>',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            generate_exports: null,
            define: ["'goog.DEBUG=true'", "'jsnx.TESTING=true'"],
            externs: ['jsnx/externs/*'],
            warning_level: 'VERBOSE',
            jscomp_warning: ['strictModuleDepCheck'],
            jscomp_error: ['checkDebuggerStatement', 'const', 'constantProperty', 'accessControls', 'visibility']
          }
        },
        src: '<%= meta.roots %>',
        dest: '<%= pkg.name%>-test.js'
      },
      base: {
        options: {
          namespaces: namespaces.base
        },
        src: '<%= meta.roots %>',
        dest: '<%= meta.dist %><%= pkg.name%>-base.js'
      },
      node: {
        options: {
          namespaces: namespaces.node
        },
        src: '<%= meta.roots %>',
        dest: '<%= meta.dist %><%= pkg.name%>-node.js'
      },
      all: {
        options: {
          namespaces: namespaces.all
        },
        src: '<%= meta.roots %>',
        dest: '<%= pkg.name%>.js'
      },
      drawing: {
        options: {
          namespaces: namespaces.base.concat('jsnx.drawing')
        },
        src: '<%= meta.roots %>',
        dest: '<%= meta.dist %><%= pkg.name%>-drawing.js'
      },
      custom: {
        options: {},
        src: '<%= meta.roots %>',
        dest: '<%= pkg.name%>-custom.js'
      }
    },
    deps: {
      options: {
        closureLibraryPath: '<%= meta.paths.library  %>',
        root_with_prefix: '"jsnx ../../../../jsnx"'
      },
      'default': {
        dest: './deps.js'
      }
    },
    connect: {
      server: {
        options: {
          keepalive: true
        }
      }
    }
  });

  // Create required repositories
  grunt.file.mkdir(grunt.config.get('meta.dist'));

  // Get custom namespaces from the command line if set
  var custom_ns = grunt.option('ns');
  if (custom_ns) {
    custom_ns = custom_ns.split(',');

    var ns = custom_ns.map(function(ns) {
      return ns.indexOf('jsnx') === 0 ? ns : 'jsnx.' + ns;
    });
    ns.push('jsnx');
    grunt.config.set('compile.custom.options.namespaces', ns);
  }

  // Check whether compiler and library exist
  grunt.registerTask('check', 'Checks whether dependencies exist', function() {
    var ok = true;
    var library_path = grunt.config('meta.paths.library');
    if (!grunt.file.exists(library_path)) {
      grunt.log.error('Cannot find closure library at ' + library_path);
      grunt.log.error(
        'You can download the library using SVN with `svn checkout http://closure-library.googlecode.com/svn/trunk/ ' + library_path + '`'
      );
      ok = false;
    }
    else {
      grunt.verbose.ok('Found closure library.');
    }

    var compiler_path = grunt.config('meta.paths.compiler');
    if (!grunt.file.exists(compiler_path)) {
      grunt.log.error('Cannot find closure compiler at ' + compiler_path);
      grunt.log.error(
        'Please download the compiler at https://code.google.com/p/closure-compiler/ and extract it to ' + path.dirname(compiler_path)
      );
      ok = false;
    }
    else {
      grunt.verbose.ok('Found closure compiler');
    }

    return ok;
  });

  grunt.registerTask('cleanup', 'Remove test stuff', function() {
    grunt.file['delete'](grunt.config.get('compile.test.dest'));
    grunt.file['delete'](grunt.config.get('deps.default.dest'));
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.renameTask('closureBuilder', 'compile');
  grunt.renameTask('closureDepsWriter', 'deps');
  grunt.registerTask('test', ['check', 'deps', 'compile:test', 'jasmine', 'cleanup']);
  grunt.registerTask('buildtest', [
    'check',
    'deps',
    'jasmine:normal:build',
    'compile:test',
    'jasmine:compiled:build',
    'connect:server',
    'cleanup'
  ]);
  grunt.registerTask('buildall', [
    'check',
    'jshint',
    'compile:test',
    'jasmine:compiled',
    'compile:base',
    'compile:node',
    'compile:drawing',
    'compile:all',
    'cleanup'
  ]);
};
