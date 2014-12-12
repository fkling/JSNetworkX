"use strict";

var assign = require('./assign');

assign(exports, {
  Map: require('./Map'),
  Set: require('./Set'),
  assign: assign,
  clone: require('./clone'),
  clear: require('./clear'),
  deepcopy: require('./deepcopy'),
  gcd: require('./gcd'),
  genCombinations: require('./genCombinations'),
  genPermutations: require('./genPermutations'),
  genRange: require('./genRange'),
  fillArray: require('./fillArray'),
  forEach: require('./forEach'),
  isArray: require('./isArray'),
  isArrayLike: require('./isArrayLike'),
  isBoolean: require('./isBoolean'),
  isGraph: require('./isGraph'),
  isIterable: require('./isIterable'),
  isIterator: require('./isIterator'),
  isMap: require('./isMap'),
  isPlainObject: require('./isPlainObject'),
  iteratorSymbol: require('./iteratorSymbol'),
  iteratorToArray: require('./iteratorToArray'),
  mapIterator: require('./mapIterator'),
  max: require('./max'),
  next: require('./next'),
  range: require('./range'),
  someIterator: require('./someIterator'),
  toArray: require('./toArray'),
  toIterator: require('./toIterator'),
  tuple: require('./tuple'),
  size: require('./size'),
  sprintf: require('./sprintf'),
  zipIterator: require('./zipIterator'),
  zipSequence: require('./zipSequence'),
});

assign(
  exports,
  exports.tuple
);
