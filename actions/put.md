# HTTP put action

## `put [<url>]`

Perform a put request using the standard Fetch API.

The URL (if not supplied), and URL parameters will be sourced from the form
associated with the first target in the action context. The method will always
be `PUT` regardless of the form `action` attribute.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
- [`PUT`](https://developer.mozilla.org/docs/Web/HTTP/Reference/Methods/PUT)
