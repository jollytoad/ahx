# Class actions

## `class <op> [<...class-names>]`

These actions perform operations on the `class` attribute of all target elements
in the current action context.

### `class set <...class-names>`

Set the entire class list of all target elements to the specified
space-separated class names.

### `class empty`

Remove all classes from the target elements by setting the className property to
an empty string.

### `class add <...class-names>`

Add the specified class names to all target elements.

### `class remove <...class-names>`

Remove the specified class names from all target elements.

### `class replace <old-class> <new-class>`

Replace a specific class with a new one on all target elements.

### `class toggle <...class-names>`

Toggle the presence of the specified class names on all target elements (add if
absent, remove if present).

## References

- [`className`](https://developer.mozilla.org/docs/Web/API/Element/className)
- [`classList`](https://developer.mozilla.org/docs/Web/API/Element/classList)
