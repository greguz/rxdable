import { Readable } from 'stream'
import { Observable } from 'rxjs'

import { subscribeToStream } from './subscribeToStream'

/**
 * It creates an Observable from a Readable/Duplex/Transform stream.
 */
export function getObservableByStream<T = any> (
  stream: Readable
): Observable<T> {
  return new Observable<T>(subscriber =>
    subscribeToStream<T>(stream, subscriber)
  )
}
