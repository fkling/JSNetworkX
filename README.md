# JSNetworkX [![Build Status](https://travis-ci.org/fkling/JSNetworkX.svg?branch=es6_WIP)](https://travis-ci.org/fkling/JSNetworkX)

JSNetworkX allows you to build, process and analyze graphs in JavaScript. It
can be used together with D3.js in the browser to create interactive graph
visualizations.

It is a port of [NetworkX](http://networkx.lanl.gov/) (v1.6), a
popular graph library for Python, to JavaScript. Extensive information can
be found on:

- the [website][]
- the [API documentation][api]
- the [wiki][]

## Install

### Node.js

Install from [npm][]:

```
npm install jsnetworkx
```

### Browser

Download [jsnetworkx.js](./jsnetworkx.js) and include it in your page with

```
<script src="/path/to/jsnetworkx.js"></script>
```

This will create the global variable `jsnx`, with which all functions can be
accessed.

## Usage

JSNetworkX consists of multiple parts which work closely together:

- Graph classes (`Graph`, `DiGraph`, `MultiGraph` and `MultiDiGraph`) to model
  the data
- Graph generators for common graphs
- Various graph algorithms
- Graph visualization (in the browser)

Most classes and functions are available on the root object (`jsnx` in
browsers, `require('jsnetworkx')` in Node).

Information about which algorithms are available and the API of the classes,
can be found in the auto-generated [API documentation][api].

### Example

```js
// var jsnx = require('jsnetworkx'); // in Node

// a tree of height 4 with fan-out 2
var G = jsnx.balancedTree(2, 4);

// Compute the shortest path between node 2 and 7
var path = jsnx.bidirectionalShortestPath(G, 2, 7);
// [ 2, 0, 1, 3, 7 ]

// or asynchronously
jsnx.genBidirectionalShortestPath(G, 2, 7).then(function(path) {
  // path = [ 2, 0, 1, 3, 7 ]
});
```

More examples can be found on the [website][].

### Asynchronous computation

All the algorithms are implemented in a synchronous fashion (for now at least).
However, many algorithms are also available as asynchronous version. Their
names are `gen<SyncFunctionName>` (see example above) and they return a
Promise.

This is achieved in **browsers** by creating a [WebWorker][]. The WebWorker has
to be passed the path to the `jsnetworkx.js` file. You have to set the path
explicitly if the file is not located at the root:

```js
jsnx.workerPath = '/path/to/jsnetworkx.js';
```

In **Node**, a subprocess will be spawned (no setup is required).

**Caveat:** In both cases the input data has to be serialized before it can be
sent to the worker or subprocess. However, not every value can be serialized, in
which case JSNetworkX will use the synchronous version instead. If you
encounter a situation where a value is not serialized, but it should be
serializable, please file an [issue][].


### Iterables

Many methods return generators or Maps. In an ES2015 environment, these can be
easily consumed with a [`for/of`][forof] loop or [`Array.from`][arrayfrom].

If those are not available to you, JSNetworkX provides two helper methods for
iterating iterables and converting them to arrays: `jsnx.forEach` and
`jsnx.toArray`

---

## How to contribute

You can contribute by:

- Porting code from Python
- Improving the documentation/website

If you plan on converting/porting a specific part, please create an issue
beforehand.

### Build JSNetworkX

JSNetworkX is written in ES2015 (ES6) and [Babel][] is used to convert it to
ES5. For the browser, all modules are bundled together with [browserify][].

To build JSNetworkX, all dependencies have to be installed via

    npm install

#### Build for the browser

    npm run build:browser

creates `jsnetworkx.js`,  a minified version for production.

    npm run build:browser:dev
    npm run watch:browser

Creates `jsnetworkx-dev.js`, an unminified version with inline source maps for
development. The second version automatically rebuilds the file on change.

#### Build for Node

    npm run build:node

Transforms all modules to ES5 and saves them inside the `node/` directory.

    npm run build:node:dev

Same as above but with inline source maps. These modules are also used to tun
the unit tests.

    npm run watch:node

Incrementally transform modules when files change.

### Create and run tests

Tests are stored in the respective `__tests__` directories and have to follow
the naming convention `<testname>-test.js`. The tests can be run with

    npm test
    # or
    npm run test:fast # if you also run `npm run watch:node`

This will run all tests by default. To consider only those files whose path
matches a specific string, pass the `-g` option:

    # Runs all digraph tests but no graph tests
    npm run test:fast -- -g digraph

The difference between `npm test` and `npm run test:fast` is that the former
will always transplile all files from ES6 to ES5 first. This is slow and
annoying during development. Therefore you can use

    npm run watch:node

to automatically convert only the changed file and run `npm run test:fast` to
quickly test them.

Ideally, every module has corresponding unit test. If you port a module from
NetworkX, make sure to implement the same tests.

### Run coverage

We use [istanbul][] to generate a coverage report. We are not enforcing any coverage
yet, but there should not be a regression. The report can be created via

    npm run cover

and written to `coverage/`.


[issue]: https://github.com/fkling/JSNetworkX/issues
[npm]: https://www.npmjs.com/
[website]: http://jsnetworkx.org
[api]: http://jsnetworkx.org/api/
[wiki]: https://github.com/fkling/JSNetworkX/wiki
[WebWorker]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
[Babel]: https://babeljs.io/
[browserify]: http://browserify.org/
[istanbul]: https://gotwarlost.github.io/istanbul/
[forof]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
[arrayfrom]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
