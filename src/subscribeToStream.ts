import { Observer, Subscriber, Subscription } from "rxjs";
import { finished, Readable, Writable } from "stream";

import { toSubscriber } from "./toSubscriber";
import { UnsubscribedError } from "./UnsubscribedError";

function _subscribeToStream<T = any>(
  stream: Readable | Writable,
  subscriber: Subscriber<T>
) {
  // Push data listener
  const push = (data: T) => subscriber.next(data);

  // Listen for incoming data
  stream.addListener("data", push);

  // Wait for stream to finish
  finished(stream, err => {
    // Clear listener
    stream.removeListener("data", push);

    // Close subscription
    if (err && !(err instanceof UnsubscribedError)) {
      subscriber.error(err);
    } else {
      subscriber.complete();
    }
  });

  // Return a subscription able to destroy the stream
  return new Subscription(() => stream.destroy(new UnsubscribedError()));
}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: Readable | Writable,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void
) {
  return _subscribeToStream(
    stream,
    toSubscriber(observerOrNext, error, complete)
  );
}
