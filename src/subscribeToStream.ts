import { Subscription } from "rxjs";
import { Readable, Writable } from "stream";

// tslint:disable-next-line
function noop() {}

/**
 * Validate stream type and return the correct end event
 */
function guessEndEvent(stream: any) {
  if (stream instanceof Readable) {
    // Readable or Duplex or Transform stream instance
    return "end";
  } else if (stream instanceof Writable) {
    // Pure Writable stream instance
    return "finish";
  } else {
    // Not a standard Node.js stream instance
    throw new Error("The first argument must be a stream");
  }
}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: Readable | Writable,
  next?: ((value: T) => void) | null | undefined,
  error?: ((error: any) => void) | null | undefined,
  complete?: (() => void) | null | undefined
) {
  // Guess the correct end event to listen
  const endEvent = guessEndEvent(stream);

  // Stream event listeners
  const onData = next ? (data: T) => next(data) : noop;
  const onError = error ? (err: any) => error(err) : noop;
  const onEnd = complete ? () => complete() : noop;

  // Register event listeners
  stream
    .on("data", onData)
    .once("error", onError)
    .once(endEvent, onEnd);

  // Return the subscription
  return new Subscription(() => {
    // Remove event listeners
    stream
      .removeListener("data", onData)
      .removeListener("error", onError)
      .removeListener(endEvent, onEnd);

    // Free resources
    stream.destroy();
  });
}
