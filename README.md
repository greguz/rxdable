# rxdable

Create a Node.js **Readable** stream from a Rx.js **Observable**

- Works with Node.js >= 8.x and Rx.js 6.x
- Zero dependencies
- TypeScript support
- Returns a typed readable stream

## Usage

```javascript
const { getReadableByObservable } = require("rxdable");

const readableStream = getReadableByObservable(sourceObservable);
```
