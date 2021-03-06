import test from 'ava'

import { pipeline, Writable } from 'stream'
import { from, Observable } from 'rxjs'

import { getStreamByObservable } from './index'

test.cb('should work', t => {
  // Fast-firing observable
  const observable = from(([] as any[]).fill('x', 0, 50))

  // Cast to readable
  const readable = getStreamByObservable(observable)

  // Slow-ass writable
  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      setTimeout(() => callback(), 10)
    }
  })

  // And pump it (louder)
  pipeline(readable, writable, t.end)
})

test.cb('should handle observable errors', t => {
  // Observable that will explode
  const observable = new Observable<number>(subscriber => {
    setTimeout(() => subscriber.error(new Error("Kill 'Em All")), 10)
  })

  // Convert to readable
  const readable = getStreamByObservable(observable)

  // Empty writable
  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback()
    }
  })

  // And pump it (louder)
  pipeline(readable, writable, error => {
    if (error instanceof Error && error.message === "Kill 'Em All") {
      t.end()
    } else {
      t.end(error)
    }
  })
})

test.cb('should unsubscribe from the observable', t => {
  // Subscription status
  let unsubscribed = false

  // Infinite observable
  const observable = new Observable<number>(subscriber => {
    let i = 0
    const timer = setInterval(() => {
      subscriber.next(i++)
    }, 100)
    return function unsubscribe () {
      unsubscribed = true
      clearInterval(timer)
    }
  })

  // Convert to readable
  const readable = getStreamByObservable(observable)

  // Will-explode writable
  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback(chunk >= 10 ? new Error("Kill 'Em All") : null)
    }
  })

  // And pump it (louder)
  pipeline(readable, writable, error => {
    t.true(unsubscribed)

    if (error instanceof Error && error.message === "Kill 'Em All") {
      t.end()
    } else {
      t.end(error)
    }
  })
})
