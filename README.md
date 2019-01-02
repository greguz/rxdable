# rxdable

Utility lib to work with Node.js streams and Rx.js.

- Node.js >= 8.x
- Rx.js 6.x
- Zero dependencies
- TypeScript support

## Observable to Readable stream

```javascript
const { getReadableByObservable } = require("rxdable");

const readableStream = getReadableByObservable(sourceObservable);
```

## Readable stream to Observable

```javascript
const { createReadStream } = require("fs");
const { subscribeToStream } = require("rxdable");
const { Observable } = require("rxjs");

function readFile(file, encoding = "utf8") {
  return new Observable(subscriber => {
    return subscribeToStream(
      createReadStream(file, encoding),
      chunk => subscriber.next(chunk),
      error => subscriber.error(error),
      () => subscriber.complete()
    );
  });
}
```

## Transform/Duplex stream as operator

```javascript
const { createWriteStream } = require("fs");
const { subscribeToStream } = require("rxdable");
const { Observable } = require("rxjs");

export function writeFile(file, encoding = "utf8") {
  return source => {
    return new Observable(subscriber => {
      const stream = createWriteStream(file, encoding);

      const sub0 = subscribeToStream(
        stream,
        null,
        error => subscriber.error(error),
        () => subscriber.complete()
      );

      const sub1 = source.subscribe(
        chunk => stream.write(chunk),
        error => stream.destroy(error),
        () => stream.end()
      );

      return sub0.add(sub1);
    });
  };
}
```
