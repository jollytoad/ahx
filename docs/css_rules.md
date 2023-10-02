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

### --ahx-trigger

Specify what triggers an HTTP request. The value may be one, or many
(comma-separated) of an event name (eg. "click" or "my-custom-event") followed
by a set of event modifiers.

This can also be specified directly on an element using the `ahx-trigger`
attribute.

Equivalent of [hx-trigger](https://htmx.org/attributes/hx-trigger).

### --ahx-swap

Specify how the response of a request (`--ahx-get` etc) will be swapped into the
document relative to the target.

Possible values are:

- `innerHTML` - Replace the inner html of the target element
- `outerHTML` - Replace the entire target element with the response
- `beforebegin` - Insert the response before the target element
- `afterbegin` - Insert the response before the first child of the target
  element
- `beforeend` - Insert the response after the last child of the target element
- `afterend` - Insert the response after the target element
- `delete` - Deletes the target element regardless of the response
- `none`- Does not append content from response

This can also be specified directly on an element using the `ahx-swap`
attribute.

Equivalent of [hx-swap](https://htmx.org/attributes/hx-swap).

### --ahx-deny-trigger

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

### --ahx-value

Declare that a value should be harvested from all matching elements. A
`--prop()` or `attr()` function is usually used here to pick a value from the
element.

### --ahx-target

The target of this rule, in combination with `--ahx-value`, this targets an
element to hold form data, which may or may not be an actual form element. If it
is a form then the value is set on the named input belonging to the form, a new
hidden input is created if the named input does not exist. If it isn't a form
then an internal `FormData` object is associated with the element and values are
set in this.

_TODO: document extended selector_

### --ahx-input

Declares the name of the input inside the `--ahx-target` form (or FormData) to
received the value of `--ahx-value`.

### --ahx-include

_Not yet implemented_

Select a form (or element with an internal FormData) from which to include
request data (params or body data depending on the request method and encoding).
