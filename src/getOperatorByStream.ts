import { Writable } from "stream";
import { Observable } from "rxjs";

import { pipeObservableToStream } from "./pipeObservableToStream";

/**
 * Create a operator froma Writable or Duplex or Transform stream
 */
export function getOperatorByStream<T = any>(writable: Writable) {
  return (observable: Observable<any>) => {
    return new Observable<T>(subscriber =>
      pipeObservableToStream(observable, writable, subscriber)
    );
  };
}
