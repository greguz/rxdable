# rxdable

[![npm version](https://badge.fury.io/js/rxdable.svg)](https://badge.fury.io/js/rxdable) [![Build Status](https://travis-ci.com/greguz/rxdable.svg?branch=master)](https://travis-ci.com/greguz/rxdable) [![Coverage Status](https://coveralls.io/repos/github/greguz/rxdable/badge.svg?branch=master)](https://coveralls.io/github/greguz/rxdable?branch=master) [![Dependencies Status](https://david-dm.org/greguz/rxdable.svg)](https://david-dm.org/greguz/rxdable.svg)

Utility lib to work with Node.js streams and Rx.js.

- Node.js >= 8.x
- Rx.js 6.x
- Zero dependencies
- TypeScript support

## Observable to Readable stream

```javascript
const { getReadableByObservable } = require("rxdable");

const readableStream = getReadableByObservable(observable);
```

## Readable stream to Observable (recommend way)

```javascript
const { createReadStream } = require("fs");
const { subscribeToStream } = require("rxdable");
const { Observable } = require("rxjs");

function fileRead(file, encoding = "utf8") {
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

## Readable stream to Observable (fast way)

```javascript
const { getObservableByStream } = require("rxdable");

const observable = getObservableByStream(readableStream);
```

The usage of this API is discouraged, because a Node.js stream is able to be consumed just one time, but an Observable is able to be subscribed more than once.

So this API create an Observable that is able to be subscribed just one time.

## Operator to Transform stream

```javascript
const { count } = require("rxjs/operators");
const { getTransformByOperator } = require("rxdable");

const transformStream = getTransformByOperator(count());
```

## Writable/Duplex/Transform stream to operator

```javascript
const { createWriteStream } = require("fs");
const { subscribeToStream } = require("rxdable");
const { Observable } = require("rxjs");

function fileWrite(file, encoding = "utf8") {
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
