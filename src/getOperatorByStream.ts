import { Writable } from "stream";
import { Observable, OperatorFunction } from "rxjs";

import { pipeObservableToStream } from "./pipeObservableToStream";

/**
 * It creates an Operator from a Writable stream.
 */
export function getOperatorByStream<T = any>(writable: Writable): OperatorFunction<any, any> {
  return (observable: Observable<any>) => {
    return new Observable<T>(subscriber =>
      pipeObservableToStream(observable, writable, subscriber)
    );
  };
}
