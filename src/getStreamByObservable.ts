import { Observable, Subscription } from "rxjs";
import { Readable } from 'stream'

/**
 * It creates a Readable stream from an Observable.
 */
export function getStreamByObservable<T>(observable: Observable<T>): Readable {
  let subscription: Subscription | undefined

  return new Readable({
    objectMode: true,
    read () {
      if (!subscription) {
        subscription = observable.subscribe(
          value => {
            this.push(value)
          },
          error => {
            process.nextTick(() => this.emit("error", error));
          },
          () => {
            this.push(null);
          }
        );
      }
    },
    destroy (error, callback) {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe()
      }
      callback(error);
    }
  })
}
