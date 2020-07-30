import test from 'ava'

import { Observable } from 'rxjs'
import { count, map } from 'rxjs/operators'
import { pipeline, Readable } from 'stream'

import { getStreamByOperator } from './index'

test.cb('should work with aggregate operators', t => {
  const readable = new Readable({
    objectMode: true,
    read () {
      this.push('a')
      this.push('b')
      this.push('c')
      this.push(null)
    }
  })

  const transform = getStreamByOperator(count())

  transform.once('data', data => {
    t.is(data, 3)
  })

  pipeline(readable, transform, t.end)
})

test.cb('should work with delayed subscription', t => {
  function delay<T> (ms: number) {
    return (source: Observable<T>) => {
      return new Observable<T>(subscriber => {
        setTimeout(() => {
          source.subscribe(
            data => subscriber.next(data),
            error => subscriber.error(error),
            () => subscriber.complete()
          )
        }, ms)
      })
    }
  }

  const readable = new Readable({
    objectMode: true,
    read () {
      this.push('a')
      this.push('b')
      this.push('c')
      this.push(null)
    }
  })

  const transform = getStreamByOperator(delay(100))

  pipeline(readable, transform, t.end)
})

test.cb('shuold handle observable errors', t => {
  function explode<T> () {
    return () => {
      return new Observable<T>(subscriber => {
        subscriber.error(new Error('STOP'))
      })
    }
  }

  const readable = new Readable({
    objectMode: true,
    read () {
      this.push('a')
      this.push('b')
      this.push('c')
      this.push(null)
    }
  })

  const transform = getStreamByOperator(explode())

  pipeline(readable, transform, error => {
    if (error instanceof Error && error.message === 'STOP') {
      t.end()
    } else {
      t.end(error)
    }
  })
})

test.cb('shuold handle stream errors', t => {
  let timer: any

  const readable = new Readable({
    objectMode: true,
    read () {
      if (!timer) {
        timer = setInterval(() => {
          this.push('test')
        }, 10)
      }
    },
    destroy (error: any, callback) {
      clearInterval(timer)
      callback(error)
    }
  })

  const transform = getStreamByOperator(map(value => value))

  setTimeout(() => {
    transform.destroy(new Error('STOP'))
  }, 100)

  pipeline(readable, transform, error => {
    if (error instanceof Error && error.message === 'STOP') {
      t.end()
    } else {
      t.end(error)
    }
  })
})
