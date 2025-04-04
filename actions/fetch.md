# Fetch action

## `fetch [<url>]`

Perform a HTTP request using the standard Fetch API.

(TODO: consider not implicitly gathering data)

The method, URL (if not supplied), and content will be sourced from the form
associated with the first target in the action context. The method will default
to `GET` if necessary.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
