/*jshint node:true*/
/*global grunt*/
'use strict';

var path = require('path');

var namespaces = {};
namespaces.base = [
  'jsnx',
  'jsnx.exception',
  'jsnx.helper',
  'jsnx.classes',
  'jsnx.contrib',
  'jsnx.relabel',
  'jsnx.utils'
];
namespaces.node = namespaces.base.concat('jsnx.algorithms', 'jsnx.generators');
namespaces.all = namespaces.node.concat('jsnx.drawing');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      build: 'build/',
      dist: 'dist/',
      wrapper: grunt.file.read('wrapper.js').trim(),
      roots: ['<%= meta.build %>jsnx/', 'vendor/closure-library/'],
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
    mocha: {
      all: {
        src: ['jsnx/**/tests/test_*.js'],
        ui: 'exports',
        reporter: 'spec'
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
      test_simple: { // used for easier debugging
        options: {
          namespaces: namespaces.all,
          compilerOpts: {
            output_wrapper: '<%= meta.wrapper %>',
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            formatting: 'PRETTY_PRINT',
            generate_exports: null,
            define: ["'goog.DEBUG=true'", "'jsnx.TESTING=true'"],
            externs: ['jsnx/externs/*.js'],
            warning_level: 'VERBOSE',
            jscomp_warning: ['strictModuleDepCheck'],
            jscomp_error: ['checkDebuggerStatement', 'const', 'constantProperty', 'accessControls', 'visibility']
          }
        },
        src: '<%= meta.roots %>',
        dest: '<%= pkg.name%>-test.js'
      },
      test_advanced: {
        options: {
          namespaces: namespaces.all,
          compilerOpts: {
            output_wrapper: '<%= meta.wrapper %>',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            generate_exports: null,
            define: ["'goog.DEBUG=true'", "'jsnx.TESTING=true'"],
            externs: ['jsnx/externs/*.js'],
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
    concat: {
      test: {
        src: ['lib/regenerator/min.js', 'banner.js', '<%= pkg.name%>-test.js'],
        dest: '<%= pkg.name%>-test.js'
      }
    },
    transpile: {
      all: {
        files: [{
          expand: true,
          src: ['jsnx/**/*.js', '!jsnx/**/tests/*'],
          dest: '<%= meta.build %>'
        }]
      },
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
    watch: {
      scripts: {
        files: ['jsnx/**/*.js', '!jsnx/**/tests/*'],
        tasks: ['compile:test_simple']
      },
      options: {
        interrupt: true
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


  // Test task with mocha
  grunt.registerMultiTask('mocha', 'Runs tests with mocha', function() {
    var async = this.async();
    var Mocha = require('mocha');
    var mocha = new Mocha({
      ui: this.data.ui || 'exports',
      reporter: this.data.reporter || 'spec'
    });
    this.filesSrc.forEach(function(f) {
      mocha.addFile(f);
    });
    mocha.run(function(failures){
      if (failures > 0) {
        grunt.fail.fatal(failures + ' test cases were unsuccessful');
      }
      async(failures === 0);
    });
  });

  // Test task with mocha
  grunt.registerMultiTask('transpile', 'Transpile to ES5', function() {
    var regenerator = require('regenerator');
    var forof = require('es6forof');
    this.files.forEach(function(fileObj) {
      var transformed_source = regenerator(
        forof(grunt.file.read(fileObj.src[0]))
      );
      // fix for closure compiler. It doesn't allow reserved keywords as
      // property names, which regenator does
      transformed_source = transformed_source.replace(
        /(\$ctx\d+)\.catch\(/g,
        "$1['catch']("
      );
      grunt.file.write(
        fileObj.dest,
        transformed_source
      );
    });
  });

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


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-closure-tools');

  grunt.renameTask('closureBuilder', 'compile');
  grunt.renameTask('closureDepsWriter', 'deps');
  grunt.registerTask('buildall', [
    'check',
    'jshint',
    'transpile',
    'compile:test_advanced',
    'mocha',
    'compile:base',
    'compile:node',
    'compile:drawing',
    'compile:all',
    'cleanup'
  ]);

  grunt.registerTask('test', [
    'check',
    'transpile',
    'compile:test_simple',
    'mocha',
    'compile:test_advanced',
    'mocha',
    'cleanup'
  ]);

  grunt.registerTask('compile_simple', [
    'check',
    'transpile',
    'compile:test_simple',
    'concat'
  ]);
};
