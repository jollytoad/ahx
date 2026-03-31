# Base URL action

## `base-url <url>`

Set the base URL for later fetch requests to the given URL.

## `base-url @control`

Use the base URL of the control node when the request is made, this is the
default behaviour if the base URL hasn't been explicitly set.

## `base-url @target`

Use the base URL of the first target node when the request is made.

## References

- [`new URL(url, base)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#base)
- [`baseURI`](https://developer.mozilla.org/en-US/docs/Web/API/Node/baseURI)
