import { Observable, OperatorFunction, Subscriber, Subscription } from "rxjs";
import { Transform } from "stream";

/**
 * https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream
 */
export class Tranxform extends Transform {
  /**
   * Final callback
   */
  private _callback: (error?: any) => void;

  /**
   * Composed observable
   */
  private _observable: Observable<any>;

  /**
   * Source observable subscriber
   */
  private _subscriber: Subscriber<any>;

  /**
   * Current subscription
   */
  private _subscription: Subscription;

  /**
   * @constructor
   */
  constructor(...operators: Array<OperatorFunction<any, any>>) {
    super({ objectMode: true });

    // Create a source observable
    const sourceObservable = new Observable<any>(subscriber => {
      // Save the source subscriber
      this._subscriber = subscriber;
      // Emit event to continue the transformation process
      this.emit("subscribed", subscriber);
    });

    // Apply the operators to the source observable and save the result
    this._observable = operators.reduce(
      (observable, operator) => operator(observable),
      sourceObservable
    );
  }

  /**
   * Method to accept input and produce output
   */
  public _transform(
    input: any,
    encoding: string,
    callback: (error?: any) => void
  ) {
    // Ensure observable subscription
    if (!this._subscription) {
      this._subscription = this._observable.subscribe(
        output => {
          this.push(output);
        },
        error => {
          process.nextTick(() => this.emit("error", error));
        },
        () => {
          this._callback();
        }
      );
    }

    // Process next chunk util
    function next(subscriber: Subscriber<any>) {
      subscriber.next(input);
      callback();
    }

    // Handle missing source subscriber
    if (this._subscriber) {
      next(this._subscriber);
    } else {
      this.once("subscribed", next);
    }
  }

  /**
   * Called before the stream closes
   */
  public _final(callback: (error?: any) => void) {
    // Save the final callback
    this._callback = callback;
    // Close the source observable
    this._subscriber.complete();
  }

  /**
   * Called by the internal Readable class methods
   */
  public _destroy(error: any, callback: (error?: any) => void) {
    if (this._subscription && !this._subscription.closed) {
      this._subscription.unsubscribe();
    }
    callback(error);
  }
}
