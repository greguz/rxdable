import { Observable, Observer, Subscriber } from "rxjs";
import { Writable } from "stream";

import { subscribeToStream } from "./subscribeToStream";
import { toSubscriber } from "./toSubscriber";

function _pipeObservableToStream<T = any>(
  observable: Observable<any>,
  stream: Writable,
  subscriber: Subscriber<T>
) {
  // Proxy the stream output
  const s0 = subscribeToStream<T>(stream, subscriber);

  // Subscribe to the observable and write to the stream
  const s1 = observable.subscribe(
    data => stream.write(data),
    err => stream.destroy(err),
    () => stream.end()
  );

  // Combine and return the subscriptions
  return s0.add(s1);
}

/**
 * Pipe the observable data to the writable stream and subscribe for the result
 */
export function pipeObservableToStream<T = any>(
  observable: Observable<any>,
  stream: Writable,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
) {
  return _pipeObservableToStream(
    observable,
    stream,
    toSubscriber(observerOrNext, error, complete)
  );
}
