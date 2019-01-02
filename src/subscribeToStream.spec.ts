import "mocha";
import { expect } from "chai";

import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { Observable } from "rxjs";
import { toArray } from "rxjs/operators";

import { subscribeToStream } from "./subscribeToStream";

describe("subscribeToStream", () => {
  it("should work with readables", async () => {
    const observable = new Observable<string>(subscriber =>
      subscribeToStream(
        fs.createReadStream(__filename, "utf8"),
        chunk => subscriber.next(chunk),
        error => subscriber.error(error),
        () => subscriber.complete()
      )
    );

    const chunks = await observable.pipe(toArray()).toPromise();

    const text = chunks.join("");

    expect(text).to.match(/But in the end, it doesn't even matter/);
  });

  it("should work with writables", async () => {
    const file = path.join(os.tmpdir(), "subscribeToStream.test");
    const encoding = "utf8";

    await new Promise((resolve, reject) =>
      subscribeToStream(
        fs
          .createReadStream(__filename, encoding)
          .pipe(fs.createWriteStream(file, encoding)),
        null,
        reject,
        resolve
      )
    );

    const text = fs.readFileSync(file, encoding);

    fs.unlinkSync(file);

    expect(text).to.match(/But in the end, it doesn't even matter/);
  });
});

// But in the end, it doesn't even matter
