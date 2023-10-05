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

### ahx-get/post/put/patch/delete

See equivalent `--ahx-*` CSS properties.

### ahx-trigger

See equivalent `--ahx-trigger` CSS property.

### ahx-swap

See equivalent `--ahx-swap` CSS property.
