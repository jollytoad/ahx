# Filter actions

(TODO: Maybe needs a better name, `filter style`?) (TODO: Consider `source`
rather than `nodes` as the op, and `target` rather than `targets`)

## `filter <op> <css-property-name> [...<value>]`

Filters nodes based on their computed CSS property values.

**Parameters**

- `op`: `nodes` to filter the source nodes, or `targets` to filter the target
  nodes
- `css-property-name`: The name of the CSS property to check
- `value`: Optional value to match against the property (if provided, filters
  for nodes that have this value in their computed style)

## References

- [`getComputedStyle()`](https://developer.mozilla.org/docs/Web/API/Window/getComputedStyle)
