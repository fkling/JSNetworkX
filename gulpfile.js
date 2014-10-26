"use strict";

var browserify = require('browserify');
var envify = require('envify/custom');
var gulp = require('gulp');
var intreq = require('intreq');
var esnext = require('esnext');
var map = require('vinyl-map');
var merge = require('merge-stream');
var mocha = require('gulp-mocha');
var notify = require('gulp-notify');
var regenerator = require('regenerator');
var source = require('vinyl-source-stream');
var stream = require('stream');
var through = require('through');
var watchify = require('watchify');
var watch = require('gulp-watch');
var _ = require('lodash-node');

function transform(bundler, env) {
  return bundler
    .require(regenerator.runtime.path, {expose: 'regenerator-runtime'})
    .transform(esnext)
    .transform(envify({NODE_ENV: env}));
}

var paths = {
  all: './jsnx/index.js',
  _internals: './jsnx/_internals/index.js',
  jsnx: 'jsnetworkx.js',
  jsnx_dev: './jsnetworkx-dev.js',
  jsnx_internals: './jsnetworkx-internals.js',
  jsnx_min: './jsnetworkx_min.js',
};


gulp.task('build', function() {
  var b = browserify({standalone: 'jsnx'});
  b.add(paths.all);
  return transform(b, 'prod', true)
    .bundle()
    .pipe(source(paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('build-dev', function() {
  var b = browserify();
  b.add(paths.all, {detectGlobals: false, standalone: 'jsnx'});
  var lib = transform(b, 'dev', true)
    .bundle()
    .pipe(source(paths.jsnx_dev))
    .pipe(gulp.dest('./'));

  b = browserify();
  b.add(paths.all, {detectGlobals: false, standalone: '_internals'});
  var utils = transform(b, 'dev', true)
    .bundle()
    .pipe(source(paths.jsnx_internals))
    .pipe(gulp.dest('./'));

 return merge(lib, utils);
});

function test() {
  regenerator.runtime();
  global.utils = require('./node/_internals');
  global.assert = require('./mocha/assert');
  return gulp.src('node/classes/**/__tests__/test_0_graph.js')
    .pipe(mocha({
      reporter: 'spec',
      ui: 'exports',
      globals: ['utils', 'assert', 'regeneratorRuntime']
    }))
    .on('error', function(err) {
      if (!/tests? failed/.test(err.stack)) {
        console.log(err.stack);
      }
    });
}
gulp.task('test', test);

gulp.task('watch', function() {
  var lib_bundler = watchify(paths.all);
  transform(lib_bundler, 'dev', true);
  var internals_bundler = watchify(paths._internals);
  transform(internals_bundler);

  function rebundle() {
    return merge(
      lib_bundler.bundle({detectGlobals: false, standalone: 'jsnx'})
        .pipe(source(paths.jsnx_dev))
        .pipe(gulp.dest('./')),
      internals_bundler
        .bundle({detectGlobals: false, standalone: '_internals'})
        .pipe(source(paths.jsnx_internals))
        .pipe(gulp.dest('./'))
    ).pipe(notify('Recompiled...'));
  }

  lib_bundler.on('update', rebundle);
  internals_bundler.on('update', rebundle);

  return rebundle();
});

function node(src) {
  return src.pipe(map(function(code, filename) {
    try {
      return esnext.compile(code.toString()).code;
    } catch(e) {
      console.error(filename);
      throw e;
    }
  }))
  .pipe(gulp.dest('./node'));
}

gulp.task('node', function() {
  return node(gulp.src(['jsnx/**/*.js']));
});

gulp.task('watch-node', function() {
  return watch('jsnx/**/*.js', function(files) {
      node(files);
    });
});
