"use strict";
var fs = require('fs');
var glob = require('glob');
var recast = require('recast');
var types = recast.types;

function compile(filepath) {
  var source = fs.readFileSync(filepath).toString();
  var ast = recast.parse(source);

  types.visit(ast, {
    visitIdentifier: function(path) {
      var name = path.value.name;
      if (/^.+_/.test(name)) {
        name = name.replace(/_(.)/g, function(match, char, offset) {
          return offset === 0 ? match : char.toUpperCase();
        });
        path.get('name').replace(name);
      }
      return false;
    }
  });

  fs.writeFileSync(filepath, recast.print(ast).code);
}


glob('src/**/*.js', function(err, files) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  files.forEach(compile);
});
