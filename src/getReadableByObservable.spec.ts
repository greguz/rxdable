import "mocha";
import { expect } from "chai";

import { fill, once } from "lodash";
import { Writable } from "stream";
import { from, Observable } from "rxjs";

import { getReadableByObservable } from "./getReadableByObservable";

describe("getReadableByObservable", () => {
  it("should work", done => {
    done = once(done);

    // Fast-firing observable
    const observable = from(fill(new Array(50), "x"));

    // Cast to readable
    const readable = getReadableByObservable(observable);
    expect(readable.subscription).to.equal(null);

    // Slow-ass writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        setTimeout(() => callback(), 10);
      }
    });

    // Clean-up utility
    function complete(error?: any) {
      readable.destroy();
      writable.destroy();
      done(error);
    }

    // Watch streams
    readable.once("error", complete);
    writable.once("error", complete);
    writable.once("finish", complete);

    // Start data flow
    readable.pipe(writable);
  });

  it("should handle observable errors", done => {
    done = once(done);

    // Observable that will explode
    const observable = new Observable<number>(subscriber => {
      setTimeout(() => subscriber.error(new Error("Kill 'Em All")), 10);
    });

    // Convert to readable
    const readable = getReadableByObservable(observable);

    // Empty writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      }
    });

    // Clean-up utility
    function complete(error?: any) {
      readable.destroy();
      writable.destroy();
      if (error instanceof Error && error.message === "Kill 'Em All") {
        done();
      } else {
        done(error);
      }
    }

    // Watch streams
    readable.once("error", complete);
    writable.once("error", complete);
    writable.once("finish", complete);

    // Start data flow
    readable.pipe(writable);
  });

  it("should unsubscribe from the observable", done => {
    done = once(done);

    // Subscription status
    let unsubscribed = false;

    // Infinite observable
    const observable = new Observable<number>(subscriber => {
      let i = 0;
      const timer = setInterval(() => {
        subscriber.next(i++);
      }, 100);
      return function unsubscribe() {
        unsubscribed = true;
        clearInterval(timer);
      };
    });

    // Convert to readable
    const readable = getReadableByObservable(observable);

    // Will-explode writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback(chunk >= 10 ? new Error("Kill 'Em All") : null);
      }
    });

    // Clean-up utility
    function complete() {
      readable.destroy();
      writable.destroy();
      expect(unsubscribed).to.equal(true);
      done();
    }

    // Watch streams
    readable.once("error", complete);
    writable.once("error", complete);
    writable.once("finish", complete);

    // Start data flow
    readable.pipe(writable);
  });
});
