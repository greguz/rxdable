import { Subscription } from "rxjs";
import { Readable, Writable } from "stream";

import { UnsubscribedError } from "./UnsubscribedError";

// tslint:disable-next-line
function noop() {}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: Readable | Writable,
  next?: ((value: T) => void) | null | undefined,
  error?: ((error: any) => void) | null | undefined,
  complete?: (() => void) | null | undefined
) {
  // Analyze the stream
  const isReadable = stream instanceof Readable;
  const isWritable = stream instanceof Writable;

  // Validate stream type
  if (!isReadable && !isWritable) {
    throw new Error("The first argument must be a stream");
  }

  // Arg defaults
  const _next = next || noop;
  const _error = error || noop;
  const _complete = complete || noop;

  // True when the stream is closed
  let hasEnded = false;

  // Final callback (ensure called once)
  const _close = (err?: any) => {
    // Ensure this function called once
    if (hasEnded) {
      return;
    } else {
      hasEnded = true;
    }

    // Prevent future output
    stream.removeListener("data", _next);

    // Free up resources
    stream.destroy();

    // Close this "observable"
    if (err && !(err instanceof UnsubscribedError)) {
      _error(err);
    } else {
      _complete();
    }
  };

  let tryAgain = isReadable && isWritable;

  const _endOrFinish = () => {
    if (tryAgain) {
      tryAgain = false;
    } else {
      // Use setImmediate() to fix Node.js 8.x stream.destroy(error) bug
      setImmediate(_close);
    }
  };

  // Listen for data
  stream
    .on("data", _next)
    .on("error", _close)
    .on("close", _close)
    .on("end", _endOrFinish)
    .on("finish", _endOrFinish);

  // Return a subscription able to destroy the stream
  return new Subscription(() => {
    if (!hasEnded) {
      stream.destroy(new UnsubscribedError());
    }
  });
}
