import { Observable, OperatorFunction, Subscriber, Subscription } from 'rxjs'
import { Transform } from 'stream'

class Tranxform extends Transform {
  private _callback?: (error?: any) => void

  private _observable: Observable<any>

  private _subscriber?: Subscriber<any>

  private _subscription?: Subscription

  constructor (operators: Array<OperatorFunction<any, any>>) {
    super({ objectMode: true })

    this._observable = operators.reduce(
      (observable, operator) => operator(observable),
      new Observable<any>(subscriber => {
        this._subscriber = subscriber
        this.emit('subscribed', subscriber)
      })
    )
  }

  public _transform (
    chunk: any,
    encoding: string,
    callback: (error?: any) => void
  ) {
    if (!this._subscription) {
      this._subscription = this._observable.subscribe(
        value => {
          this.push(value)
        },
        error => {
          this.destroy(error)
        },
        () => {
          this._callback!()
        }
      )
    }

    const next = (subscriber: Subscriber<any>) => {
      subscriber.next(chunk)
      callback()
    }
    if (this._subscriber) {
      next(this._subscriber)
    } else {
      this.once('subscribed', next)
    }
  }

  public _final (callback: (error?: any) => void) {
    if (this._subscriber && !this._subscriber.closed) {
      this._callback = callback
      this._subscriber.complete()
    } else {
      callback()
    }
  }

  public _destroy (error: any, callback: (error?: any) => void) {
    if (this._subscription && !this._subscription.closed) {
      this._subscription.unsubscribe()
    }
    callback(error)
  }
}

/**
 * It creates a Transform stream from a list of operators.
 */
export function getStreamByOperator (
  ...operators: Array<OperatorFunction<any, any>>
): Transform {
  return new Tranxform(operators)
}
