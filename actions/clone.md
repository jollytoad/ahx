# Clone action

## `clone`

Create deep clones of all selected elements in the current action context.

**Output**

- `nodes`: A stream of cloned nodes (deep copies of the original nodes)

### Example

```html
<div>
  <button
    on-click="select #source > li |> target #target |> clone |> swap append"
  >
    Clone
  </button>
  <button on-click="select #source > li |> target #target |> swap append">
    Move
  </button>

  <ul id="source">
    <li>Dolly</li>
  </ul>

  <hr />

  <ul id="target"></ul>
</div>
```

## References

- [`cloneNode()`](https://developer.mozilla.org/docs/Web/API/Node/cloneNode`)
