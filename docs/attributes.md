# Element attributes

_ahx_ support a variety of custom attributes prefixed `ahx-*` to avoid collision
with standard html, `data-*` and other custom attributes. This also makes it
easier to audit _ahx_ features in use.

Some of these attributes are merely to provide an common convention for writing
CSS selectors, and others are actively processed by _ahx_.

## Conventional

### ahx-host

Declares the name(s) of the host application, this should be provided by the
host app itself, ideally on the `<html>` element. Several names can be supplied
separated by tokens, and should be kept simple.

Augmentations may use this to tailor their content.

Example that imports a stylesheet specifically for the `"ref"` app:

```css
[ahx-host~="ref"] {
  --ahx-import: url("ref.css");
}
```

### ahx-url-*

These attributes are automatically added to the `<html>` element and contain
details of the current document [Location].

- `ahx-url-href` the full URL
- `ahx-url-host` the host and port
- `ahx-url-path` the full path (eg. `/foo/bar`)
- `ahx-url-search` the search params of the URL (eg. `?foo=bar&bar=foo`), will
  not be present if empty
- `ahx-url-hash` the hash/fragment of the URL (eg. `#foo`), will not be present
  if empty

[Location]: https://developer.mozilla.org/en-US/docs/Web/API/Location

### ahx-data-*

These can be used by augmentations in the same way that `data-*` attributes are
used, this just prevents collisions with existing data attributes.

## Active

### ahx-trigger

See equivalent `--ahx-trigger` CSS property.

### ahx-get/post/put/patch/delete

See equivalent `--ahx-*` CSS properties.

### ahx-include

See equivalent `--ahx-include` CSS property.

### ahx-target

See equivalent `--ahx-target` CSS property.

### ahx-swap

See equivalent `--ahx-swap` CSS property.

### ahx-slot

Allow some content in a response to be swapped into a named slot in the
document.

The slots in the document are declared and named using the `ahx-slot-name`
attribute on an element, or the `--ahx-slot-name` property in a CSS rule.

It doesn't target a `<slot name="...">` element by default, but you could add a
rule to do so...

```css
slot[name="title"] {
  --ahx-slot-name: "title";
}
```

or use `ahx-slot-name` on a slot element:

```html
<slot ahx-slot-name="title"></slot>
```

You can also declare a pseudo element as a named slot too:

```css
div.toolbar::after {
  --ahx-slot-name: "tool";
}
```

Multiple elements may be declared to have the same slot name, in which case a
CSS selector can used to filter the slots.

For example:

```html
<div ahx-slot="action .project[data-id="foo"] :scope">
```

This would target the slot named `action` which matches the selector
`.project[data-id="foo"] :scope`.

NOTE: [`:scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope)
represents the slot in this case and so filters the slot to ensure it's within
an element matching `.project[data-id="foo"]`.

If no selector is given or if multiple elements are still matched for the given
slot name, then the source element is cloned and swapped into each matched slot.

### ahx-slot-swap

Declare the style for swapping into a slot targetted by the `ahx-slot`
attribute.

This is like `ahx-swap` but restricted to swapping just the content of the slot,
so possible values are:

- `inner` to replace the whole content of the slot element with the element.
- `afterBegin` to insert before the first child of the slot.
- `beforeEnd` to insert after the last child of the slot.

### ahx-slot-name

Declare any element to be a named slot that can be targetted by `ahx-slot`.
