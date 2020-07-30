import test from 'ava'

import { from, Observable } from 'rxjs'
import { Transform } from 'stream'

import { getOperatorByStream } from './index'

test.cb('should work', t => {
  const transform = new Transform({
    objectMode: true,
    transform (input, encoding, callback) {
      this.push({
        input,
        output: input.length
      })
      callback()
    }
  })

  from(['1', '22', '333', '4444'])
    .pipe(getOperatorByStream(transform))
    .subscribe(
      data => t.is(data.input.length, data.output),
      t.end,
      t.end
    )
})

test.cb('should handle observable errors', t => {
  const observable = new Observable(subscriber => {
    subscriber.error(new Error('STOP'))
  })

  const transform = new Transform({
    objectMode: true,
    transform (input, encoding, callback) {
      callback()
    }
  })

  observable.pipe(getOperatorByStream(transform)).subscribe(
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
  const transform = new Transform({
    objectMode: true,
    transform (input, encoding, callback) {
      callback(new Error('STOP'))
    }
  })

  from([0, 1, 2, 3])
    .pipe(getOperatorByStream(transform))
    .subscribe(
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
