# Abort action

## `abort [<event-type>]`

Aborts all active executions of the pipeline in which this action appears, or
optionally the executions of the pipeline for the given `<event-type>`.

### Example

```html
<div>
  <button on-click="target #output |> dispatch start">Start</button>
  <button on-click="target #output |> dispatch stop">Stop</button>

  <section
    id="output"
    class="box"
    on-start="attr get data-start |> swap text |> sleep 5000 |> attr get data-done |> swap text"
    on-stop="abort start |> attr get data-abort |> swap text"
    data-start="In Progress (will last 5 seconds)"
    data-done="Complete"
    data-abort="Aborted"
  >
    Ready
  </section>
</div>
```

## References

- [`abort()`](https://developer.mozilla.org/docs/Web/API/AbortController/abort)
