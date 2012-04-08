# JSNetworkX - NetworkX for JavaScript

JSNetworkX is a port of [NetworkX](http://networkx.lanl.gov/), a popular graph library for Python, to JavaScript. 

The following libraries are or will be used by JSNetworkX:

- [Jasmine](http://pivotal.github.com/jasmine/) for testing
- [Closure Library](https://developers.google.com/closure/library/) as base framework
- [D3](http://mbostock.github.com/d3/) for visualization

The [Closure Compiler](https://developers.google.com/closure/compiler/) is used to minimize and optimize the code.

**Note:** JSNetwerkX is under heavy development and so far only `Graph`, `DiGraph` and
the functions from `networkx.classes.function` are available.

## Usage

JSNetworkX provides the same interface as the original NetworkX library. All
functions and classes are available under the `jsnx` namespace. 

**Example:**

    var G = new jsnx.Graph(); // or just jsnx.Graph();
    G.add_node(1);
    G.add_nodes_from([2,3]);
    G.add_edge(1,3);

For more information about the methods have a look at the [NetworkX](http://networkx.lanl.gov/) site for now.


### Important differences from the Python version

JavaScript is not Python, therefore, some of the more advanced features, such as generators or certain "magic methods" are not available. This is a list of the most significant differences.

#### Data types which can be nodes

In Python, each *hashable* object can be a node. This holds for JavaScript as well, to some degree. Since nodes are stored as keys of an object, all nodes are essentially mapped to strings.  
This bears no problem for strings or numbers (but see below!) but each other type has to be handled with care. For example, the default string representation of any object is `[object Object]`. This implies that even two different objects will map to the same node.  
So, each object/value which should be used as a node, has to override the `toString()` method, if necessary.

Even more attention has to be paid when retrieving nodes from the graph. Since all nodes are converted to string, only the string representation of the node can be returned (e.g. node `1` becomes `'1'`).

If the original data is required, it is advised to either add it as a node data or maintain an external map.  
Maybe in future versions we include a way to store and return the original node data, but this some careful planning since it implies bigger changes to the original code. 


#### Node access

In Python, one can simply access a node of a graph using `G[n]`. Theoretically this is possible in JavaScript as well, but to keep the implementation simple, JSNetworkX does not provide this possibility. Instead, one has to use either `G.get_node(n)` or simply `G.node[n]`.


#### Iterators and Generators

The official JavaScript standard (ECMAScript) does not support iterators yet. Mozilla's javaScript implementation provides them in version 1.7. But since this is not supported by other browsers, it is not really usabled. Nevertheless, we use Closure's iterator implementation which is compatiable to Mozilla's.

Each object which implements an `.__iterator__()` function which returns an object having a `.next()` method (can be the same object) can be used as iterator.

Such an object is returned by each graph method which is supposed to return a generator. **Note:** When using the Google CLosure Compiler with `ADVANCED OPTIMIZATIONS`, `__iterator__` is renamed and not available to outside code. However you can still use JSNetworksX methods to iterate over the container.

##### Examples

Using JSNetworkX' `forEach`:

    jsnx.forEach(G.nodes_iter(), function(node) {
        console.log(node);
    });

Using a `for` loop:

    // jsnx.sentinelIterator wraps an iterator to return a sentinel value instead of throw a StopIteraton expecption
    var gen = jsnx.SentinelIterator(G.nodes_iter(), null);
    for(var node = gen.next(); node !== null; node = gen.next()) {
        console.log(node);
    }


#### Keyword arguments

JavaScript only provides positional arguments. In keys a method acceptes a variable number of keyword arguments, a dictionary (object) has to be passed instead.  
For example, adding a node with data:

    G.add_node('foo', data=42)

becomes

    G.add_node('foo', {data: 42});

#### Optional arguments

Some methods have one or more optional arguments. In Python one can simply use keyword arguments to pass the desired arguments. In JSNetworkX, optional arguments can be omitted, as long as the arguments are of different types and therefore distinguishable.

For example, this is ok:

    // Python: G.edges(data=true)
    G.edges(true);

but this is ambigious:

    // Python: G.degree(weight='weight')
    G.degree('weight'); // get node with name 'weight' or is the weight attribute name 'weight' ?

In this case we decided to interpret the argument as node name. To set the `weight` attribute name and get all nodes, `null` or `undefined` has to be passed as first argument:

    G.degree(null, 'weight');

----

## Development

The development for JSNetworkX has just started, the rough roadmap is as follows:

- Port unit tests to Jasmine (ongoing)
- Port base classes (mostly done)
- Implement renderer with D3
- Port algorithms module

To ease the developement, we built JSNetworkX on top of Closure Library. This allows us also to use some more adanvaced features of the Google Closure Compiler and provides
a solid structure for the code.

Stay tuned!

### Notes

The code is scattered with using bracket notation to access properties (`foo['bar']`) instead of dot notation (`foo.bad`). This is ugly, I know. But it is necessary to make the code work well with the Closure Compiler in advanced mode. This mode drastically reduces the file size.


---

## Build instructions

To build the library on your own you need [`ant`](http://ant.apache.org/). `ant compile` will download all necessary dependencies
(Closure library and compiler) and compile the files.
