# Fetch action

## `fetch [<url>]`

Perform a HTTP request using the standard Fetch API.

The URL (if not supplied) and other request data will be sourced from the action
context, ie. previous actions within the pipeline.

This does not implicitly gather data from the form or any DOM element even if
used directly on a form element.

You need to explicitly use the `form` action to push the form data into the
action pipeline:

`on-submit="form |> fetch"`

This is to avoid any unintentional leaking of data.

The request method will default to `GET` if not obtained from the action
context.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
