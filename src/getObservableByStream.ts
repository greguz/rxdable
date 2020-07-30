import { Readable } from "stream";
import { Observable } from "rxjs";

import { subscribeToStream } from "./subscribeToStream";

/**
 * It creates an Observable from a Readable stream.
 */
export function getObservableByStream<T = any>(readable: Readable): Observable<T> {
  return new Observable<T>(subscriber =>
    subscribeToStream<T>(readable, subscriber)
  );
}
