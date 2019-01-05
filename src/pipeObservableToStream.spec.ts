import "mocha";
// import { expect } from "chai";

import { from, Observable } from "rxjs";
import { Writable } from "stream";

import { pipeObservableToStream } from "./index";

describe("pipeObservableToStream", () => {
  it("should work", done => {
    const observable = from(["x", "y", "z"]);

    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      }
    });

    pipeObservableToStream(observable, writable, null, done, done);
  });

  it("should handle observable errors", done => {
    const observable = new Observable(subscriber => {
      setTimeout(() => {
        subscriber.error(new Error("STOP"));
      }, 100);
    });

    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      }
    });

    pipeObservableToStream(
      observable,
      writable,
      null,
      error => {
        if (error instanceof Error && error.message === "STOP") {
          done();
        } else {
          done(error);
        }
      },
      () => {
        done(new Error("Done without errors"));
      }
    );
  });

  it("should handle stream errors", done => {
    const observable = from(["x", "y", "z"]);

    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback(new Error("STOP"));
      }
    });

    pipeObservableToStream(
      observable,
      writable,
      null,
      error => {
        if (error instanceof Error && error.message === "STOP") {
          done();
        } else {
          done(error);
        }
      },
      () => {
        done(new Error("Done without errors"));
      }
    );
  });
});
