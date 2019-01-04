import { Observable } from "rxjs";

import { Rxdable } from "./Rxdable";

/**
 * Create a Node.js readable stream from a Rx.js observable
 */
export function getStreamByObservable<T>(source: Observable<T>) {
  return new Rxdable(source);
}
