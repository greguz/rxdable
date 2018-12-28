import { Observable, Subscription } from "rxjs";
import { Readable } from "stream";

/**
 * Standard Node.js readable stream with types for data event
 */
export interface TypedReadable<T> extends Readable {
  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "data", listener: (entry: T) => void): this;

  emit(event: string | symbol, ...args: any[]): boolean;
  emit(event: "data", entry: T): boolean;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "data", listener: (entry: T) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "data", listener: (entry: T) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "data", listener: (entry: T) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "data", listener: (entry: T) => void): this;

  removeListener(event: string, listener: (...args: any[]) => void): this;
  removeListener(event: "data", listener: (entry: T) => void): this;
}

/**
 * https://nodejs.org/api/stream.html#stream_implementing_a_readable_stream
 */
export class Rxdable<T> extends Readable implements TypedReadable<T> {
  /**
   * I'm lazy
   */
  public static from<X>(observable: Observable<X>) {
    return new Rxdable<X>(observable);
  }

  /**
   * @constructor
   */
  constructor(source: Observable<T>) {
    super({ objectMode: true });
    this.observable = source;
  }

  /**
   * Rx.js source stream
   */
  public readonly observable: Observable<T>;

  /**
   * Rx.js subscription, generated when the readable go into "flowing" state
   */
  public get subscription() {
    return this._subscription;
  }

  /**
   * Rx.js subscription, generated when the readable go into "flowing" state
   */
  private _subscription: Subscription | null = null;

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
   * Process a single stream entry (and null for stream's end)
   */
  private _push(value: T | null) {
    if (this._flowing === true && this._buffer.length === 0) {
      this._flowing = this.push(value);
    } else {
      this._buffer.push(value);
    }
  }

  /**
   * Called by the internal Readable class methods when data from stream is requested
   */
  public _read() {
    // Enable flowing state
    this._flowing = true;

    // Ensure single observable subscription
    if (!this._subscription) {
      this._subscription = this.observable.subscribe(
        value => {
          this._push(value);
        },
        error => {
          this.emit("error", error);
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
  public _destroy(error: Error | null, callback: (error?: Error) => void) {
    if (this._subscription && !this._subscription.closed) {
      this._subscription.unsubscribe();
    }
    callback(error || undefined);
  }
}

/**
 * Create a Node.js readable stream from a Rx.js observable
 */
export function getReadableByObservable<T>(source: Observable<T>) {
  return Rxdable.from(source);
}

/**
 * No-op function
 */
function noop(): void {}

/**
 * Subscribe to a Node.js stream
 */
export function subscribeToStream<T = any>(
  stream: NodeJS.ReadableStream,
  next?: (value: T) => void | null | undefined,
  error?: (error: any) => void | null | undefined,
  complete?: () => void | null | undefined
) {
  // Stream event listeners
  const onData = next ? (data: T) => next(data) : noop;
  const onError = error ? (err: any) => error(err) : noop;
  const onEnd = complete ? () => complete() : noop;

  // Register event listeners
  stream
    .on("data", onData)
    .once("error", onError)
    .once("end", onEnd);

  // Return the subscription
  return new Subscription(() => {
    // Remove event listeners
    stream
      .removeListener("data", onData)
      .removeListener("error", onError)
      .removeListener("end", onEnd);
  });
}
