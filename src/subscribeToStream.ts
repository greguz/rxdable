import { Subscription } from "rxjs";
import { finished, Readable, Writable } from "stream";

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
  // Defaults
  const _next = next || noop;
  const _error = error || noop;
  const _complete = complete || noop;

  // Listen for incoming data
  stream.addListener("data", _next);

  // Wait for stream to finish
  finished(stream, err => {
    // Clear listener
    stream.removeListener("data", _next);

    // Close subscription
    if (err && !(err instanceof UnsubscribedError)) {
      _error(err);
    } else {
      _complete();
    }
  });

  // Return a subscription able to destroy the stream
  return new Subscription(() => stream.destroy(new UnsubscribedError()));
}
