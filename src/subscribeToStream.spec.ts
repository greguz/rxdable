import test from 'ava'

import { Readable, Writable } from 'stream'
import { Observable } from 'rxjs'
import { toArray } from 'rxjs/operators'

import { subscribeToStream } from './index'

test('should work with readables', async t => {
  const observable = new Observable<string>(subscriber => {
    const readable = new Readable({
      objectMode: true,
      read () {
        for (let i = 65; i <= 90; i++) {
          this.push(String.fromCharCode(i))
        }
        this.push(null)
      }
    })

    return subscribeToStream(
      readable,
      chunk => subscriber.next(chunk),
      error => subscriber.error(error),
      () => subscriber.complete()
    )
  })

  const chunks = await observable.pipe(toArray()).toPromise()

  for (let i = 0; i < chunks.length; i++) {
    t.is(chunks[i], String.fromCharCode(i + 65))
  }
})

test.cb('should work with writables', t => {
  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback()
    }
  })

  let i = 0
  const timer = setInterval(() => {
    writable.write(i++)
    if (i >= 10) {
      clearInterval(timer)
      writable.end()
    }
  }, 100)

  subscribeToStream(writable, {
    complete: t.end,
    error: t.end
  })
})

test.cb('should have fallbacks', t => {
  const stream = new Readable({
    objectMode: true,
    read () {
      this.push('a')
      this.push('b')
      this.push('c')
      this.push(null)
      setImmediate(t.end)
    }
  })

  subscribeToStream(stream)
})

test.cb('should unsubscribe from stream without errors', t => {
  let timer: any
  let index = 0

  const stream = new Readable({
    objectMode: true,
    read () {
      if (!timer) {
        timer = setInterval(() => {
          this.push(index++)
        }, 10)
      }
    },
    destroy (error: any, callback) {
      clearInterval(timer)
      callback(error)
    }
  })

  const subscription = subscribeToStream(stream, null, t.end, t.end)

  setTimeout(() => {
    subscription.unsubscribe()
  }, 100)
})
