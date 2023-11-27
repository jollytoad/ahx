# CSS Rules

An **ahx** augmentation uses CSS to declare how it wishes to augment a page.

Regular CSS selector-based rules target the elements, and custom properties
define the behaviour.

All custom properties start with the `--ahx-` prefix and are generally
equivalent to the same `ahx-` attribute. There are some properties that are not
available as attributes though.

## Property values

The values of these custom properties can be:

- plain strings (unquoted)
- single or double quoted strings
- [`url()`](https://developer.mozilla.org/en-US/docs/Web/CSS/url) function
- [`attr()`](https://developer.mozilla.org/en-US/docs/Web/CSS/attr) function
- `--prop()` custom function

### `url()`

The URL may be quoted or unquoted, and relative or absolute...

```css
url(/foo)
url("/foo")
url('foo.css')
url("http://example.com/foo")
```

Relative URLs are resolved against the URL of the Stylesheet.

### `attr()`

The `attr` function takes an unquoted attribute name, and an optional type.

```css
attr(data-foo)
attr(href url)
```

At present, the only supported type is `url` which will result in the attribute
value being parsed as a URL and resolved against the document base URL.

### `--prop()`

NOTE: This is not a standard CSS function.

This take the same arguments syntax as `attr()` but pulls the value directly
from a property of the DOM element as opposed to an attribute.

```css
--prop(innerText)
--prop(href url)
```

## Custom Ahx Properties

### --ahx-import

Imports the given CSS stylesheet(s) if the rule matches once.

Example:

```css
[ahx-host~="foo"] [data-page="projects"] {
  --ahx-import: url("foo-projects.css");
}
```

The `url()` CSS function must be used.

This will actually insert a `<link>` element into the `document.head` when the
rule first matches at least one element. The stylesheet will be disabled if the
rule no longer matches an element in the document.

Multiple space-separated urls may be given:

```css
[ahx-host~="foo"] {
  --ahx-import: url("one.css") url("two.css") url("three.css");
}
```

Has no attribute equivalent.

No equivalent in _htmx_.

### --ahx-trigger

Specify what triggers an HTTP request or other action. The value may be one, or
many (comma-separated) of an event name (eg. "click" or "my-custom-event")
followed by a set of event modifiers.

This can also be specified directly on an element using the `ahx-trigger`
attribute.

There are several special events:

- `load` triggered when an element is first loaded
- `mutate` triggered when an element is mutated (attributes or content change)

Equivalent of [hx-trigger](https://htmx.org/attributes/hx-trigger).

### --ahx-get/post/put/patch/delete

Cause an element to issue a HTTP request to the specified URL on the trigger
event, and replace the element with the returned HTML if successful.

The value of this property should be:

- `url(<url>)` function containing an absolute or relative URL (which will be
  resolved against the URL of the stylesheet)
- `attr(<name> url)` function specifying an attribute to obtain the URL,
  relative URLs will be resolved against the base URL of the element.

The triggering event must be explicitly given via a `--ahx-trigger` CSS
property.

```css
[ahx-host~="foo"] .actions::after {
  --ahx-trigger: load once;
  --ahx-get: url("actions");
  --ahx-swap: inner;
}
```

```css
.my-button {
  --ahx-trigger: click;
  --ahx-get: attr(ahx-get url);
  --ahx-swap: outer;
}
```

This can also be specified directly on an element using `ahx-*` attributes.

Equivalent of [hx-get](https://htmx.org/attributes/hx-get),
[hx-post](https://htmx.org/attributes/hx-post),
[hx-put](https://htmx.org/attributes/hx-put),
[hx-patch](https://htmx.org/attributes/hx-patch),
[hx-delete](https://htmx.org/attributes/hx-delete).

### --ahx-headers

Allows you to add headers that will be submitted with a HTTP request.

The value of this must be a valid JSON object of the headers.

```css
.my-button {
  --ahx-trigger: click;
  --ahx-get: attr(ahx-get url);
  --ahx-swap: outer;
  --ahx-headers: {
    "X-Custom-Header": "foo"
  };
}
```

NOTE: This is only supported as a CSS property, and NOT as an element attribute.

Equivalent of [hx-headers](https://htmx.org/attributes/hx-headers), but does not
support dynamic evaluation using javascript code.

### --ahx-harvest

Cause the value of the property to be 'harvested' on the trigger event. This is
similar to the request actions (eg. `--ahx-get`) except it gets data directly
from the document. A `--prop()` or `attr()` function is usually used here to
pick a value from the element. This is generally used in combination with a
`load` or `mutate` trigger, and a `attr` or `input` swap style.

### --ahx-swap

Specify how the response of a request (`--ahx-get` etc) or a harvested value
(`--ahx-value`) will be swapped into the document relative to the target.

Possible values are:

- `inner` to replace the children of the target element with the response
  elements.
- `outer` to replace the entire target element with the response elements.
- `beforeBegin` to insert the response before the target element.
- `afterBegin` to insert the response before the first child of the target
  element.
- `beforeEnd` to insert the response after the last child of the target element.
- `afterEnd` to insert the response after the target element.
- `delete` deletes the target element regardless of the response.
- `none` does not append content from response, but any slots will still be
  swapped.

Also, not in _htmx_:

- `attr <attribute-name>` to set the attribute of the target element.
- `input <input-name>` if the target is a `<form>`, this will set the value of
  the named input belonging to that form, or create a hidden input if it does
  not exist. If the target is not a form an internal `FormData` object is
  associated with the target and the value is set in this.

Defaults to `none`.

All top-level elements (ie. direct children of `<body>`) will be swapped into
the declared position, so a single target element may be replaced with several
elements if `outer` is used.

Any top-level element with an `ahx-swap` attribute will be treated separately,
and swapped into a named 'slot', as declared by a `<slot>` element or a
`--ahx-slot-name` property in a CSS rule.

This can also be specified directly on an element using the `ahx-swap`
attribute.

Equivalent of [hx-swap](https://htmx.org/attributes/hx-swap), variations of
note:

- `inner` and `outer` are roughly equivalent to _htmx_ `innerHTML` &
  `outerHTML`, but _ahx_ may use a morph swap in the future for this.
- _htmx_ defaults to `innerHTML` (which may also be configured), for safety and
  clarity for an auditor, _ahx_ defaults to `none` and is not configurable.
- _ahx_ will stream the response into a temporary document using the native
  streaming document parser of the browser, and will swap each child of the
  document body once the next child arrives.
- a `<template>` element may be used to wrap all top-level elements, to prevent
  parsing issues where certain tags can't be directly under `<body>`. The
  template must be the first child of the `<body>`.

#### swap modifiers

- `swap:<delay>` wait for the given amount of time before performing the swap
  (not yet implemented).
- `append` (for `input` swap only) causes the value to be appended to the form
  (if the same value is not already present). Either via a new hidden `<input>`
  element or just via `FormData.append`.
- `join`, `join:space`, `join:comma` (for `input`/`attr` swaps) causes the value
  to be joined to an existing value (duplicate values will be removed). The
  values are space separated by default or with `join:space`, but `join:comma`
  maybe be given to use a comma instead.

### --ahx-dispatch

Allows custom events to be dispatched in response to a trigger.

```css
#button {
  --ahx-trigger: click;
  --ahx-dispatch: get-the-thing;
  --ahx-target: #thing;
}

#thing {
  --ahx-trigger: get-the-thing;
  --ahx-get: url("the-thing");
}
```

NOTE: This is only supported as a CSS property, and NOT as an element attribute.

There is no equivalent _htmx_ attribute, although it does allow dispatching of
events via the [HX-Trigger](https://htmx.org/headers/hx-trigger/) response
header.

### --ahx-target

Allows you to target a different element for the swap (or event) than that of
the rule.

The value of this property can be:

- A CSS selector (from the document root)
- `this` to indicate the target of the rule
- `closest <CSS selector>` to find the closest ancestor element or itself, that
  matches the selector.
- `find <CSS selector>` to find the first descendant that matches the selector.
- `next <CSS selector>` to scan forward for the next element that matches the
  selector.
- `previous <CSS selector>` to scan backwards for the previous element that
  matches the selector.

Defaults to `this`.

The value may also be prefixed with `await`, which will cause any triggered
action to be queued if the target element doesn't yet exist, and performed once
the target element appears in the document.

This can also be specified directly on an element using the `ahx-target`
attribute.

Equivalent of [hx-target](https://htmx.org/attributes/hx-target).

### --ahx-include

Select a form (or element with an internal `FormData`) from which to include
request data (params or body data depending on the request method and encoding).

This can also be specified directly on an element using the `ahx-include`
attribute.

Similar to [hx-include](https://htmx.org/attributes/hx-include).

(NOTE: This cannot yet target individual inputs)

### --ahx-slot-name

Assign a slot name to the elements, this will be the target of any top-level
elements with an `ahx-slot` attribute from a response.

This is an alternative to
[hx-swap-oob](https://htmx.org/attributes/hx-swap-oob).

### --ahx-deny-trigger

CURRENTLY BROKEN!

Prevents triggering of requests on the selected elements. The only valid value
for this is `true`, and invalid properties will be deleted. Once a rule has
applied this, it is not possible to undo it via another rule.

Has no attribute equivalent, although a CSS rule could be added to emulate it:

```css
[ahx-deny-trigger], [ahx-deny-trigger] * {
  --ahx-deny-trigger: true;
}
```

Nearest thing in _htmx_ is [hx-disable](https://htmx.org/attributes/hx-disable).
