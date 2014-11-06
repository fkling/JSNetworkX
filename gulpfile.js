"use strict";

var argv = require('yargs').argv;
var asyncTransform = require('./transforms/async');
var browserify = require('browserify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var envify = require('envify/custom');
var esnext = require('esnext');
var filter = require('gulp-filter');
var gulp = require('gulp');
var inlineSMC = require('inline-source-map-comment');
var vinylMap = require('vinyl-map');
var vinylTransform = require('vinyl-transform');
var mocha = require('gulp-mocha');
var regenerator = require('regenerator');
var through = require('through');
var replace = require('gulp-replace');
var watch = require('gulp-watch');

var paths = {
  root: './jsnx/index.js',
  jsnx: './jsnetworkx.js',
  jsnx_dev: './jsnetworkx-dev.js',
  node: './node_src',
};

function jstransform(file, src, opts) {
  var options = {};
  if (!opts.prod) {
    options = {
      sourceFileName: file,
      sourceMapName: file + '.map.json'
    };
  }

  // Transform async functions first
  src = asyncTransform(file, src, {
    delegateName: 'delegateToWorker',
    delegatePath: './jsnx/_internals'
  }).code;

  // Then ES6 and inline source maps
  var result = esnext.compile(src, options);
  var code = result.code;
  if (!opts.prod) {
    code += '\n' + inlineSMC(result.map, {sourcesContent: true});
  }
  return code;
}

function transformNode(src) {
  return src.pipe(vinylMap(function(src, filename) {
    try {
      return jstransform(filename, src, {prod: true});
    } catch(e) {
      console.error(filename);
      throw e;
    }
  }))
  .pipe(gulp.dest(paths.node));
}

function transformBrowser(prod) {
  return gulp.src(paths.root)
    .pipe(vinylTransform(function(filename) {
       var b = browserify({
        standalone: 'jsnx',
        debug: !prod,
      })
      .add(filename)
      .transform(function(file) {
        var data = '';
        return through(write, end);

        function write (buf) { data += buf; }
        function end() {
          /*jshint validthis:true*/
          var code = jstransform(file, data, {prod: prod});
          this.queue(code);
          this.queue(null);
        }
      })
      .transform(envify({ENV: 'browser'}));
      if (prod) {
        b.transform('uglifyify', {global: true});
      }
      return b.bundle();
    }));
}

gulp.task('build-node', ['clean-node'], function() {
  return transformNode(gulp.src('jsnx/**/*.js'));
});

gulp.task('clean-node', function() {
  return gulp.src(paths.node, {read: false})
    .pipe(clean());
});

gulp.task('clean-browser', function() {
  return gulp.src([paths.jsnx, paths.jsnx_dev], {read: false})
    .pipe(clean());
});


gulp.task('watch-node', ['build-node'], function() {
  return watch('jsnx/**/*.js', function(files) {
      transformNode(files);
  });
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
    .pipe(replace('{{BUNDLE_NAME}}', paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('test-node', function () {
  var pattern = argv.p;

  regenerator.runtime();
  global.utils = require('./node_src/_internals');
  global.assert = require('./mocha/assert');
  return gulp.src('node_src/**/__tests__/*-test.js')
    .pipe(filter(function(file) {
      return !pattern || new RegExp(pattern).test(file.path);
    }))
    .pipe(mocha({
      reporter: 'spec',
      ui: 'exports',
      globals: ['utils', 'assert']
    }))
    .on('error', function(err) {
      if (!/tests? failed/.test(err.message)) {
        console.log(err.message);
      }
    });
});

gulp.task('clean', ['clean-node', 'clean-browser']);
gulp.task('build', ['build-node', 'build-prod']);
gulp.task('test', ['test-node']);
