"use strict";

var argv = require('yargs').argv;
var asyncTransform = require('./transforms/async');
var browserify = require('browserify');
var del = require('del');
var concat = require('gulp-concat');
var envify = require('envify/custom');
var esnext = require('esnext');
var gulp = require('gulp');
var inlineSMC = require('inline-source-map-comment');
var mapStream = require('map-stream');
var vinylTransform = require('vinyl-transform');
var mocha = require('gulp-mocha');
var preprocess = require('gulp-preprocess');
var regenerator = require('regenerator');
var replace = require('gulp-replace');
var sourceMapSupport = require('source-map-support');
var through = require('through');
var watch = require('gulp-watch');

var paths = {
  root: './jsnx/index.js',
  jsnx: './jsnetworkx.js',
  jsnx_dev: './jsnetworkx-dev.js',
  node: './node',
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

function transformNode(src, prod) {
  return src
    .pipe(preprocess({context: {NODE: true}}))
    .pipe(mapStream(function (file, cb) {
      try {
        var src = jstransform(
          file.path,
          file.contents.toString(),
          {prod: prod}
        );
        file.contents = new Buffer(src);
        cb(null, file);
      } catch(ex) {
        cb(file.path + ': ' + ex);
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
    .pipe(replace('{{BUNDLE_NAME}}', paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('clean-node', function(cb) {
  del(paths.node, cb);
});

gulp.task('clean-browser', function(cb) {
  del([paths.jsnx, paths.jsnx_dev], cb);
});

gulp.task('watch-node', ['build-node-dev'], function() {
  return watch('jsnx/**/*.js', function(files) {
    return transformNode(files, false);
  });
});

gulp.task('test-node', function () {
  var pattern = argv.p;

  sourceMapSupport.install();
  regenerator.runtime();
  global.utils = require(paths.node + '/_internals');
  global.assert = require('./mocha/assert');
  global.sinon = require('sinon');
  return gulp.src(paths.node + '/**/__tests__/*-test.js')
    .pipe(mocha({
      reporter: 'spec',
      ui: 'exports',
      globals: ['utils', 'assert', 'sinon'],
      grep: pattern,
    }));
});

gulp.task('clean', ['clean-node', 'clean-browser']);
gulp.task('build', ['build-node-prod', 'build-prod']);
gulp.task('test', ['test-node']);
