import { Observable, Observer, Subscriber, Subscription } from 'rxjs'
import { Writable } from 'stream'

import { subscribeToStream } from './subscribeToStream'
import { toSubscriber } from './toSubscriber'

function _pipeObservableToStream<T = any> (
  observable: Observable<any>,
  stream: Writable,
  subscriber: Subscriber<T>
) {
  const s0 = subscribeToStream<T>(stream, subscriber)

  const s1 = observable.subscribe(
    data => stream.write(data),
    err => stream.destroy(err),
    () => stream.end()
  )

  return s0.add(s1)
}

/**
 * It pipes an Observable into a Writable/Duplex/Transform stream and returns a Subscription.
 */
export function pipeObservableToStream<T = any> (
  observable: Observable<any>,
  stream: Writable,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Subscription {
  return _pipeObservableToStream(
    observable,
    stream,
    toSubscriber(observerOrNext, error, complete)
  )
}
