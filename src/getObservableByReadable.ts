import { Readable } from "stream";
import { Observable } from "rxjs";

import { subscribeToStream } from "./subscribeToStream";

/**
 * Get an Observable from a Readable/Duplex/Transform stream instance
 */
export function getObservableByReadable<T = any>(readable: Readable | null) {
  // Validate stream type
  if (!(readable instanceof Readable)) {
    throw new Error("Argument is not a readable stream");
  }

  return new Observable<T>(subscriber => {
    // Ensure this is the first subscription
    if (readable === null) {
      return subscriber.error(
        new Error("You cannot subscribe twice to a stream")
      );
    }

    // Save the stream instance
    const stream = readable;

    // Forget the stream
    readable = null;

    // Subscribe to stream
    return subscribeToStream<T>(
      stream,
      data => subscriber.next(data),
      error => subscriber.error(error),
      () => subscriber.complete()
    );
  });
}
