import test from 'ava'

import { from, Observable } from 'rxjs'
import { Writable } from 'stream'

import { pipeObservableToStream } from './index'

test.cb('should work', t => {
  const observable = from(['x', 'y', 'z'])

  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback()
    }
  })

  pipeObservableToStream(observable, writable, undefined, t.end, t.end)
})

test.cb('should handle observable errors', t => {
  const observable = new Observable(subscriber => {
    setTimeout(() => {
      subscriber.error(new Error('STOP'))
    }, 100)
  })

  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback()
    }
  })

  pipeObservableToStream(
    observable,
    writable,
    undefined,
    error => {
      if (error instanceof Error && error.message === 'STOP') {
        t.end()
      } else {
        t.end(error)
      }
    },
    () => {
      t.end(new Error('Done without errors'))
    }
  )
})

test.cb('should handle stream errors', t => {
  const observable = from(['x', 'y', 'z'])

  const writable = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      callback(new Error('STOP'))
    }
  })

  pipeObservableToStream(
    observable,
    writable,
    undefined,
    error => {
      if (error instanceof Error && error.message === 'STOP') {
        t.end()
      } else {
        t.end(error)
      }
    },
    () => {
      t.end(new Error('Done without errors'))
    }
  )
})
