# Changlog

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
