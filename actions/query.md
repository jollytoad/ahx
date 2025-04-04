# HTTP query action

**WARNING:** The QUERY method is still in draft status so use with caution.

## `query [<url>]`

Perform a query request using the standard Fetch API.

The URL (if not supplied), and URL parameters will be sourced from the form
associated with the first target in the action context. The method will always
be `QUERY` regardless of the form `action` attribute.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
- [`QUERY`](https://httpwg.org/http-extensions/draft-ietf-httpbis-safe-method-w-body.html)
