import "mocha";
import { expect } from "chai";

import { Observable } from "rxjs";
import { count, map } from "rxjs/operators";
import { Readable } from "stream";
import * as pump from "pump";

import { getStreamByOperator } from "./index";

describe("getStreamByOperator", () => {
  it("should work with aggregate operators", done => {
    const readable = new Readable({
      objectMode: true,
      read() {
        this.push("a");
        this.push("b");
        this.push("c");
        this.push(null);
      }
    });

    const transform = getStreamByOperator(count());

    transform.once("data", data => {
      expect(data).to.be.equal(3);
    });

    pump(readable, transform, done);
  });

  it("should work with delayed subscription", done => {
    function delay<T>(ms: number) {
      return (source: Observable<T>) => {
        return new Observable<T>(subscriber => {
          setTimeout(() => {
            source.subscribe(
              data => subscriber.next(data),
              error => subscriber.error(error),
              () => subscriber.complete()
            );
          }, ms);
        });
      };
    }

    const readable = new Readable({
      objectMode: true,
      read() {
        this.push("a");
        this.push("b");
        this.push("c");
        this.push(null);
      }
    });

    const transform = getStreamByOperator(delay(100));

    pump(readable, transform, done);
  });

  it("shuold handle observable errors", done => {
    function explode<T>() {
      return (source: Observable<T>) => {
        return new Observable<T>(subscriber => {
          subscriber.error(new Error("STOP"));
        });
      };
    }

    const readable = new Readable({
      objectMode: true,
      read() {
        this.push("a");
        this.push("b");
        this.push("c");
        this.push(null);
      }
    });

    const transform = getStreamByOperator(explode());

    pump(readable, transform, error => {
      if (error instanceof Error && error.message === "STOP") {
        done();
      } else {
        done(error);
      }
    });
  });

  it("shuold handle stream errors", done => {
    let timer: any;

    const readable = new Readable({
      objectMode: true,
      read() {
        if (!timer) {
          timer = setInterval(() => {
            this.push("test");
          }, 10);
        }
      },
      destroy(error: any, callback) {
        clearInterval(timer);
        callback(error);
      }
    });

    const transform = getStreamByOperator(map(value => value));

    setTimeout(() => {
      transform.destroy(new Error("STOP"));
    }, 100);

    pump(readable, transform, error => {
      if (error instanceof Error && error.message === "STOP") {
        done();
      } else {
        done(error);
      }
    });
  });
});
