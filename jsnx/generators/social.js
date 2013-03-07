"use strict";
/**
 * @fileoverview Famous social networkx
 */

goog.provide('jsnx.generators.social');

goog.require('jsnx.classes.Graph');
goog.require('jsnx.helper');
goog.require('goog.array');


/**
 * Return Zachary's Karate club graph.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.social.karate_club_graph = function() {
  var G = new jsnx.classes.Graph();
  G.add_nodes_from(jsnx.helper.range(34));
  G.name("Zachary's Karate Club");

  var zacharydat = [
    '0 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 0 1 0 1 0 1 0 0 0 0 0 0 0 0 0 1 0 0',
    '1 0 1 1 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 1 0 1 0 0 0 0 0 0 0 0 1 0 0 0',
    '1 1 0 1 0 0 0 1 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0 1 0',
    '1 1 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 0 0 0 0 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 0 0 0 0 1 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 0 0 1 1 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 1 1',
    '0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1',
    '1 0 0 0 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '0 0 0 0 0 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 1 0 1 0 0 1 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 1 0 0 0 1 0 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 1 0 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 1',
    '0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 0 0 1',
    '0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 1',
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 1 0 0 0 0 0 1 1',
    '0 1 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1',
    '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 1 0 0 0 1 1',
    '0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 1 0 0 1 0 1 0 1 1 0 0 0 0 0 1 1 1 0 1',
    '0 0 0 0 0 0 0 0 1 1 0 0 0 1 1 1 0 0 1 1 1 0 1 1 0 0 1 1 1 1 1 1 1 0'
  ];

  var row = 0;
  goog.array.forEach(zacharydat, function(line) {
    var thisrow = line.split(' ');
    jsnx.helper.forEach(thisrow, function(val, col) {
      if (val === '1') {
        G.add_edge(row, col);
      }
    });
    row +=1;
  });

  return G;
};
goog.exportSymbol(
  'jsnx.karate_club_graph',
  jsnx.generators.social.karate_club_graph
);


/**
 * Return Davis Saouthern women social network.
 *
 * This is a bipartite graph.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.social.davis_southern_women_graph = function() {
  var G = new jsnx.classes.Graph();
  // top nodes
  G.add_nodes_from(
    [
      'Evelyn Jefferson',
      'Laura Mandeville',
      'Theresa Anderson',
      'Brenda Rogers',
      'Charlotte McDowd',
      'Frances Anderson',
      'Eleanor Nye',
      'Pearl Oglethorpe',
      'Ruth DeSand',
      'Verne Sanderson',
      'Myra Liddel',
      'Katherina Rogers',
      'Sylvia Avondale',
      'Nora Fayette',
      'Helen Lloyd',
      'Dorothy Murchison',
      'Olivia Carleton',
      'Flora Price'
    ],
    {bipartite: 0}
  );

  // bottom nodes
  G.add_nodes_from(
    [
      'E1',
      'E2',
      'E3',
      'E4',
      'E5',
      'E6',
      'E7',
      'E8',
      'E9',
      'E10',
      'E11',
      'E12',
      'E13',
      'E14'
    ],
    {bipartite: 1}
  );

  G.add_edges_from([
    ['Evelyn Jefferson','E1'],
    ['Evelyn Jefferson','E2'],
    ['Evelyn Jefferson','E3'],
    ['Evelyn Jefferson','E4'],
    ['Evelyn Jefferson','E5'],
    ['Evelyn Jefferson','E6'],
    ['Evelyn Jefferson','E8'],
    ['Evelyn Jefferson','E9'],
    ['Laura Mandeville','E1'],
    ['Laura Mandeville','E2'],
    ['Laura Mandeville','E3'],
    ['Laura Mandeville','E5'],
    ['Laura Mandeville','E6'],
    ['Laura Mandeville','E7'],
    ['Laura Mandeville','E8'],
    ['Theresa Anderson','E2'],
    ['Theresa Anderson','E3'],
    ['Theresa Anderson','E4'],
    ['Theresa Anderson','E5'],
    ['Theresa Anderson','E6'],
    ['Theresa Anderson','E7'],
    ['Theresa Anderson','E8'],
    ['Theresa Anderson','E9'],
    ['Brenda Rogers','E1'],
    ['Brenda Rogers','E3'],
    ['Brenda Rogers','E4'],
    ['Brenda Rogers','E5'],
    ['Brenda Rogers','E6'],
    ['Brenda Rogers','E7'],
    ['Brenda Rogers','E8'],
    ['Charlotte McDowd','E3'],
    ['Charlotte McDowd','E4'],
    ['Charlotte McDowd','E5'],
    ['Charlotte McDowd','E7'],
    ['Frances Anderson','E3'],
    ['Frances Anderson','E5'],
    ['Frances Anderson','E6'],
    ['Frances Anderson','E8'],
    ['Eleanor Nye','E5'],
    ['Eleanor Nye','E6'],
    ['Eleanor Nye','E7'],
    ['Eleanor Nye','E8'],
    ['Pearl Oglethorpe','E6'],
    ['Pearl Oglethorpe','E8'],
    ['Pearl Oglethorpe','E9'],
    ['Ruth DeSand','E5'],
    ['Ruth DeSand','E7'],
    ['Ruth DeSand','E8'],
    ['Ruth DeSand','E9'],
    ['Verne Sanderson','E7'],
    ['Verne Sanderson','E8'],
    ['Verne Sanderson','E9'],
    ['Verne Sanderson','E12'],
    ['Myra Liddel','E8'],
    ['Myra Liddel','E9'],
    ['Myra Liddel','E10'],
    ['Myra Liddel','E12'],
    ['Katherina Rogers','E8'],
    ['Katherina Rogers','E9'],
    ['Katherina Rogers','E10'],
    ['Katherina Rogers','E12'],
    ['Katherina Rogers','E13'],
    ['Katherina Rogers','E14'],
    ['Sylvia Avondale','E7'],
    ['Sylvia Avondale','E8'],
    ['Sylvia Avondale','E9'],
    ['Sylvia Avondale','E10'],
    ['Sylvia Avondale','E12'],
    ['Sylvia Avondale','E13'],
    ['Sylvia Avondale','E14'],
    ['Nora Fayette','E6'],
    ['Nora Fayette','E7'],
    ['Nora Fayette','E9'],
    ['Nora Fayette','E10'],
    ['Nora Fayette','E11'],
    ['Nora Fayette','E12'],
    ['Nora Fayette','E13'],
    ['Nora Fayette','E14'],
    ['Helen Lloyd','E7'],
    ['Helen Lloyd','E8'],
    ['Helen Lloyd','E10'],
    ['Helen Lloyd','E11'],
    ['Helen Lloyd','E12'],
    ['Dorothy Murchison','E8'],
    ['Dorothy Murchison','E9'],
    ['Olivia Carleton','E9'],
    ['Olivia Carleton','E11'],
    ['Flora Price','E9'],
    ['Flora Price','E11']
  ]);

  return G;
};
goog.exportSymbol(
  'jsnx.davis_southern_women_graph',
  jsnx.generators.social.davis_southern_women_graph
);


/**
 * Return Florentine families graph.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.generators.social.florentine_families_graph = function() {
  var G = new jsnx.classes.Graph();
  G.add_edge('Acciaiuoli','Medici');
  G.add_edge('Castellani','Peruzzi');
  G.add_edge('Castellani','Strozzi');
  G.add_edge('Castellani','Barbadori');
  G.add_edge('Medici','Barbadori');
  G.add_edge('Medici','Ridolfi');
  G.add_edge('Medici','Tornabuoni');
  G.add_edge('Medici','Albizzi');
  G.add_edge('Medici','Salviati');
  G.add_edge('Salviati','Pazzi');
  G.add_edge('Peruzzi','Strozzi');
  G.add_edge('Peruzzi','Bischeri');
  G.add_edge('Strozzi','Ridolfi');
  G.add_edge('Strozzi','Bischeri');
  G.add_edge('Ridolfi','Tornabuoni');
  G.add_edge('Tornabuoni','Guadagni');
  G.add_edge('Albizzi','Ginori');
  G.add_edge('Albizzi','Guadagni');
  G.add_edge('Bischeri','Guadagni');
  G.add_edge('Guadagni','Lamberteschi');
  return G;
};
goog.exportSymbol(
  'jsnx.florentine_families_graph',
  jsnx.generators.social.florentine_families_graph
);
