"use strict";

var argv = require('yargs').argv;
var browserify = require('browserify');
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var header = require('gulp-header');
var vinylTransform = require('vinyl-transform');
var mocha = require('gulp-mocha');
var preprocess = require('gulp-preprocess');
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var sourceMapSupport = require('source-map-support');
var transform = require('./transforms/transform');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var paths = {
  browser: './jsnx/browser.js',
  jsnx: './jsnetworkx.js',
  jsnx_dev: './jsnetworkx-dev.js',
  node: './node',
};


function transformNode(src, prod) {
  return src
    .pipe(preprocess({context: {NODE: true}}))
    .pipe(transform.mapStream(prod))
    .pipe(gulp.dest(paths.node));
}

function transformBrowser(prod) {
  return gulp.src(paths.browser)
    .pipe(vinylTransform(function(filename) {
       return browserify({
        standalone: 'jsnx',
        debug: !prod,
      })
      .add(filename)
      .transform(transform(prod, {runtime: true}))
      .bundle();
    }))
    .pipe(header(require("6to5").runtime()));
}

gulp.task('build-node-dev', ['clean-node'], function() {
   return transformNode(gulp.src('jsnx/**/*.js'), false);
});

gulp.task('build-node-prod', ['clean-node'], function() {
  return transformNode(gulp.src('jsnx/**/*.js'), true);
});

gulp.task('build-dev', function() {
  return transformBrowser(false)
    .pipe(concat(paths.jsnx_dev))
    .pipe(replace('{{BUNDLE_NAME}}', paths.jsnx_dev))
    .pipe(gulp.dest('./'));
});

gulp.task('build-prod', function() {
  return transformBrowser(true)
    .pipe(concat(paths.jsnx))
    .pipe(uglify())
    .pipe(replace('{{BUNDLE_NAME}}', paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('clean-node', function(cb) {
  del(paths.node, cb);
});

gulp.task('clean-browser', function(cb) {
  del([paths.jsnx, paths.jsnx_dev], cb);
});

gulp.task('watch-node', function() {
  return transformNode(
    gulp.src('jsnx/**/*.js')
     .pipe(watch('jsnx/**/*.js'))
     .pipe(plumber()),
    false
  );
});

gulp.task('test-node', function () {
  var pattern = argv.p;

  sourceMapSupport.install();
  require('6to5/polyfill');
  global.utils = require(paths.node + '/_internals');
  global.assert = require('./mocha/assert');
  global.sinon = require('sinon');
  return gulp.src(paths.node + '/**/__tests__/*-test.js')
    .pipe(mocha({
      reporter: 'dot',
      ui: 'exports',
      globals: ['utils', 'assert', 'sinon'],
      grep: pattern,
    }));
});

gulp.task('clean', ['clean-node', 'clean-browser']);
gulp.task('build', ['build-node-prod', 'build-prod']);
gulp.task('test', ['test-node']);
