# rxdable

Create a Node.js **Readable** stream from a Rx.js **Observable**

- Works with Node.js >= 8.x and Rx.js 6.x
- Zero dependencies
- TypeScript support
- Returns a typed readable stream

## Observable to Readable

```javascript
const { getReadableByObservable } = require("rxdable");

const readableStream = getReadableByObservable(sourceObservable);
```

## Readable to Observable

```javascript
const { subscribeToStream } = require("rxdable");
const { createReadStream } = require("fs");
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
