import { Writable } from 'stream'
import { Observable, OperatorFunction } from 'rxjs'

import { pipeObservableToStream } from './pipeObservableToStream'

/**
 * It creates an Operator from a Writable/Duplex/Transform stream.
 */
export function getOperatorByStream<T = any> (
  stream: Writable
): OperatorFunction<any, any> {
  return (observable: Observable<any>) => {
    return new Observable<T>(subscriber =>
      pipeObservableToStream(observable, stream, subscriber)
    )
  }
}
