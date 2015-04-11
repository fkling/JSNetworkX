'use strict';

function sorter(a, b) {
  return b[0] - a[0];
}

/**
 * A simple priority queue implementation.
 */
export default class PriorityQueue {

  /**
   * Accepts an iterable that emits `[priority, value]` pairs. Iterates over the
   * iterable only once.
   *
   * `priority` must be a number.
   *
   * @param {Iterable} iterable
   */
  constructor(iterable) {
    this._values = [];
    if (iterable != null) {
      for (var [priority, value] of iterable) {
        this._values.push([priority, value]);
      }
      this._values.sort(sorter);
    }
  }

  /**
   * Adds a value to the queue. It will be inserted into the queue according to
   * `priority`.
   *
   * @param {number} priority
   * @param {*} value
   */
  enqueue(priority, value) {
    this._values.push([priority, value]);
    this._values.sort(sorter);
  }

  /**
   * Removes and returns the smallest [priority, value] tuple from the queue.
   *
   * @return {?}
   */
  dequeue() {
    return this._values.pop();
  }

  /**
   * Returns the current size of the queue.
   *
   * @return {number}
   */
  get size() {
    return this._values.length;
  }
}
