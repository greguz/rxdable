import { Observer, Subscriber, Subscription } from 'rxjs'
import { finished, Readable, Writable } from 'stream'

import { toSubscriber } from './toSubscriber'

function _subscribeToStream<T = any> (
  stream: Readable | Writable,
  subscriber: Subscriber<T>
) {
  let unsubscribed = false

  const listener = (data: T) => subscriber.next(data)

  finished(stream, err => {
    stream.removeListener('data', listener)

    if (err && !unsubscribed) {
      subscriber.error(err)
    } else {
      subscriber.complete()
    }
  })

  stream.addListener('data', listener)

  return new Subscription(() => {
    unsubscribed = true
    stream.destroy()
  })
}

/**
 * It subscribes to a Readable stream and returns a Subscription.
 */
export function subscribeToStream<T = any> (
  stream: Readable | Writable,
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Subscription {
  return _subscribeToStream(
    stream,
    toSubscriber(observerOrNext, error, complete)
  )
}
