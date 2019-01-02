import { Observable } from "rxjs";

import { Rxdable } from "./Rxdable";

/**
 * Create a Node.js readable stream from a Rx.js observable
 */
export function getReadableByObservable<T>(source: Observable<T>) {
  return Rxdable.from(source);
}
