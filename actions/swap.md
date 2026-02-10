# Swap action

## `swap [<mode>]`

Replace, insert, or modify target elements using source content from the current
action context.

**IMPORTANT:** This action does not attempt to sanitize the incoming content, if
you don't trust the source of the content use the `sanitize` action first.

`mode` may be:

- `inner`: (default) replace the content of a target element
- `outer`: replace the entire target element
- `before`: insert before the target element as a preceding sibling
- `after`: insert after the target element as a following sibling
- `prepend`: prepend before all other children inside the target element
- `append`: append after all other children inside the target element
- `text`: replace the content of the target element with the source content as
  plain text
- `delete`: just delete the target element, ignoring the source content
- `empty`: empty the target element of children, ignoring the source content
- `none`: ignore the source content, do nothing

## References

- [`innerHTML`](https://developer.mozilla.org/docs/Web/API/Element/innerHTML)
- [`outerHTML`](https://developer.mozilla.org/docs/Web/API/Element/outerHTML)
- [`textContent`](https://developer.mozilla.org/docs/Web/API/Node/textContent)
- [`insertAdjacentHTML()`](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentHTML)
- [`insertAdjacentElement()`](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentElement)
- [`insertBefore()`](https://developer.mozilla.org/docs/Web/API/Node/insertBefore)
- [`insertAfter()`](https://developer.mozilla.org/docs/Web/API/Node/insertAfter)
- [`appendChild()`](https://developer.mozilla.org/docs/Web/API/Node/appendChild)
- [`removeChild()`](https://developer.mozilla.org/docs/Web/API/Node/removeChild)
- [`replaceChild()`](https://developer.mozilla.org/docs/Web/API/Node/replaceChild)
- [`replaceChildren()`](https://developer.mozilla.org/docs/Web/API/Element/replaceChildren)
- [`replaceWith()`](https://developer.mozilla.org/docs/Web/API/Element/replaceWith)
