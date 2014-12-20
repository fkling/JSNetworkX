# WIP - Convertion to ES6

**Note:** If you are reading this, then you are looking at the WIP branch. This
branch is unstable and only has the purpose to keep interested users up-to-date
about the progress, get feedback and help!

I assume you know what JSNetworkX is, if not, look at the readme of the master
branch.

## What is this branch about?

This branch represents that part of JSNetworkX that has been converted to ES6 and
is independent from the Google Closure library.
It will eventually become master.

### Next Steps

- Phase 1: Convert existing stuff
  - [x] Convert helper functions and base (simple) graphs
  - [x] Convert generators
  - [x] Convert algorithms
  - [x] Convert multi graphs
  - [ ] Convert drawing methods
  - [ ] Publish version 0.3.0

- Phase 2: Become feature complete and other improvements
  - Feature completeness
    - [ ] Implement missing algorithms
    - [ ] Implement missing generators
    - [ ] Implement missing utility functions
  - Improvements / new features
    - [ ] Evaluate how React could simplify the rendering process
    - [x] Async algorithm implementation (e.g. with web workers)

## How to contribute

You can contribute by:

- Porting code from Python
- Improve the documentation

If you plan on converting/porting a specific part, please create an issue beforehand.

### Build JSNetworkX

First install all dependencies via

    npm install

#### Build for browser

    npm run build:browser

creates `jsnetworkx.js`,  a minified version for production.

    npm run build:browser:dev

Creates `jsnetworkx-dev.js`, an unminified version with inline source maps for
development.

#### Build for node

    npm run build:node

Transforms all modules to ES5 and saves them inside the `node/` directory.

   npm run build:node:dev

Same as above but with inline source maps. These modules are also used to tun the unit tests.

   npm run watch:node

Incrementally transform modules when files change.

### Create and run tests

Tests are stored in the respective `__tests__` directories and have to follow
the naming convention `<testname>-test.js`. The tests can be run with

    npm test
    # or
    npm run test:fast

This will run all tests by default. To consider only those files whose path
matches a specific string, pass the `-g` option:

    # Runs all digraph tests but no graph tests
    npm test:fast -- -g digraph

The difference between `npm test` and `npm run test:fast` is that the former
will always transplile all files from ES6 to ES5 first. This is slow and
annoying during development. Therefore you can use

    npm run watch:node

to automatically convert only the changed file and run `npm run test:fast` to
quickly test them.

Ideally, every module has corresponding unit test. If you port a module from Python, make sure to implement the same tests.

### Run coverage

We use istanbul to generate a coverage report. We are not enforcing any coverage
yet, but there should not be a regression. The report can be created via

    npm run cover

and written to `coverage/`.
