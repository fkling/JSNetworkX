'use strict';

import {numberOfCliques} from '../clique';
import {triangles} from '../cluster';

/**
 * Returns `false` if graphs are definitely not isomorphic.
 * `true` does **not** guarantee isomorphism.
 *
 * Checks for matching degree, triangle, and number of cliques sequences.
 *
 * @param {!Graph} G1
 * @param {!Graph} G2
 * @return {boolean}  `false` if graphs are definitely not isomorphic.
 */
export async function couldBeIsomorphic(G1, G2) {
  // Check global properties
  if (G1.order() !== G2.order()) {
    return false;
  }

  // Check local properties
  var degree1 = G1.degree();
  var triangles1 = await triangles(G1);
  var cliques1 = await numberOfCliques(G1);
  var props1 = [];
  degree1.forEach((_, v) => {
    props1.push([degree1.get(v), triangles1.get(v), cliques1.get(v)]);
  });
  props1.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

  var degree2 = G2.degree();
  var triangles2 = await triangles(G2);
  var cliques2 = await numberOfCliques(G2);
  var props2 = [];
  degree2.forEach((_, v) => {
    props2.push([degree2.get(v), triangles2.get(v), cliques2.get(v)]);
  });
  props2.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

  return props1.every((a, i) => {
    var b = props2[i];
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  });
}

/**
 * Returns `false` if graphs are definitely not isomorphic.
 * `true` does **not** guarantee isomorphism.
 *
 * Checks for matching degree and triangle sequences.
 *
 * @param {!Graph} G1
 * @param {!Graph} G2
 * @return {boolean}  `false` if graphs are definitely not isomorphic.
 */
export async function fastCouldBeIsomorphic(G1, G2) {
  // Check global properties
  if (G1.order() !== G2.order()) {
    return false;
  }

  // Check local properties
  var degree1 = G1.degree();
  var triangles1 = await triangles(G1);
  var props1 = [];
  degree1.forEach((_, v) => {
    props1.push([degree1.get(v), triangles1.get(v)]);
  });
  props1.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  var degree2 = G2.degree();
  var triangles2 = await triangles(G2);
  var props2 = [];
  degree2.forEach((_, v) => {
    props2.push([degree2.get(v), triangles2.get(v)]);
  });
  props2.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  return props1.every((a, i) => {
    var b = props2[i];
    return a[0] === b[0] && a[1] === b[1];
  });
}

/**
 * Returns `false` if graphs are definitely not isomorphic.
 * `true` does **not** guarantee isomorphism.
 *
 * Checks for matching degree sequences.
 *
 * @param {!Graph} G1
 * @param {!Graph} G2
 *
 * @return {boolean}  False if graphs are definitely not isomorphic.
 *
 * @export
 */
export async function fasterCouldBeIsomorphic(G1, G2) {
  // Check global properties
  if (G1.order() !== G2.order()) {
    return false;
  }

  // Check local properties
  var degree1 = Array.from(G1.degree().values());
  degree1.sort((a, b) => a - b);

  var degree2 = Array.from(G2.degree().values());
  degree2.sort((a, b) => a - b);

  return degree1.every((v, i) => v === degree2[i]);
}

//TODO: is_isomorphic
