"use strict";

var path = require('path');
var transform = require('../transforms/es7').transform;

require('commoner').version(
    require('../package.json').version
).resolve(function(id) {
  return this.readModuleP(id);
}).option(
  '--prod',
  'Create a producation verison (no source maps)'
).process(function(id, source) {
  return transform(
    path.join(this.options.sourceDir, id),
    source,
    {prod: this.options.prod}
  );
});
