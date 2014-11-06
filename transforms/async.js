/**
 * @fileoverview
 * This transform creates a sync copy of all async functions and changes the
 * async function to call a delegate instead.
 */

"use strict";
var path = require('path');
var recast = require('recast');
var types = recast.types;
var builders = types.builders;

function buildCallTo(delegateName, functionName, args) {
    return builders.returnStatement(
      builders.awaitExpression(
        builders.callExpression(
          builders.identifier(delegateName),
          [
            builders.literal(functionName),
            builders.arrayExpression(args)
          ]
        )
      )
    );
}

function buildRequireStatement(path, name) {
  return builders.variableDeclaration('var', [
    builders.variableDeclarator(
      builders.identifier(name),
      builders.callExpression(
        builders.identifier('require'),
        [builders.literal(path)]
      )
    )
  ]);
}

var exportsExpression = builders.memberExpression(
  builders.identifier('module'),
  builders.identifier('exports'),
  false
);

function transform(filename, source, opts) {
  var ast = recast.parse(source, {
    sourceFileName: filename,
  });
  var delegateName = opts.delegateName;
  var asyncFuncs = [];

  if (filename.indexOf(opts.delegateName) === -1) {
    types.visit(ast, {
      isTopLevel: function(path) {
        return path.parent.node === ast.program;
      },

      removeAwaits: function(path) {
        types.visit(path, {
          visitAwaitExpression: function(path) {
            path.replace(path.get('argument'));
            return false;
          }
        });
      },

      visitProgram: function(p) {
        this.traverse(p);
        if (asyncFuncs.length > 0) {
          var delegatePath = path.join(path.relative(
            path.dirname(filename),
            path.resolve(opts.delegatePath)
          ), delegateName);

          var moduleBody = p.get('body');
          moduleBody.unshift(
            buildRequireStatement(delegatePath, delegateName)
          );

          asyncFuncs.forEach(function(name) {
            name = builders.identifier(name);
            moduleBody.push(
              builders.expressionStatement(
                builders.assignmentExpression(
                  '=',
                  builders.memberExpression(exportsExpression, name, false),
                  name
                )
              )
            );
          });
        }
      },

      visitFunctionDeclaration: function(path) {
        var node = path.node;
        if (node.async && this.isTopLevel(path)) {
          var asyncName = 'gen_' + node.id.name;
          var syncDeclaration = builders.functionDeclaration(
            node.id,
            node.params,
            builders.blockStatement(node.body.body)
          );
          path.insertAfter(syncDeclaration);

          path.get('body', 'body').replace([
            buildCallTo(delegateName, node.id.name, node.params)
          ]);
          path.get('id').replace(builders.identifier(asyncName));
          this.removeAwaits(syncDeclaration);
          asyncFuncs.push(asyncName);
        }
        return false;
      }
    });
  }
  return recast.print(ast, {sourceMapName: filename});
}

module.exports = transform;
