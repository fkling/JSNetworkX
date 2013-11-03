function get_values(obj) {
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}

function max_of_values(obj) {
    var arr = get_values(obj);
    return Math.max.apply( null, arr );
}


function min_of_values(obj) {
    var arr = get_values(obj);
    return Math.min.apply( null, arr );
}

//goog.provide('jsnx.algorithms');
//jsnx.algorithms.distance_measures.eccentricity = function(G, v){


function eccentricity(G, v, sp){
    var node, nodes, length, L;
    var e = {};
    var order = G.order();

    if (v === undefined){
        nodes = G.nodes();
    } else {
        nodes = jsnx.toArray(G.nbunch_iter(v.id));
    }

    for (var i = 0; i < nodes.length; i++) {
        node = nodes[i];
        // if no shortest path dict is given, run shortest path.
        if (sp === undefined){
            length = jsnx.single_source_shortest_path_length(G, G.nodes()[i]).D;
            L = jsnx.toArray(length).length;
        } else {
            length = sp[n];
            L = jsnx.toArray(length).length;
        }
        if (L != order){
            console.log("Graph not connected, infinite path length");
        }
        // Take the maximum of the length values.
        e[node] = max_of_values(length);                
    }
    if (v in G.nodes()){
        return e[v];
    } else {
        return e;
    }   
}

function diameter(G, e){
    if (e === undefined){
        e = eccentricity(G);
    }
    return max_of_values(e);    
}
    
function periphery(G, e){
    if (e === undefined){
        e = eccentricity(G);
    }
    var diameter = max_of_values(e);
    var p = [];
    var keys = Object.keys(e);
    for (var i=0; i<keys.length; i++){
        var v = keys[i];
        if (e[v] == diameter){
            p.push(v);
        }
    }
    return p;
}

function radius(G, e){
    if (e === undefined){
        e = eccentricity(G);
    }
    return min_of_values(e);
}

function center(G, e){
    if (e === undefined){
        e = eccentricity(G);
    }
    var radius = min_of_values(e);
    var p = [];
    var keys = Object.keys(e);
    for (var i=0; i<keys.length; i++){
        var v = keys[i];
        if (e[v] == radius){
            p.push(v);
        }
    }
    return p;
}

function sum(arr){
    var total = 0;
    for (var i = 0; i < arr.length; i++) {
        total += arr[i] << 0;
    }
    return total;
}

function average_shortest_path_length(G, weight){
    /*
    if (G.is_directed()){
        if (!jsnx.is_weakly_connected(G)){
            throw "Graph is not connected.";
        }
    } else {
        if (!jsnx.is_connected(G)){
            throw "Graph is not connected";
        }
    }*/
    var avg = 0.0;
    var nodes = G.nodes();
    var n = nodes.length;
    if (weight === undefined){
        for (var i = 0; i < n; i++){
            node = nodes[i];
            path_length = jsnx.single_source_shortest_path_length(G, node);
            var vals = get_values(path_length.D);
            avg += sum(vals);
        }
    } else {
        for (var i = 0; i < n; i++) {
            node = nodes[i];
            path_length = jsnx.single_source_dijkstra_path_length(G, node, weight);
            avg += sum(get_values(path_length));
        }
    }
    return avg/(n*(n-1));
}

function star_graph(n){
    var G = jsnx.Graph();
    G.add_node(0);
    for (var i=1; i<=n; i++){
        G.add_edge(0, i);
    }
    return G;
}
