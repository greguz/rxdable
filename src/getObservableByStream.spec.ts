import test from 'ava'

import { Readable } from 'stream'
import { toArray } from 'rxjs/operators'

import { getObservableByStream } from './index'

test('should work', async t => {
  const readable = new Readable({
    objectMode: true,
    read () {
      for (let i = 65; i <= 90; i++) {
        this.push(String.fromCharCode(i))
      }
      this.push(null)
    }
  })

  const observable = getObservableByStream<string>(readable)

  const chunks = await observable.pipe(toArray()).toPromise()

  for (let i = 0; i < chunks.length; i++) {
    t.is(chunks[i], String.fromCharCode(i + 65))
  }
})

test.cb('should handle readable errors', t => {
  const readable = new Readable({
    objectMode: true,
    read () {
      this.emit('error', new Error('STOP'))
    }
  })

  const observable = getObservableByStream<void>(readable)

  observable.subscribe(
    undefined,
    error => {
      if (error instanceof Error && error.message === 'STOP') {
        t.end()
      } else {
        t.end(error)
      }
    },
    () => {
      t.end(new Error('Oh no'))
    }
  )
})
