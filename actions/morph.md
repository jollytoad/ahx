# Morph action

## `morph [<algorithm>] [<swap-mode>]`

Merge the source content with the target elements using a morphing algorithm
(Idiomorph), preserving state and focus where possible.

- `algorithm`: Algorithm to use: `morphlex`, or `idiomorph`.
- `swapMode`: `inner` (default) or `outer`.

If `algorithm` isn't given it will default to checking for whichever is
available, in the order listed above, and will fall back to a plain `swap`.

## Requirements

### morphlex

An import mapping for the `morphlex` bare module specifier must map to the
Morphlex module, eg:

```json
{
  "imports": {
    "morphlex": "https://cdn.jsdelivr.net/npm/morphlex@1.4.0/+esm"
  }
}
```

### idiomorph

Either `Idiomorph` should be available in the global `window` object, or an
import mapping for the `idiomorph` bare module specifier must map to the
Idiomorph module, eg:

```json
{
  "imports": {
    "idiomorph": "https://cdn.jsdelivr.net/gh/bigskysoftware/idiomorph@0.7.4/dist/idiomorph.esm.js"
  }
}
```

## References

- [Morphlex](https://github.com/yippee-fun/morphlex)
- [Idiomorph](https://github.com/bigskysoftware/idiomorph)
