/*global assert*/
'use strict';

import PriorityQueue from '../PriorityQueue';

export var testPriorityQueue = {
  constructor: function() {
    var queue = new PriorityQueue();
    assert.equal(queue.size, 0);

    queue = new PriorityQueue([[3, 42], [10, 21], [1, 10]]);
    assert.equal(queue.size, 3);
  },

  queue: function() {
    var queue = new PriorityQueue();
    queue.enqueue(10, 42);
    queue.enqueue(3, 21);
    assert.equal(queue.size, 2);
  },

  dequeue: function() {
    var queue = new PriorityQueue();
    queue.enqueue(10, 42);
    queue.enqueue(3, 21);

    assert.equal(queue.size, 2);
    assert.deepEqual(queue.dequeue(), [3, 21]);
    assert.equal(queue.size, 1);

    queue.enqueue(1, 0);
    assert.deepEqual(queue.dequeue(), [1, 0]);
  },
};
