# JSNetworkX - NetworkX for JavaScript

**JSNetworkX** is a port of [NetworkX](http://networkx.lanl.gov/), a popular graph library for Python, to JavaScript.

JSNetworkX allows you to build, process and analyze graphs in JavaScript. It can be used together with [D3.js](http://d3js.org/) in the browser to create interactive graph visualizations.


Have a look at the [wiki](https://github.com/fkling/JSNetworkX/wiki) for more information.

## How to build

If you want to contribute to JSNetworkX or just want to choose which modules 
are included in the library, you want to build JSNetworkX yourself.

JSNetworkX uses [grunt](http://gruntjs.com/) as build system, which sits on top 
of [Node](http://nodejs.org/) (you will also need [npm](https://npmjs.org/)).

If you followed the instructions to install Node and npm, you can install the 
grunt command line interface with:

```bash
npm install -g grunt-cli
```

The `package.json` file contains a set of node packages which JSNetworkX needs in
addition to grunt. You can install those locally by executing the following 
command in your JSNetworkX clone:

```bash
npm install ./ --dev
```

Last but not least, since JSNetworkX uses the [Google closure
library](https://developers.google.com/closure/library/) and the
[Google closure compiler](https://developers.google.com/closure/compiler/), you 
have to provide those as well, in the folders `vendor/closure_library` and 
`vendor/closure_compiler` resp.  
The closure library can be installed via SVN:

```bash
svn checkout checkout http://closure-library.googlecode.com/svn/trunk/ vendor/closure_library/
```

and the compiler with

```bash
wget -nc http://closure-compiler.googlecode.com/files/compiler-latest.zip \
&& unzip compiler-latest.zip -d vendor/closure_compiler/ \
&& rm compiler-latest.zip
```

---

Now we are ready to build! To check whether the closure library and compiler are
correctly installed, run

```bash
grunt check
```

All versions of JSNetworkX are build via `grunt compile`. This task accepts
differnt targets:

- `grunt compile:min` builds a version only containing base classes and
  utilities (no algorithms, generators or drawing).
- `grunt compile:drawing` like `min`, but includes drawing.
- `grunt compile:all` includes everyting.
- `grunt compile:node` like, `all`, but without drawing.
- `grunt compile:custom` like, `min`, but also includes all modules specified 
 with the `--ns` options. The modules can be passed with or without the leading 
 `jsnx.` namespace.

All builds apart from `all` and `custom`  are put into `dist/`.

Here are some examples for custom builds:

This will build JSNetworkX with all generators:
```bash
grunt compile:custom --ns=generators
```
it is the same as 
```bash
grunt compile:custom --ns=jsnx.generators
```

This build only contains the ismorphism algorithms:
```bash
grunt compile:custom --ns=algorithms.isomorphism
```

**Note:** Most modules have internal dependencies, so the final build will
likely contain other modules as well.
