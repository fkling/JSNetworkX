"use strict";

Object.assign(exports, {
  Map: require('./Map'),
  Set: require('./Set'),
  clone: require('./clone'),
  clear: require('./clear'),
  deepcopy: require('./deepcopy'),
  gcd: require('./gcd'),
  genCombinations: require('./genCombinations'),
  genPermutations: require('./genPermutations'),
  genRange: require('./genRange'),
  getDefault: require('./getDefault'),
  fillArray: require('./fillArray'),
  forEach: require('./forEach'),
  isArrayLike: require('./isArrayLike'),
  isBoolean: require('./isBoolean'),
  isGraph: require('./isGraph'),
  isIterable: require('./isIterable'),
  isIterator: require('./isIterator'),
  isMap: require('./isMap'),
  isPlainObject: require('./isPlainObject'),
  mapIterator: require('./mapIterator'),
  max: require('./max'),
  next: require('./next'),
  range: require('./range'),
  someIterator: require('./someIterator'),
  toIterator: require('./toIterator'),
  tuple: require('./tuple'),
  size: require('./size'),
  sprintf: require('./sprintf'),
  zipIterator: require('./zipIterator'),
  zipSequence: require('./zipSequence'),
});

Object.assign(
  exports,
  exports.tuple
);
