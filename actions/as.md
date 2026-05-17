# Conversion actions

## `as text`

Extract plain text from response or nodes.

## Example

```html
<div>
  <button on-click="select #source |> as text |> target #output |> swap text">
    Extract Text
  </button>

  <section id="source">
    <p>Here <span>is</span> some <b>text!</b></p>
  </section>

  <pre id="output"></pre>
</div>
```
