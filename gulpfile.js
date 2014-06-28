"use strict";

var browserify = require('browserify');
var envify = require('envify/custom');
var generatorify = require('./gulp/generatorify');
var gulp = require('gulp');
var intreq = require('intreq');
var jstransformify = require('./gulp/jstransformify');
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
  .transform(jstransformify)
  .transform(generatorify)
  .transform(envify({NODE_ENV: env}))
  .require(regenerator.runtime.dev, {expose: 'regenerator'});
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
  return transform(browserify(paths.all), 'prod', true)
    .bundle({standalone: 'jsnx'})
   .pipe(source(paths.jsnx))
    .pipe(gulp.dest('./'));
});

gulp.task('build-dev', function() {
  var lib = transform(browserify(paths.all), 'dev', true)
    .bundle({detectGlobals: false, standalone: 'jsnx'})
    .pipe(source(paths.jsnx_dev))
    .pipe(gulp.dest('./'));

  var utils = transform(browserify(paths._internals), 'dev', true)
    .bundle({detectGlobals: false, standalone: '_internals'})
    .pipe(source(paths.jsnx_internals))
    .pipe(gulp.dest('./'));

 return merge(lib, utils);
});

function test() {
  regenerator.runtime();
  global.nocache = function(m) {
    delete require.cache[require.resolve(m)];
    return require(m);
  };
  global.utils = global.nocache('./node/_internals');
  global.assert = require('./mocha/assert');
  for (var key in require.cache) {
    // delete require.cache[key];
  }
  return gulp.src('node/_internals/**/__tests__/index.js')
    .pipe(mocha({
      reporter: 'spec',
      ui: 'exports',
      globals: ['utils', 'assert', 'wrapGenerator']
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
    return generatorify.gen(jstransformify.jst(code.toString()));
  }))
  .on('error', function(err) {
    console.log('Unable to transform:', err.message);
  })
  .pipe(gulp.dest('./node'));
}
gulp.task('node', function() {
  return node(gulp.src(['jsnx/**/*.js']));
});

gulp.task('watch-test', function() {
  return watch({glob: 'jsnx/**/*.js'}, function(files) {
      node(files);
    });
});
