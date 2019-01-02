import "mocha";
import { expect } from "chai";

import { createReadStream } from "fs";
import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";

import { subscribeToStream } from "./subscribeToStream";

describe("subscribeToStream", () => {
  it("should work", async () => {
    const observable = new Observable<string>(subscriber =>
      subscribeToStream(
        createReadStream(__filename, "utf8"),
        chunk => subscriber.next(chunk),
        error => subscriber.error(error),
        () => subscriber.complete()
      )
    );

    const chunks = await observable.pipe(toArray()).toPromise();

    const text = chunks.join("");

    expect(text).to.match(/But in the end, it doesn't even matter/);
  });
});

// But in the end, it doesn't even matter
