import { Observer, Subscriber } from 'rxjs'

export function toSubscriber<T> (
  arg?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
) {
  if (arg instanceof Subscriber) {
    return arg
  } else if (typeof arg === 'object' && arg !== null) {
    return new Subscriber<T>(arg.next, arg.error, arg.complete)
  } else {
    return new Subscriber<T>(
      arg || undefined,
      error || undefined,
      complete || undefined
    )
  }
}
