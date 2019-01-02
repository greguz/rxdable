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
