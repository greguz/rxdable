import { Observer, Subscriber } from "rxjs";

/**
 * Map the arguments to a subscriber instance
 */
export function toSubscriber<T>(
  arg?: Partial<Observer<T>> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void
) {
  if (typeof arg === "function") {
    return new Subscriber<T>(arg, error, complete);
  } else if (arg instanceof Subscriber) {
    return arg;
  } else if (arg) {
    return new Subscriber<T>(arg.next, arg.error, arg.complete);
  } else {
    return new Subscriber<T>();
  }
}
