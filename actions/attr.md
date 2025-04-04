# Attribute actions

## `attr <op> <attribute-name> [...<value>]`

This action will perform an operation for the named attribute on all target
elements with the current action context.

Operations that mutate the attribute will obtain the value from the remaining
args of the action (joined by space), or from the first `texts` value of the
action context.

### `attr get <attribute-name>`

Retrieve the values of the named attribute from all target elements.

**Output**

- `texts`: the attributes values
- `nodes`: the actual [Attr](https://developer.mozilla.org/docs/Web/API/Attr)
  nodes

### `attr remove <attribute-name>`

Remove the named attribute from all target elements.

The context is not changed.

### `attr set <attribute-name> [...<value>]`

Set the value of the named attribute on all target elements.

### `attr add <attribute-name> [...<value>]`

Add the named attribute on all target elements if it's not already set. If a
value is not given, then a empty value is set, which indicates a boolean true
for regular HTML attributes. If the attr name starts with `aria-` then the
literal value of `true` is set instead.

### `attr append <attribute-name> [...<value>]`

(may also use `join` as an alias for `append` - to mirror the `input` action
ops)

Append the value to the existing attribute value on all target elements,
separated by a space. Acts like `set` if the attribute doesn't already exist.

### `attr include <attribute-name> [...<value>]`

Add the value to the existing attribute, if it doesn't contain it. Acts like
`set` if the attribute doesn't already exist.

### `attr exclude <attribute-name> [...<value>]`

Remove the given value from an existing attribute.

## References

- [`getAttribute()`](https://developer.mozilla.org/docs/Web/API/Element/getAttribute)
- [`setAttribute()`](https://developer.mozilla.org/docs/Web/API/Element/setAttribute)
- [`removeAttribute()`](https://developer.mozilla.org/docs/Web/API/Element/removeAttribute)
