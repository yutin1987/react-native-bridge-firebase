export default function EventTypeError(message) {
  Error.call(this, message);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'EventTypeError';
  this.message = message || 'Invalid Event Type';
}

EventTypeError.prototype = Object.create(Error.prototype);
EventTypeError.prototype.constructor = EventTypeError;
