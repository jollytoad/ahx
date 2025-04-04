# Form action

## `form`

Extracts form details from the event target and makes them available in the
action context.

**Output**

- `formData`: the form data object
- `request`: additional details obtained from the form or event to pass to a
  later request action (`fetch`, `get`, etc.)

## References

- [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)
- [`RequestInit`](https://developer.mozilla.org/docs/Web/API/RequestInit)
