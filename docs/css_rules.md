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
- prefixed with `--append()` function

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

### `--append()`

NOTE: This is not a standard CSS function.

Prefixing a custom property value with this will cause the value to be appended
to an existing value in the target attribute. It can accept a string that will
separate the new value.

```css
--append(',') attr(data-foo)
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

### --ahx-get/post/put/patch/delete

Cause an element to issue a HTTP request to the specified URL on the trigger
event, and replace the element with the returned HTML if successful.

The triggering event is determined by the type of the element, or may be
explicitly given via a `--ahx-trigger` CSS property or `ahx-trigger` attribute
on the element.

### --ahx-trigger

Specify what triggers an HTTP request. The value may be one, or many
(comma-separated) of an event name (eg. "click" or "my-custom-event") followed
by a set of event modifiers.

### --ahx-deny-trigger

Prevents triggering of requests on the selected elements. The only valid value
for this is `true`, and invalid properties will be deleted. Once a rule has
applied this, it is not possible to undo it via another rule.
