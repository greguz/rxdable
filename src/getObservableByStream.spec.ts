import "mocha";
import { expect } from "chai";

import { Readable } from "stream";
import { toArray } from "rxjs/operators";

import { getObservableByStream } from "./index";

describe("getObservableByStream", () => {
  it("should work", async () => {
    const readable = new Readable({
      objectMode: true,
      read() {
        for (let i = 65; i <= 90; i++) {
          this.push(String.fromCharCode(i));
        }
        this.push(null);
      }
    });

    const observable = getObservableByStream<string>(readable);

    const chunks = await observable.pipe(toArray()).toPromise();

    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i]).to.equal(String.fromCharCode(i + 65));
    }
  });

  it("should handle readable errors", done => {
    const readable = new Readable({
      objectMode: true,
      read() {
        this.emit("error", new Error("STOP"));
      }
    });

    const observable = getObservableByStream<void>(readable);

    observable.subscribe(
      undefined,
      error => {
        if (error instanceof Error && error.message === "STOP") {
          done();
        } else {
          done(error);
        }
      },
      () => {
        done(new Error("Oh no"));
      }
    );
  });
});
