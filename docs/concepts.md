# Concepts

It may help to understand some of the concepts of _ahx_ to make the most of it,
especially if you want to contribute to the library.

## Hypermedia Controls

The central concept in _ahx_ is the hypermedia **control**, any element can
become an _ahx_ control, directly within the HTML using custom attributes, or
via CSS rules, using custom properties.

All controls consist of:

- a **trigger**,
- an **action**,
- a **swap** strategy, and
- a **target** for the swap.

IMPORTANT: A control is declared atomically by attributes on a single element or
custom properties within a single CSS style rule. A control does not inherit
part of its config from anywhere else.

For example, given the following two rules:

```css
.something {
  --ahx-trigger: click;
  --ahx-get: url(/clicked);
}

.something {
  --ahx-trigger: load;
  --ahx-get: url(/loaded);
}
```

The _click_ trigger will perform _get_ action of `/clicked` only, and _load_
trigger of `/loaded` only.

Control properties are not inherited from other CSS rules, and attributes are
not inherited from parent elements (unlike in _htmx_).

Internally a **control declaration** (the element or CSS rule) is processed by
the [processControls](../lib/process_controls.ts) function.

You can list all elements identified as _ahx_ controls (whether by attributes or
CSS rules) in the current document by calling `ahx.controls()` from the browser
console.

## Triggers

- `ahx-trigger`

A control needs to be triggered by something, which may be a standard or custom
event or a special _ahx_ specific event.

The element on which the trigger occurs is known as the **source** for our
purposes.

`ahx-trigger` is used to declare the possible triggers of the control, and is
parsed by the [parseTriggers](../lib/parse_triggers.ts) function.

### Standard Events

Any [common event], or [custom event], can be declared as the trigger of a
control.

[common event]: https://developer.mozilla.org/en-US/docs/Web/Events
[custom event]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

```html
<div ahx-trigger="click">
```

```css
.something {
  --ahx-trigger: click;
}
```

### Special Events

These are events that are dispatched by _ahx_ itself, although they are still
dispatched as [custom event]s internally.

- `load` - this occurs when an element is first seen by _ahx_, either when the
  document is loaded, or when the element is added through some other mutation.
- `mutate` - this occurs when an existing element is mutated in some way, ie.
  it's attributes modified, or children modified.

```html
<div ahx-trigger="load, mutate">
```

```css
.something {
  --ahx-trigger: load, mutate;
}
```

Internally these are dispatched as custom events prefixed with `ahx:`.

## Actions

A control must declare an action to be performed in response to the trigger.

This may be to perform a request or to harvest some data from elsewhere in the
document.

All action attributes/properties are parsed with the
[parseActions](../lib/parse_actions.ts) function.

### Fetch requests

- `ahx-get`
- `ahx-post`
- `ahx-put`
- `ahx-patch`
- `ahx-delete`

These actions perform a request using the [Fetch API].

[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

```html
<div ahx-get="/foo">
```

```css
.something {
  --ahx-get: url("/foo");
}
```

### Data harvesting

- `ahx-harvest`

This action 'harvests' data from an attribute or property of the _source_
element in response to the trigger. This can only be declared via a CSS rule.

```css
.something {
  --ahx-harvest: attr(data-foo);
}

.other {
  --ahx-harvest: --prop(innerText);
}
```

## Targets

- `ahx-target`
- `ahx-slot`

The element to be swapped into the document is known as the _target_, and by
default it will be the same as the _source_, unless an alternative has been
explicitly selected via a `ahx-target`, or `ahx-slot`.

```html
<div ahx-target="closest form">
```

```css
.something {
  --ahx-target: closest form;
}
```

The target value is parsed with the [parseTarget](../lib/parse_target.ts)
function.

Content returned from an action may target a slot by name:

```html
<div ahx-slot="foo">
```

This will be swapped into the document independently (aka out-of-band in htmx
terms) of the target declared by `ahx-target`.

## Slots

- `ahx-slot-name`

_ahx_ _slots_ are named elements/placeholders in the document, which can be
targetted by content returned from an _action_ independently of the declared
_target_ of the _control_. This is similar to the out-of-band concept in htmx,
only a bit more restrictive.

Slots are declared with `ahx-slot-name` attribute or css property, and targetted
by content using the `ahx-slot` attribute.

## Swap strategy

- `ahx-swap`

Declare the strategy used to **swap** the content or data from the action into
the _target_ within the document.

```html
<div ahx-swap="outer">
```

```css
.something {
  --ahx-swap: outer;
}
```

The swap value is parsed by the [parseSwap](../lib/parse_swap.ts) function.
