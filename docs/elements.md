# Custom Elements

_ahx_ supports a number of custom elements.

## `<ahx-flush>`

This is really just a dummy element, it won't be swapped into the document.

The streaming parser can't be entirely sure an element is complete until either
the next sibling arrives or the end of the stream is reached. So this allows a
forced flush of the element without actually swapping anything extra into the
document.

```html
<div>Thinking, please wait...</div>
<ahx-flush><ahx-flush/>
<div>The answer is 42</div>
```

## `<ahx-replace-previous>`

This element can be returned in a streamed response to indicate that the next
sibling element to appear should replace the previous sibling of this.

It most useful to allow streaming of a placeholder, or progress element, that
eventually gets replaced by the final content.

For example a response may stream:

```html
<div>Thinking, please wait...</div>

<ahx-replace-previous></ahx-replace-previous>
```

then delay whilst doing it's processing, and eventually return...

```html
<div>The answer is 42</div>
```

This will cause the 'Thinking' div to be removed before swapping in the new
answer element.

The reason to use an element for this rather than an attribute or other marker,
is so that the initial element is seen as complete by the parser due to the
`<ahx-replace-previous>` appearing, and will be swapped into the document.

Multiple `<ahx-replace-previous>` elements are ignored.
