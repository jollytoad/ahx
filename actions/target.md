# Target action

## `target [<mode>] <selector>`

Select new target elements using an extended CSS selector or other mechanism
according to the optional `mode`.

### `target [<limit>] [<scope>] [<axis>] [<css-selector>]`

Select new target elements using a CSS selector and optional modifiers.

_`limit`_ determines how many elements will be selected, and maybe `all`
(default), `first`, or `last`.

_`scope`_ sets the scope in which the selector query will be applied:

- `this`: the event target
- `root`: the root node for the control, usually the `<body>` or a shadow root
- `scope`: within the scope of the current targets in the action context

_`axis`_ determines how we walk the DOM to find nodes:

- if not given, search under the _scope_ determined above
- `closest` find the closest matching ancestor
- `previous` find the nearest preceding sibling
- `next` find the nearest following sibling
- `document` search under the owner document(s), or select the document itself
  if no selector is given
- `head` search under the `<head>` element, or select the `<head>` itself if no
  selector is given
- `body` search under the `<body>` element, or select the `<body>` itself if no
  selector is given
- `shadowroot` search under the shadow root of the _scope_ element, or select
  the shadow root itself if no selector is given
- `host` search under the host of the _scope_ element, or select the host itself
  if no selector is given

### `target xpath <expression>`

Select new target elements using a standard XPath 1.0 expression.

### `target xpath-class <expression>`

Select new target elements using a XPath 1.0 expression with an extended syntax.

**Extended syntax**

XPath provides a more powerful way to navigate the DOM than CSS selectors allow,
but it has one very inconvenient drawback in that it doesn't support the
semantics of the `class` attribute in a concise manner. The only reliable way to
match for a class name in XPath is via the following verbose XPath condition:

`[contains(concat(' ', normalize-space(@class), ' '), ' classname ')]`

And so, the extended syntax allows to use the more concise CSS like `.classname`
syntax appended to element names or the wildcard, examples:

- `div.highlight` → Selects div elements with the "highlight" class
- `*.important` → Selects any element with the "important" class
- `tr.odd/td.price` → Selects price cells within odd rows

This concise `.classname` syntax will be replaced with the verbose condition
above before evaluation.

### `target attr <...attribute-names>`

Select new targets identified by the given attributes of the current targets.

Example: `target attr aria-controls` will select the element identified by the
`aria-controls` attribute.

Standard attributes that reference one or more ids:

- [`aria-activedescendant`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
- [`aria-controls`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-controls)
- [`aria-describedby`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
- [`aria-details`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-details)
- [`aria-flowto`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-flowto)
- [`aria-labelledby`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)
- [`aria-owns`](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-owns)
- [`for`](https://developer.mozilla.org/docs/Web/HTML/Attributes/for)
- [`form`](https://developer.mozilla.org/docs/Web/HTML/Element/input#form)
- [`headers`](https://developer.mozilla.org/docs/Web/HTML/Element/td#headers)
- [`list`](https://developer.mozilla.org/docs/Web/HTML/Element/input#list)

## References

- [`querySelectorAll()`](https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll)
- [`getElementById()`](https://developer.mozilla.org/docs/Web/API/Document/getElementById)
- [`matches()`](https://developer.mozilla.org/docs/Web/API/Element/matches)
- [`closest()`](https://developer.mozilla.org/docs/Web/API/Element/closest)
- [`previousSibling`](https://developer.mozilla.org/docs/Web/API/Node/previousSibling)
- [`nextSibling`](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)
- [`ownerDocument`](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument)
- [`shadowRoot`](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot)
- [`host`](https://developer.mozilla.org/docs/Web/API/ShadowRoot/host)
- [`head`](https://developer.mozilla.org/docs/Web/API/Document/head)
- [`body`](https://developer.mozilla.org/docs/Web/API/Document/body)
