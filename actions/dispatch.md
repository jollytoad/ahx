# Dispatch action

## `dispatch <event-type>`

Dispatch a custom event to all target elements.

The event will
[bubble](https://developer.mozilla.org/docs/Web/API/Event/bubbles) and is
[cancelable](https://developer.mozilla.org/docs/Web/API/Event/cancelable), a
cancelled event will break the pipeline.

## References

- [`dispatchEvent()`](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)
- [`CustomEvent`](https://developer.mozilla.org/docs/Web/API/CustomEvent/CustomEvent)
