import "mocha";
import { expect } from "chai";

import { fill } from "lodash";
import { Writable } from "stream";
import { from, Observable } from "rxjs";
import * as pump from "pump";

import { getStreamByObservable } from "./index";

describe("getStreamByObservable", () => {
  it("should work", done => {
    // Fast-firing observable
    const observable = from(fill(new Array(50), "x"));

    // Cast to readable
    const readable = getStreamByObservable(observable);

    // Slow-ass writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        setTimeout(() => callback(), 10);
      }
    });

    // And pump it (louder)
    pump(readable, writable, done);
  });

  it("should handle observable errors", done => {
    // Observable that will explode
    const observable = new Observable<number>(subscriber => {
      setTimeout(() => subscriber.error(new Error("Kill 'Em All")), 10);
    });

    // Convert to readable
    const readable = getStreamByObservable(observable);

    // Empty writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      }
    });

    // And pump it (louder)
    pump(readable, writable, error => {
      if (error instanceof Error && error.message === "Kill 'Em All") {
        done();
      } else {
        done(error);
      }
    });
  });

  it("should unsubscribe from the observable", done => {
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
    const readable = getStreamByObservable(observable);

    // Will-explode writable
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback(chunk >= 10 ? new Error("Kill 'Em All") : null);
      }
    });

    // And pump it (louder)
    pump(readable, writable, error => {
      expect(unsubscribed).to.equal(true);

      if (error instanceof Error && error.message === "Kill 'Em All") {
        done();
      } else {
        done(error);
      }
    });
  });
});
