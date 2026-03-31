# HTTP delete action

## `delete [<url>]`

Perform a delete request using the standard Fetch API.

The URL (if not supplied) and other request data will be sourced from the action
context, ie. previous actions within the pipeline.

This does not implicitly gather data from the form or any DOM element even if
used directly on a form element.

You need to explicitly use the `form` action to push the form data into the
action pipeline:

`on-submit="form |> delete"`

This is to avoid any unintentional leaking of data.

The request method will always be `DELETE` regardless of the action context.

**Output**

- `response`: The fetch Response object

## References

- [`fetch()`](https://developer.mozilla.org/docs/Web/API/Window/fetch)
- [`DELETE`](https://developer.mozilla.org/docs/Web/HTTP/Reference/Methods/DELETE)
