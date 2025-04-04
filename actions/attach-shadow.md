# Attach Shadow action

## `attach-shadow`

Attach an `open` shadow DOM to all target elements in the current action context
that don't currently have one. The new shadow roots will be initialized by
_ahx_, in the same way that the main `document` was.

**Output**

If at least one shadow root was created:

- `targets`: Array of created shadow roots

If no shadow roots could be created, the pipeline is stopped.

## References

- [`attachShadow()`](https://developer.mozilla.org/docs/Web/API/Element/attachShadow)
