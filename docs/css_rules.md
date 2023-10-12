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

Imports the given CSS stylesheet if the rule matches once.

Example:

```css
[data-host-app="foo"] [data-page="projects"] {
  --ahx-import: url("foo-projects.css");
}
```

The `url()` CSS function must be used.

This will actually insert a `<link>` element into the `document.head` when the
rule first matches at least one element. The property is removed from the
stylesheet once processed so that it doesn't get applied again.

As CSS only allows a single instance of a prop per rule, you can append an
arbitrary extension to the property name to allow importing of multiple sheets:

```css
.selector {
  --ahx-import-common-styles: url("style.css");
  --ahx-import-foo: url("foo.css");
}
```

NOTE: The stylesheet is not removed or disabled later should the rule no longer
match any element (this behaviour may get implemented in the future).

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

The triggering event is determined by the type of the element, or may be
explicitly given via a `--ahx-trigger` CSS property or `ahx-trigger` attribute
on the element.

This can also be specified directly on an element using `ahx-*` attributes.

Equivalent of [hx-get](https://htmx.org/attributes/hx-get),
[hx-post](https://htmx.org/attributes/hx-post),
[hx-put](https://htmx.org/attributes/hx-put),
[hx-patch](https://htmx.org/attributes/hx-patch),
[hx-delete](https://htmx.org/attributes/hx-delete).

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

- `innerHTML` to replace the inner content of the target element.
- `outerHTML` to replace the entire target element with the response.
- `beforebegin` to insert the response before the target element.
- `afterbegin` to insert the response before the first child of the target
  element.
- `beforeend` to insert the response after the last child of the target element.
- `afterend` to insert the response after the target element.
- `delete` deletes the target element regardless of the response.
- `none` does not append content from response.

Also, not in _htmx_:

- `attr <attribute-name>` to set the attribute of the target element.
- `input <input-name>` if the target is a `<form>`, this will set the value of
  the named input belonging to that form, or create a hidden input if it does
  not exist. If the target is not a form an internal `FormData` object is
  associated with the target and the value is set in this.

This can also be specified directly on an element using the `ahx-swap`
attribute.

Equivalent of [hx-swap](https://htmx.org/attributes/hx-swap).

#### swap modifiers

- `swap:<delay>` wait for the given amount of time before performing the swap
  (not yet implemented).
- `append` (for `input` swap only) causes the value to be appended to the form
  (if the same value is not already present). Either via a new hidden `<input>`
  element or just via `FormData.append`.
- `join` (for `input`/`attr` swaps) causes the value to be joined to an existing
  space-separator value (duplicate values will be removed).

### --ahx-target

Allows you to target a different element for the swap than that of the rule.

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
