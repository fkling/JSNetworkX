"use strict";

var path = require('path');
var transform = require('../transforms/es7').transform;

require('commoner').version(
    require('../package.json').version
).resolve(function(id) {
  return this.readModuleP(id);
}).option(
  '--dev',
  'Include inline source maps'
).process(function(id, source) {
  return transform(
    path.join(this.options.sourceDir, id),
    source,
    {dev: this.options.dev}
  );
});
