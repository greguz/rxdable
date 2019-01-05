import { Writable } from "stream";
import { Observable } from "rxjs";

import { pipeObservableToStream } from "./pipeObservableToStream";

/**
 * Create a operator froma Writable or Duplex or Transform stream
 */
export function getOperatorByStream<T = any>(writable: Writable | null) {
  // Validate stream type
  if (!(writable instanceof Writable)) {
    throw new Error("Argument is not a writable stream");
  }

  return (observable: Observable<any>) => {
    return new Observable<T>(subscriber => {
      // Ensure this is the first time here
      if (writable === null) {
        return subscriber.error(
          new Error("You cannot subscribe twice to a stream")
        );
      }

      // Save the stream
      const stream = writable;

      // Forget the argument
      writable = null;

      // Pipe the observable to the stream and return the subscription
      return pipeObservableToStream(
        observable,
        stream,
        data => subscriber.next(data),
        error => subscriber.error(error),
        () => subscriber.complete()
      );
    });
  };
}
