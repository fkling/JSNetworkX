# JSNetworkX - NetworkX for JavaScript

**JSNetworkX** is a port of [NetworkX](http://networkx.lanl.gov/) v1.6, a popular
graph library for Python, to JavaScript.

JSNetworkX allows you to build, process and analyze graphs in JavaScript. It 
can be used together with [D3.js](http://d3js.org/) in the browser to create 
interactive graph visualizations.

Have a look at the [wiki](https://github.com/fkling/JSNetworkX/wiki) for more information.

## How to use

### Browser
Simply download [jsnetworkx.js](jsnetworkx.js) and include it in your page:

    <script src="jsnetworkx.js></script>

The [`dist/` folder](dist/) contains different versions, depending on your needs. These
are:

- `jsnetworkx-base.js`: Contains only graph classes and utiliy functions, no 
  algorithms, generators, visualization etc.
- `jsnetworkx-drawing.js`: Like the base version, but with visualization.
- `jsnetworkx-node.js`: A special node version with everything but
  visualization.

(**Note:** Even tough the "base" version does not include algorithms explicitly,
some might be included due to internal dependencies)

If you want to [visualize
graphs](https://github.com/fkling/JSNetworkX/wiki/Drawing-graphs), you have to 
include [D3.js](http://d3js.org/) as well.

### Node
Install JSNetworkX with

    npm install https://github.com/fkling/JSNetworkX.git

The package will be made available as official node module once it reaches an
undetermined feature completeness level.

## How to build

If you want to contribute to JSNetworkX or just want to choose which modules 
are included in the library, you want to build JSNetworkX yourself.

JSNetworkX uses [grunt](http://gruntjs.com/) as build system, which sits on top 
of [Node](http://nodejs.org/) (you will also need [npm](https://npmjs.org/)).

If you followed the instructions to install Node and npm, you can install the 
grunt command line interface with:

    npm install -g grunt-cli

For more information, have a look at the official [grunt
documentation](http://gruntjs.com/getting-started).

The `package.json` file contains a set of node packages which JSNetworkX needs in
addition to grunt. You can install those locally by executing the following 
command in your JSNetworkX clone:

    npm install

Last but not least, since JSNetworkX uses the [Google closure
library](https://developers.google.com/closure/library/) and the
[Google closure compiler](https://developers.google.com/closure/compiler/), you 
have to provide those as well, in the folders `vendor/closure-library` and 
`vendor/closure-compiler` resp.
The closure library can be installed via Git:

    mkdir vendor/
    git clone https://code.google.com/p/closure-library/ vendor/closure-library/

If the files in `vendor/closure-library/closure/bin` are not executable, change
them to be:

    chmod -R +x vendor/closure-library/closure/bin/*

Download the compiler with

    wget -nc http://closure-compiler.googlecode.com/files/compiler-latest.zip \
    && unzip compiler-latest.zip -d vendor/closure-compiler/ \
    && rm compiler-latest.zip

---

Now we are ready to build! To check whether the closure library and compiler are
correctly installed, run

    grunt check

All versions of JSNetworkX are built via `grunt compile`. This task accepts
various targets:

- `grunt compile:base` builds a version only containing base classes and
  utilities (no algorithms, generators or drawing).
- `grunt compile:drawing` like `base`, but includes drawing.
- `grunt compile:all` includes everyting.
- `grunt compile:node` like, `all`, but without drawing.
- `grunt compile:custom` like, `base`, but also includes all modules specified 
 with the `--ns` options. The modules can be passed with or without the leading 
 `jsnx.` namespace.

All builds apart from `all` and `custom`  are put into `dist/`.

Here are some examples for custom builds. This will build JSNetworkX with all 
generators:

    grunt compile:custom --ns=generators

It is the same as 

    grunt compile:custom --ns=jsnx.generators

This build only contains the isomorphism algorithms and classic generators:

    grunt compile:custom --ns=algorithms.isomorphism,generators.classic

**Note:** Most modules have internal dependencies, so the final build will
likely contain other modules as well.

## How to contribute

You can contribute by simply **using** JSNetworkX and telling me what is good or
bad!

If you want to code, there are still many generators and algorithms left to
port. For style guidelines, have a look at existing code, the [Google JavaScript
Style
Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
and the [annotation guidelines for the closure
compiler](https://developers.google.com/closure/compiler/docs/js-for-compiler).
You can always contact me if you have any questions.

**Important:** If you start porting a specific file or method, please open an
issue, so that everyone knows this is being worked on.

**Important 2:** Use [version
1.6](https://github.com/networkx/networkx/tree/networkx-1.6) of NetworkX.

Some general remarks:

- For the structure of test cases, have a look at existing tests.
- Port as many tests as you can. Sometimes tests depend on other, not-yet-ported
  methpods (e.g. generators). If those are simple to port, do it. If not, let it
  be, but make sure there are other test cases which pass.
- Sometimes you don't want to port all methods in a file or test case. That's
  ok, but please add a `//TODO: <method_name>` line where this method would have
  been.
  This makes it easier to track what is still missing.

### How to run tests and other things

To test both, compiled and uncompiled code, run `grunt test`.  It will first build
an uncompiled verison of JSNetworkX and test it. If that test is successful, a compiled
version is created and also tested. If you add new modules, you have to updated the
dependency file first by running `grunt deps`. 


To ensure generally good style, run `grunt jshint`. Sometimes it is necessary to
disable certain warnings, such as creating functions in a loop, but you should
do this in exceptional cases. Please visit the [JSHint
documentation](http://www.jshint.com/docs/) for more.

Finally, to build the complete library, run `grunt buildall`. It will run
JSHint, the tests and will compile the different versions.
