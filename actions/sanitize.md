# Sanitize action

## `sanitize [<output-type>]`

Sanitize HTML content from a response body to protect against XSS and other
malicious content, using DOMPurify.

`output-type` may be:

- `fragment`: a DocumentFragment (default)
- `node`: a `<body>` element
- `html`: a html string

## Requirements

Either `DOMPurify` should be available in the global `window` object, or an
import mapping for the `dompurify` bare module specifier must map to the
DOMPurify module, eg:

```json
{
  "imports": {
    "dompurify": "https://cdn.jsdelivr.net/gh/cure53/dompurify@3.2.4/dist/purify.es.mjs"
  }
}
```

## References

- [DOMPurify](https://github.com/cure53/DOMPurify)
- [`DocumentFragment`](https://developer.mozilla.org/docs/Web/API/DocumentFragment)
- [`HTMLBodyElement`](https://developer.mozilla.org/docs/Web/API/HTMLBodyElement)
