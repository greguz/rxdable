import { Readable } from "stream";
import { Observable } from "rxjs";

import { subscribeToStream } from "./subscribeToStream";

/**
 * Get an Observable from a Readable/Duplex/Transform stream instance
 */
export function getObservableByStream<T = any>(readable: Readable) {
  return new Observable<T>(subscriber =>
    subscribeToStream<T>(readable, subscriber)
  );
}
