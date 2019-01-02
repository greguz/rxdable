import { Subscription } from "rxjs";
import { Stream } from "stream";

function noop() {}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: Stream,
  next?: (value: T) => void | null | undefined,
  error?: (error: any) => void | null | undefined,
  complete?: () => void | null | undefined
) {
  // Stream event listeners
  const onData = next ? (data: T) => next(data) : noop;
  const onError = error ? (err: any) => error(err) : noop;
  const onEnd = complete ? () => complete() : noop;

  // Register event listeners
  stream
    .on("data", onData)
    .once("error", onError)
    .once("end", onEnd);

  // Return the subscription
  return new Subscription(() => {
    // Remove event listeners
    stream
      .removeListener("data", onData)
      .removeListener("error", onError)
      .removeListener("end", onEnd);
  });
}
