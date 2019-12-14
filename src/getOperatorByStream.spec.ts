import "mocha";
import { expect } from "chai";

import { from, Observable } from "rxjs";
import { Transform } from "stream";

import { getOperatorByStream } from "./index";

describe("getOperatorByStream", () => {
  it("should work", done => {
    const transform = new Transform({
      objectMode: true,
      transform(input, encoding, callback) {
        this.push({
          input,
          output: input.length
        });
        callback();
      }
    });

    from(["1", "22", "333", "4444"])
      .pipe(getOperatorByStream(transform))
      .subscribe(
        data => expect(data.input.length).to.be.equal(data.output),
        done,
        done
      );
  });

  it("should handle observable errors", done => {
    const observable = new Observable(subscriber => {
      subscriber.error(new Error("STOP"));
    });

    const transform = new Transform({
      objectMode: true,
      transform(input, encoding, callback) {
        callback();
      }
    });

    observable.pipe(getOperatorByStream(transform)).subscribe(
      undefined,
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
    const transform = new Transform({
      objectMode: true,
      transform(input, encoding, callback) {
        callback(new Error("STOP"));
      }
    });

    from([0, 1, 2, 3])
      .pipe(getOperatorByStream(transform))
      .subscribe(
        undefined,
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
