/**
 * @fileoverview
 * This transform creates a sync copy of all async functions and changes the
 * async function to call a delegate instead. I.e. the function
 *
 * export async function foo(a, b, c) {
 *  // implementation
 * }
 *
 * is converted to
 *
 * var delegateName = require('./path/to/delegateName');
 *
 * export function foo(a, b, c) {
 *   // implementation
 * }
 *
 * export function genFoo(a, b, c) {
 *   return delegateName('foo', [a, b, c]);
 * }
 *
 */

'use strict';
var babel = require('babel-core');
var path = require('path');

var t = babel.types;
var Transformer = babel.Transformer;

/**
 * This builds the call to the delegate function, i.e.
 *
 * return delegateName('functionName', args);
 */
function buildCallTo(delegateName, functionName, args) {
  return t.returnStatement(
    t.callExpression(
      t.identifier(delegateName),
      [
        t.literal(functionName),
        t.arrayExpression(args)
      ]
    )
  );
}

/**
 * This builds an require call to load the file located at `path` into `name`,
 * i.e.
 *
 * var name = require('path');
 */
function buildImportStatement(path, name) {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier(name))],
    t.literal(path)
  );
}

function makeSync(node) {
  node.async = false;
}

function createAsyncCopy(node, scope) {
  var name = node.id.name;
  var asyncName = 'gen' + name[0].toUpperCase() + name.substr(1);
  // The function doesn't actually have to be marked as async, since the
  // delegate function returns a promise anyway.
  var params = node.params.map(function(param) {
    if (t.isAssignmentPattern(param)) {
      param = param.left;
    }
    // convert patters to single variables
    if (t.isObjectPattern(param) ||
        t.isArrayPattern(param)) {
      return scope.generateUidIdentifierBasedOnNode(param);
    }
    return t.identifier(param.name);
  });
  var exportDeclaration = t.exportNamedDeclaration(
    t.functionDeclaration(
      t.identifier(asyncName),
      params,
      t.blockStatement([
        buildCallTo(delegateName, node.id.name, params)
      ])
    )
  );
  return exportDeclaration;
}

var delegateName = 'delegate';
var delegatePath = './src/_internals';
var insertAsync = false;

module.exports = new Transformer('async-to-sync', {
  Program: {
    enter: function() {
      insertAsync = false;
    },

    exit: function(node, parent, scope, file) {
      if (insertAsync) {
        // If we found any async functions, we have to require the delegate
        // method.
        var resolvedDelegatePath = path.join(path.relative(
          path.dirname(file.log.filename),
          path.resolve(delegatePath)
        ), delegateName);

        var moduleBody = node.body;
        moduleBody.unshift(
          buildImportStatement(resolvedDelegatePath, delegateName)
        );
      }
    },
  },

  AwaitExpression: function(node) {
    return node.argument;
  },

  Function: function(node) {
    makeSync(node);
    return node;
  },

  ExportNamedDeclaration: function(node, parent, scope) {
    if (t.isFunctionDeclaration(node.declaration, {async: true})) {
      // If the function is async and at the top level, we make it
      // sync and insert an async version after it.
      var ex = createAsyncCopy(node.declaration, scope);
      this.insertAfter(ex);
      insertAsync = true;
    }
  },
});
