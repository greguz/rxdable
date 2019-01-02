import { Subscription } from "rxjs";
import { Readable, Stream, Writable } from "stream";

function noop() {}

/**
 * Validate stream type and return the correct end event
 */
function guessEndEvent(stream: any): string {
  if (stream instanceof Writable) {
    return "finish";
  } else if (stream instanceof Readable) {
    return "end";
  } else {
    throw new Error("The first argument must be a stream");
  }
}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: Stream,
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
  });
}
