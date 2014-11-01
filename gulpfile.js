"use strict";

var argv = require('yargs').argv;
var browserify = require('browserify');
var envify = require('envify/custom');
var esnext = require('esnext');
var filter = require('gulp-filter');
var gulp = require('gulp');
var map = require('vinyl-map');
var mocha = require('gulp-mocha');
var regenerator = require('regenerator');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');

function transform(bundler, env) {
  return bundler
    .transform(esnext)
    .transform(envify({NODE_ENV: env}));
}

var paths = {
  all: './jsnx/index.js',
  jsnx: 'jsnetworkx.js',
  jsnx_dev: 'jsnetworkx-dev.js',
};

gulp.task('build', function() {
  var b = browserify({standalone: 'jsnx'});
  b.add(paths.all);
  return transform(b, 'prod', true)
    .transform({global: true}, 'uglifyify')
    .bundle()
    .pipe(source(paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('build-dev', function() {
  var b = browserify({standalone: 'jsnx'});
  b.add(paths.all);
  return transform(b, 'dev', true)
    .bundle()
    .pipe(source(paths.jsnx_dev))
    .pipe(gulp.dest('./'));
});

function test() {
  var pattern = argv.p;

  regenerator.runtime();
  global.utils = require('./node/_internals');
  global.assert = require('./mocha/assert');
  return gulp.src('node/**/__tests__/*-test.js')
    .pipe(filter(function(file) {
      return !pattern || new RegExp(pattern).test(file.path);
    }))
    .pipe(mocha({
      reporter: 'spec',
      ui: 'exports',
      globals: ['utils', 'assert', 'regeneratorRuntime']
    }))
    .on('error', function(err) {
      if (!/tests? failed/.test(err.message)) {
        console.log(err.message);
      }
    });
}
gulp.task('test', test);

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

gulp.task('watch-node', ['node'], function() {
  return watch('jsnx/**/*.js', function(files) {
      node(files);
    });
});
