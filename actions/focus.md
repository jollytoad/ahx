# Focus action

## `focus`

Focus the first focusable target element.

Try each target element until one successfully gains the focus.

### Example

```html
<div>
  <button on-click="target #target input |> focus">Focus</button>

  <ul id="target">
    <li><input disabled /></li>
    <li><input /></li>
    <li><input /></li>
  </ul>
</div>
```

## References

- [`focus()`](https://developer.mozilla.org/docs/Web/API/HTMLElement/focus)
- [`activeElement`](https://developer.mozilla.org/docs/Web/API/Document/activeElement)
