/**
 * Custom error instace
 */
export class UnsubscribedError extends Error {
  constructor() {
    super("Unsubscribed");
    Error.captureStackTrace(this, UnsubscribedError);
  }
}
