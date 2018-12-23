import "mocha";
import { expect } from "chai";

import * as path from "path";
import * as os from "os";
import { createWriteStream, readFileSync, unlinkSync } from "fs";
import { from } from "rxjs";

import { getReadableByObservable } from "./index";

describe("Rxdable", () => {
  it("should work", async () => {
    const file = path.join(os.tmpdir(), "tx-to-node.test");
    const encoding = "utf8";
    const observable = from([
      "It's fun to stay at the ",
      "Y.",
      "M.",
      "C.",
      "A."
    ]);

    await new Promise((resolve, reject) => {
      getReadableByObservable(observable)
        .pipe(createWriteStream(file, { encoding }))
        .once("error", reject)
        .once("finish", resolve);
    });

    const content = readFileSync(file, "utf8");
    unlinkSync(file);

    expect(content).to.be.equal("It's fun to stay at the Y.M.C.A.");
  });
});
