import test from 'ava'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { getStreamByOperator } from './index'

test.cb('multiple operators', t => {
  t.plan(1)

  const stream = getStreamByOperator(
    map(value => value * 2),
    map(value => value * 2),
    map(value => value * 2)
  )

  stream
    .on('error', t.end)
    .on('data', value => t.is(value, 16))
    .on('finish', () => t.end())

  stream.write(2)
  stream.end()
})

test.cb('no chunks', t => {
  const stream = getStreamByOperator()

  stream
    .on('error', t.end)
    .on('data', () => t.fail())
    .on('finish', () => t.end())

  stream.end()
})

test.cb('async subscription', t => {
  t.plan(3)

  const stream = getStreamByOperator(source => {
    return new Observable(subscriber => {
      setImmediate(() => {
        source.subscribe(
          value => subscriber.next(value),
          error => subscriber.error(error),
          () => subscriber.complete()
        )
      })
    })
  })

  stream
    .on('error', t.end)
    .on('data', data => t.is(data, 42))
    .on('finish', () => t.end())

  stream.write(42)
  stream.write(42)
  stream.write(42)
  stream.end()
})

test.cb('destroy (no chunks)', t => {
  const stream = getStreamByOperator()

  stream
    .on('error', t.end)
    .on('data', () => t.fail())
    .on('close', () => t.end())

  stream.destroy()
})

test.cb('destroy (unsubscribe)', t => {
  const stream = getStreamByOperator(source => {
    return new Observable(subscriber => {
      source.subscribe(
        value => subscriber.next(value),
        error => subscriber.error(error),
        () => subscriber.complete()
      )

      return () => {
        t.end()
      }
    })
  })

  stream.on('error', t.end)

  stream.on('data', data => {
    t.is(data, 42)
    stream.destroy()
  })

  stream.write(42)
})

test.cb('errors', t => {
  t.plan(2)

  const stream = getStreamByOperator(source => {
    return new Observable(subscriber => {
      source.subscribe(
        value => subscriber.next(value),
        error => subscriber.error(error),
        () => subscriber.complete()
      )

      setImmediate(() => {
        subscriber.error(new Error('STOP'))
      })
    })
  })

  stream.on('data', data => {
    t.is(data, 42)
  })

  stream.on('error', error => {
    t.is(error.message, 'STOP')
    t.end()
  })

  stream.write(42)
})
