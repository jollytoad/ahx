# HTTP delete action

## `delete [<url>]`

Perform a delete request using the standard Fetch API.

The URL (if not supplied), and URL parameters will be sourced from the form
associated with the first target in the action context. The method will always
be `DELETE` regardless of the form `action` attribute.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
- [`DELETE`](https://developer.mozilla.org/docs/Web/HTTP/Reference/Methods/DELETE)
