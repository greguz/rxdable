import { Writable } from "stream";
import { Observable } from "rxjs";

import { subscribeToStream } from "./subscribeToStream";

/**
 * Pipe the observable data to the writable stream and subscribe for the result
 */
export function pipeObservableToStream<T = any>(
  observable: Observable<any>,
  stream: Writable,
  next?: ((value: T) => void) | null | undefined,
  error?: ((error: any) => void) | null | undefined,
  complete?: (() => void) | null | undefined
) {
  // Proxy the stream output
  const s0 = subscribeToStream<T>(stream, next, error, complete);

  // Subscribe to the observable and write to the stream
  const s1 = observable.subscribe(
    data => stream.write(data),
    error => stream.destroy(error),
    () => stream.end()
  );

  // Combine and return the subscriptions
  return s0.add(s1);
}
