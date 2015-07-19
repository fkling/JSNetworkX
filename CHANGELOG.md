# Changlog

## v0.3.4

### New

#### API/Algorithms

Binary graph operators:

- union / genUnion
- disjointUnion / genDisjointUnion
- intersection / genIntersection
- difference / genDifference
- symmetricDifference / genSymmetricDifference
- compose / genCompose

### Fixed

- Issue with zoom on double click since d3 v3.5.5 (#51)


## v0.3.3

### Changes

It is now possible to require individual modules and still get the
benefits of async code execution through workers.

Example:

```
var completeGraph = require('jsnetworkx/node/generators/classic').completeGraph;
var cluster = require('jsnetworkx/node/algorithms/cluster');
var WorkerSettings = require('jsnetworkx/node/WorkerSettings');
var initializeBrowserWorker = require('jsnetworkx/node/initializeBrowserWorker');

global.genClustering = cluster.genClustering;
global.completeGraph = completeGraph;
WorkerSettings.methodLookupFunction = function(name) {
  return cluster[name];
};
initializeBrowserWorker();
```

This is a custom module which only exposes `completeGraph` and `genClustering`.

`WorkerSettings.methodLookupFunction`

This function is used by the worker (and `delegateToSync`!) to resolve
the method name the worker receives, to the actual function. E.g. the
prebuilt version of JSNetworkX uses `name => jsnx[name]`.

`initializeBrowserWorker`

This function tests whether we are in a worker environment and if yes,
sets up the event handlers and takes care of (de)serializing the data.
This function should be called in the worker script.

Given the example above, the custom bundle could be created with

  JSNETWORKX_BUNDLE='bundle.js' browserify test.js > bundle.js


## v0.3.2

### New

#### API/Algorithms

- eigenvectorCentrality (genEigenvectorCentrality)


## v0.3.1

### New

#### API/Algorithms

Weighted and generic shortest path algorithms. The "generic" functions provide
a single interface for weighted and unweighted algorithms.

- allPairsDijkstraPath
- allPairsDijkstraPathLength
- dijkstraPath
- dijkstraPathLength
- singleSourceDijkstra
- singleSourceDijkstraPath
- singleSourceDijkstraPathLength
- shortestPath
- shortestPathLength
- hasPath

including async (gen\*) versions.

## v0.3.0

### New

#### API

- Many algorithms are now available as asynchronous methods. E.g. `clustering`
  is available as `genClustering`. Those methods return a `Promise` and will
  delegate to a web worker in browsers. In Node.js, a new process will be
  spawned.  
  Note that in both cases the data has to be serialized, which happens
  synchronously and may also take some time, depending on the size of the
  graph.

#### Drawing

- New drawing option `stickyDrag`. If set to `true`, the dragged node will keep
  its new position after dragging and is not subject to the force layout.
  [D3 example](http://bl.ocks.org/mbostock/3750558/5093e88c0462173a3d7b5859d7db75fbf5a7d8b8).


### Changes

#### API

- Moved from `underscore_method_names` to `camelCaseMethodNames`.
- makeSmallUndirectedGraph and makeSmallGraph now accept an object of the form
  `{type, name, n, list}` as first argument instead of an array `[type, name, n,
  list]`.
- Objects are not considered as "NodeContainers" anymore. Previously, any function
  that accepted a list of nodes also accepted an object of the form
  `{n1: ..., n2: ..., ...}` and `n1`, `n2`, ... would have been treated as nodes.
  Instead, any object that implements the [ES6 iterator protocol][iterator]
  can be used.
  This includes (by default) arrays and generator functions.
- Graph classes cannot be instantiated without `new` anymore. I.e. you have to use
  `var G = new jsnx.Graph();` instead of `var G = jsnx.Graph();`. That's because
  ES6 classes cannot be called without `new`.
- The utility methods `cumulative_sum`, `generate_unique_node` and
  `is_list_of_ints` have been removed, since there was no need for them.

### Algorithms

- `balancedTree` doesn't set the height to `2` anymore if the branching factor is
  `1`. So `balancedTree(1, 4)` is equivalent to `pathGraph(4)`.

#### Drawing

- Like with method names, drawing options are `camelCase` now instead of
  `under_score`.


### Fixed

#### Drawing

  - Fixed dragging (canvas doesn't pan while node is dragged).

[iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
