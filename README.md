# WIP - Convertion to ES6 and CJS modules

**Note:** If you are reading this, then you are looking at the WIP branch. This
branch is unstable and only has the purpose to keep interested users up-to-date
about the progress, get feedback and help!

I assume you know what JSNetworkX is, if not, look at the readme of the master
branch.

## What is this branch about?

This branch represents that part of JSNetworkX that has been converted to ES6 and
CJS modules. It will eventually become master.

### Why are you moving to ES6 and CJS modules?

To simplify the code base, which is supposed to make it easier to understand and
maintain the code base, which in turn makes it easier for others to contribute.

The main problem is that this project has not enough contributers.

Node.js became so popular over the last years that most JS devs will already be
familiar with it.

Every JS developer has to make themselves familiar with ES6 at some point. This
is probably easier and more valuable than learning a specific framework (see next
section).

### What do you think lead to this situation?

Using **Google Closure**. I think that the Google Closure Compiler is a great tool, but,
together with the Closure library, it may not be the right tool for an OS project.
I simply made the wrong choice back then.

Contributing is more difficult because the contributer has to learn about
the compiler, the library and all the specific rules to follow, to make the compiler
work properly. It's difficult for a one person project to convince others to learn
about it and use it.

In addition, it requires you to install Java. One could make the same
argument about Node.js, but, as a JavaScript developer, what is more likely to
run on your machine already?

**Python port**. Maybe there are fewer developers than I thougjt,  who
a) know JavaScript, b) know Python, c) are interested in graph processing.

### Priorities

While the JSNetworkX has started with the intent to great a complete graph processing
and visualization package, this may have been too ambitious of a goal. There are
other projects dedicated to graph visualization only, which do a much better
job at this.

However, I don't think there is a complete graph *processing* package out there,
so the main focus will be *feature completenes* with NetworkX (1.6 at least),
and to work as a platform for other graph algorithms not included in NetworkX.

Visualization will stay a part, but we should also explore options how to
make it easy to use other visualization libraries with JSNetworkX.

### Next Steps

- Phase 1: Convert existing stuff
  - [x] Convert helper functions and base (simple) graphs
  - [] Convert generators
  - [] Convert algorithms
  - [] Convert multi graphs
  - [] Publish version 0.3.0

- Phase 2: Become feature complete and other improvements
  - Feature completeness
    - [] Implement missing algorithms
    - [] Implement missing generators (are there any?)
    - [] Implement missing utility functions
  - Improvements / new features
    - [] Evaluate how React could simplify the rendering process
    - [] Async algorithm implementation (e.g. with web workers)

### Open question to the community

Restructuring the code base is also a good opportunity to rethink certain design
decisions. Here are some questions I would love to get some input on. Feel free
to create an issue for them if it doesn't exist already:

- Method naming convention: Should we stick with underscores (to be compatible
with Python) or use the more common camelCase notation?

- Promises and algorithms: We cannot do CPU intensive computations without
asynchronous processing (e.g. web workers). Should we unify the API and always
return promises from all algorithm functions, or only do this in an extra build
which supports async processing?

- More will surely follow...

## How to contribute

You can contribute by:

- Converting existing code from the master branch to ES6 and CJS
- Porting code from Python

Porting from Python will become easier the more existing was converted. If you
plan on converting/porting a specific part, please create an issue beforehand.

## Build JSNetworkX

First install all dependencies via

    npm install

You will also have to install `gulp`, the build system we use:

    npm install -g gulp

Then you build a standalone, minified version of JSNetworkX, which can be used in
the browser with

    gulp build

A non-minified verison can be built with

    gulp build-dev

Because the code also has to be transformed to be able to run in Node.js,

    gulp node

simply transforms all modules and saves them inside the `node/` directory. These
modules are also used to tun the unit tests.

## Create and run tests

Tests are stored in the respective `__tests__` directories and have to follow
the naming convention `<testname>-test.js`. The tests can be run with

    gulp test
    # or
    npm test

The tests in Node, so you first have to build the Node version with

    gulp node

You can also only incrementally transform changed files via

    gulp watch-node

Ideally, every module has corresponding unit test. If you port a module from Python, make sure to implement the same tests.

Eventually we will add coverage and maybe performance tests.
