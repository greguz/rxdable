import "mocha";
import { expect } from "chai";

import { Readable, Writable } from "stream";
import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";

import { subscribeToStream } from "./index";

describe("subscribeToStream", () => {
  it("should check stream type", () => {
    expect(() => subscribeToStream({} as any)).to.throw();
  });

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

    subscribeToStream(writable, undefined, done, done);
  });

  it("should have fallbacks", done => {
    const stream = new Readable({
      objectMode: true,
      read() {
        this.push("a");
        this.push("b");
        this.push("c");
        this.push(null);
        setImmediate(done);
      }
    });

    subscribeToStream(stream);
  });

  it("should unsubscribe from stream without errors", done => {
    let timer: any;
    let index = 0;

    const stream = new Readable({
      objectMode: true,
      read() {
        if (!timer) {
          timer = setInterval(() => {
            this.push(index++);
          }, 10);
        }
      },
      destroy(error: any, callback) {
        clearInterval(timer);
        callback(error);
      }
    });

    const subscription = subscribeToStream(stream, undefined, done, done);

    setTimeout(() => {
      subscription.unsubscribe();
    }, 100);
  });
});
