# rxdable

[![npm version](https://badge.fury.io/js/rxdable.svg)](https://badge.fury.io/js/rxdable) [![Build Status](https://travis-ci.com/greguz/rxdable.svg?branch=master)](https://travis-ci.com/greguz/rxdable) [![Coverage Status](https://coveralls.io/repos/github/greguz/rxdable/badge.svg?branch=master)](https://coveralls.io/github/greguz/rxdable?branch=master) [![Dependencies Status](https://david-dm.org/greguz/rxdable.svg)](https://david-dm.org/greguz/rxdable.svg)

Utility lib to work with Node.js streams and Rx.js.

- Node.js >= 10.x
- Rx.js 6.x
- Zero dependencies
- TypeScript support

## Observable to Readable stream

```javascript
const { getStreamByObservable } = require("rxdable");

const readableStream = getStreamByObservable(observable);
```

## Readable stream to Observable

```javascript
const { createReadStream } = require("fs");
const { subscribeToStream } = require("rxdable");
const { Observable } = require("rxjs");

function fileRead(file, encoding = "utf8") {
  return new Observable(subscriber => {
    return subscribeToStream(createReadStream(file, encoding), subscriber);
  });
}
```

## Readable stream to Observable (faster way)

```javascript
const { getObservableByStream } = require("rxdable");

const observable = getObservableByStream(readableStream);
```

**WARNING**: This function will create an Observable ables to be subscribed just one time.

## Operator to Transform stream

```javascript
const { count } = require("rxjs/operators");
const { getStreamByOperator } = require("rxdable");

const transformStream = getStreamByOperator(count());
```

## Writable/Duplex/Transform stream to operator

```javascript
const { createWriteStream } = require("fs");
const { pipeObservableToStream } = require("rxdable");
const { Observable } = require("rxjs");

function fileWrite(file, encoding = "utf8") {
  return observable => {
    return new Observable(subscriber => {
      return pipeObservableToStream(
        observable,
        createWriteStream(file, encoding),
        subscriber
      );
    });
  };
}
```

## Writable/Duplex/Transform stream to operator (faster way)

```javascript
const { getOperatorByStream } = require("rxdable");

const operator = getOperatorByStream(transformStream);
```

**WARNING**: This function will create an Operator ables to be used just one time.
