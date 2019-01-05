import "mocha";
import { expect } from "chai";

import { from } from "rxjs";
import { Transform } from "stream";

import { getOperatorByStream } from "./index";

describe("getOperatorByStream", () => {
  it("should check stream type", () => {
    expect(() => getOperatorByStream({} as any)).to.throw();
  });

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

  it("should not subscribe twice", async () => {
    const transform = new Transform({
      objectMode: true,
      transform(input, encoding, callback) {
        this.push(input.toString());
        callback();
      }
    });

    const observable = from([0, 1, 2, 3]).pipe(getOperatorByStream(transform));

    await observable.toPromise();

    await new Promise((resolve, reject) => {
      observable.subscribe(
        undefined,
        error => {
          if (
            error instanceof Error &&
            error.message === "You cannot subscribe twice to a stream"
          ) {
            resolve();
          } else {
            reject(error);
          }
        },
        () => reject(new Error("Oh no"))
      );
    });
  });
});
