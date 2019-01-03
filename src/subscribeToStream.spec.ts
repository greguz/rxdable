import "mocha";
import { expect } from "chai";

import { Readable, Writable } from "stream";
import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";

import { subscribeToStream } from "./subscribeToStream";

describe("subscribeToStream", () => {
  it("should work with readables", async () => {
    const observable = new Observable<string>(subscriber => {
      const readable = new Readable({
        objectMode: true,
        read() {
          for (let i = 65; i <= 90; i++) {
            this.push(String.fromCharCode(i));
          }
          this.push(null);
        }
      });

      return subscribeToStream(
        readable,
        chunk => subscriber.next(chunk),
        error => subscriber.error(error),
        () => subscriber.complete()
      );
    });

    const chunks = await observable.pipe(toArray()).toPromise();

    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i]).to.equal(String.fromCharCode(i + 65));
    }
  });

  it("should work with writables", done => {
    const writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      }
    });

    let i = 0;
    const timer = setInterval(() => {
      writable.write(i++);
      if (i >= 10) {
        clearInterval(timer);
        writable.end();
      }
    }, 100);

    subscribeToStream(writable, null, done, done);
  });
});
