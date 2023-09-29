# Custom Events

Almost everything that **ahx** does dispatches an event, and most of these are
cancellable and/or carry a mutable `detail` object. This allows the host app to
have total control over all **ahx** operations.

See the [types](../lib/types.ts) module (`AhxEventMap`/`AhxErrorMap`) for a
comprehensive set of events and details specified in TypeScript. These can
enforce the correct event details in dispatching and listener functions.

Event names follow a common pattern:

- `ahx:<name>` - before an operation and is cancellable unless stated otherwise,
  the `detail` of the event is can also be mutated by the handler unless stated.
- `ahx:<name>:done` - after an operation has completed (not if cancelled), will
  have the same `detail` as the before event unless stated.
- `ahx:<name>:veto` - if an operation was cancelled.
- `ahx:<name>:error` - if an error occurred.

## `ahx:startObserver`

Dispatched when the main `MutationObserver` is about to be started.

**Details**

- `detail` is the `MutationObserverInit` object that is passed to the `observe`
  function when starting the observer

## `ahx:mutations`

Dispatched when mutations from the observer have been detected.

**Details**

- `detail.mutations` - the array of `MutationRecords`
- _:done_ `detail.removedElements` - an array of all Elements removed from the
  document
- _:done_ `detail.addedElements` - an array of all Elements added to the
  document

## `ahx:processTree`

Dispatched before the initial document tree processing, this only happens once
on a page, all other processing will be performed in response to mutation
observations.

**Details**

- `detail.selector` - the CSS selector used to find all elements to be
  processed. The event handler may modify this to use a different selector.

## `ahx:processElement`

Dispatched on an `Element` before being processed for `ahx-*` attributes.

**Details**

- `detail.owner` - the _owner_ of the element, which by default is the URL of
  the stylesheet responsible for the existence of the element. This may be
  changed by the handler.

## `ahx:processStyleSheets`

Dispatched before processing of all CSS rules that exhibit an `--ahx-*`
property.

**Details**

- `detail.cssRules` - a map of style rules to the set of ahx property names
  present in the rule, the map and/or sets of properties may be modified to skip
  processing.

## `ahx:processRule`

Dispatched for a `CSSStyleRule` before being processed for `--ahx-*` properties.
The event target will be the `<link>` element of the stylesheet or just
`document`.

**Details**

- `detail.rule` - the CSSStyleRule
- `detail.props` - the set of ahx property names found on the style rule
- `detail.owner` - the _owner_ that this rule will apply to any elements created
  as a result of a actioned triggered by the rule, it defaults to the stylesheet
  URL but may be changed by the event handler.

## `ahx:cssImport`

Dispatched on the `document` before a CSS stylesheet is imported due to a
`--ahx-import` property.

NOTE: `ahx:cssImport:done` is dispatched on the inserted `<link>` element for
the stylesheet after the file has loaded and has been added into
`document.styleSheets`.

**Details**

- `detail.url` - the URL of the stylesheet to be imported
- `detail.crossOrigin` - the `crossOrigin` value from the parent stylesheet
- `detail.disabled` - whether the imported stylesheet will be initially
  disabled, this can be set by the event handler

## `ahx:pseudoElement`

Dispatched before a _pseudo_ element is added to the document as a result of a
`::before` or `::after` rule declaring custom properties.

**Details**

- `detail.pseudoElt` - the _pseudo_ element
- `detail.pseudoId` - a unique identifier to link the element to the css rule
  (`rule.pseudoId`)
- `detail.place` - the literal `"before"` or `"after"`

The `detail.pseudoElt` and `detail.place` may be modified.

## `ahx:pseudoRule`

When a _pseudo_ element is added, the original rule is duplicated to target the
inserted _pseudo_ element, it's this rule that actually causes the custom
properties to apply to the _pseudo_ element. This event is dispatched on the
document before the rule is added into the stylesheet.

**Details**

- `detail.pseudoId` - a unique identifier to link the element to the css rule
  (`rule.pseudoId`)
- `detail.pseudoRule` - a representation of rule to be added
- `detail.rule` - the original pseudo element [`CSSStyleRule`]
- `detail.place` - the literal `"before"` or `"after"`
- `detail.owner` - the _owner_ of the new pseudo rule

- _:done_ `detail.pseudoRule` - this will be the added [`CSSStyleRule`]

[`CSSStyleRule`]: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule

## `ahx:addTrigger`

Dispatched when a new ahx trigger is found, this may be a from an Element or CSS
rule.

**Details**

- `detail.origin` - the Element or CSS rule from which the rule originated
- `detail.trigger` - the trigger spec
- `detail.action` - the action to perform on triggering
- `detail.owner` - the _owner_ of the trigger, obtained from the originating
  element or rule, may be changed by the event handler

## `ahx:addEventType`

Dispatched when the first listener for a type of event is added.

**Details**

- `detail.eventType` - the event type (immutable)

## `ahx:handleTrigger`

Dispatched when an event is handled by an ahx trigger (and not denied). Maybe
cancelled to prevent the action.

- `detail.trigger` - the trigger spec
- `detail.action` - the action to perform on triggering
- `detail.owner` - the _owner_ of the trigger

## `ahx:handleAction`

Dispatched before a triggered action is performed.

- `detail.trigger` - the trigger spec
- `detail.action` - the action to perform on triggering
- `detail.owner` - the _owner_ of the trigger

## `ahx:swap`

Dispatch before a fetched element is inserted into the DOM.

**Details**

- `detail.element` - the element to swap in
- `detail.previous` - the previous sibling element that was successfully swapped
  in
- `detail.index` - the index of the element within the body of the response
- `detail.swapStyle` - the type of swap
- `detail.owner` - the _owner_ of the elements to be swapped in

## Error Events

### `ahx:triggerSyntax:error`

Dispatched when a `ahx-trigger` property in invalid.

### `ahx:pseudoElementNotPermitted:error`

Dispatched when a pseudo element is not permitted under a parent element.

### `ahx:invalidCssValue:error`

Dispatched when an ahx css property value is invalid.

### `ahx:triggerDenied:error`

Dispatched when a trigger was denied due to a `--ahx-deny-trigger` rule being
applied to the target element.
