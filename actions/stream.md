# Stream action

## `stream`

Process the incoming HTTP response body as a stream of HTML elements and feed
them into subsequent actions in the pipeline as soon as they are parsed.

**Output**

- `nodes`: a stream of DOM nodes parsed from the response body
