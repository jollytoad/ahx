# Base URL action

## `base-url <url>`

Set the base URL for later fetch requests to the given URL.

## `base-url @control`

Use the base URL of the control node when the request is made, this is the
default behaviour if the base URL hasn't been explicitly set.

If the control is defined by an attribute, it's the baseURL of the Element, or
if it's a CSS rule it's either the stylesheet URL, or the baseURL of the `style`
element.

## `base-url @root`

The baseURI of the root node of the control, usually the document or shadow
root.

## `base-url @this`

Use the baseURI of the event target node.

## `base-url @target`

Use the base URL of the first target node when the request is made.

## References

- [`new URL(url, base)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#base)
- [`baseURI`](https://developer.mozilla.org/en-US/docs/Web/API/Node/baseURI)
