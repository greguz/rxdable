import { Observable, Subscription } from "rxjs";
import { Readable } from "stream";

import { TypedReadable } from "./TypedReadable";

/**
 * https://nodejs.org/api/stream.html#stream_implementing_a_readable_stream
 */
export class Rxdable<T> extends Readable implements TypedReadable<T> {
  /**
   * Array used as buffer for Node.js backpressure mechanism
   * https://nodejs.org/en/docs/guides/backpressuring-in-streams/
   */
  private _buffer: Array<T | null> = [];

  /**
   * Equal to stream.push() result
   */
  private _flowing = false;

  /**
   * Rx.js source stream
   */
  private _observable: Observable<T>;

  /**
   * Rx.js subscription, generated when the readable go into "flowing" state
   */
  private _subscription: Subscription | null = null;

  /**
   * @constructor
   */
  constructor(source: Observable<T>) {
    super({ objectMode: true });
    this._observable = source;
  }

  /**
   * Called by the internal Readable class methods when data from stream is requested
   */
  public _read() {
    // Enable flowing state
    this._flowing = true;

    // Ensure single observable subscription
    if (!this._subscription) {
      this._subscription = this._observable.subscribe(
        value => {
          this._push(value);
        },
        error => {
          process.nextTick(() => this.emit("error", error));
        },
        () => {
          this._push(null);
        }
      );
    }

    // Empty the buffer if necessary
    while (this._buffer.length > 0 && this._flowing === true) {
      this._flowing = this.push(this._buffer.shift());
    }
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

  /**
   * Process a single stream entry (and null for stream's end)
   */
  private _push(value: T | null) {
    if (this._flowing === true && this._buffer.length === 0) {
      this._flowing = this.push(value);
    } else {
      this._buffer.push(value);
    }
  }
}
