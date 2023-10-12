# Comparison to htmx features

Shows which features from _htmx_ are included or not in _ahx_, along with
differences, and features unique to ahx.

This is a work in progress and may not currently reflect reality.

## Important differences

The focus of _ahx_ is to provide a means for a third-party to augment the UI of
a _host_ application, and so it has to place security and auditability over
developer convenience.

Therefore some of the developer conveniences of _htmx_ are deliberately not
supported by _ahx_, for example: boosting, inheritance, implicit default trigger
events.

Below I may mention an _auditor_, this may be a potential user of the
third-party augmentation, an administrator, a developer, the host app, or
another piece of software.

---

Key:

- **N** - feature unlikely to be ever supported
- **?** - not yet supported (unsure of future support)
- **W** - on the wish list
- **--W** - on the wish list, likely to be css property only
- **Y** - supported to some degree
- **ahx-*** - supported via attribute (_ahx-*_) or css property (_--ahx-*_)
- **--ahx-*** - supported via css property only

## Core Attributes

| htmx          | ahx             | Notes             |
| ------------- | --------------- | ----------------- |
| hx-boost      | N               |                   |
| hx-get        | ahx-get         |                   |
| hx-post       | ahx-post        |                   |
| hx-on         | N               | no scripting      |
| hx-push-url   | N               |                   |
| hx-select     | ?               |                   |
| hx-select-oob | N               |                   |
| hx-swap       | ahx-swap        |                   |
|               | --ahx-swap-name | name a slot       |
| hx-swap-oob   | ahx-slot        | see below         |
| hx-target     | ahx-target      |                   |
| hx-trigger    | ahx-trigger     | see below         |
| hx-vals       | ?               |                   |
|               | --ahx-import    | import stylesheet |
|               | --ahx-harvest   | harvest a value   |

- **ahx-slot** - this is an alternative to _hx-swap-oob_ that restrains the
  ability to just inject content anyway. The named slot must have been declared
  via `<slot>` element or `--ahx-slot-name` property in a CSS rule.
- **ahx-trigger** - this is explicitly required, so that the behaviour is clear
  to an auditor.

## Additional Attributes

| htmx           | ahx         | Notes          |
| -------------- | ----------- | -------------- |
| hx-confirm     | ?           |                |
| hx-delete      | ahx-delete  |                |
| hx-disable     | ?           |                |
| hx-disinherit  | N           | no inheritance |
| hx-encoding    | ?           |                |
| hx-ext         | N           | no extensions  |
| hx-headers     | --W         |                |
| hx-history     | N           |                |
| hx-history-elt | ?           |                |
| hx-include     | ahx-include | see below      |
| hx-params      | ?           |                |
| hx-preserve    | ?           |                |
| hx-prompt      | ?           |                |
| hx-put         | ahx-put     |                |
| hx-replace-url | N           |                |
| hx-request     | N           |                |
| hx-sse         | N           |                |
| hx-sync        | ?           |                |
| hx-validate    | ?           |                |
| hx-vars        | N           | no scripting   |
| hx-ws          | N           |                |

- **ahx-include**: targets a form or element with internal `FormData` atm.

## Trigger Modifiers

| htmx          | ahx | Notes                   |
| ------------- | --- | ----------------------- |
| once          | Y   |                         |
| changed       | ?   |                         |
| delay         | W   |                         |
| throttle      | W   |                         |
| from          | N   | see below               |
| target        | N   | see below               |
| consume       | N   | listens on the document |
| queue         | ?   |                         |
| every         | ?   |                         |
| [_condition_] | N   | no scripting            |

- **from**/**target** - this functionality can be achieved with CSS rules
  instead

## Special Events

| htmx      | ahx    |
| --------- | ------ |
| load      | Y      |
| revealed  | ?      |
| intersect | ?      |
|           | mutate |

## Swap Styles

| htmx        | ahx            | Notes                  |
| ----------- | -------------- | ---------------------- |
| innerHTML   | inner          | may use morphing swap  |
| outerHTML   | outer          | may use morphing swap  |
| beforebegin | beforeBegin    |                        |
| afterbegin  | afterBegin     |                        |
| beforeend   | beforeEnd      |                        |
| afterend    | afterEnd       |                        |
| none        | none           | default                |
|             | attr _<name>_  | swap into an attribute |
|             | input _<name>_ | swap into an input     |

## Headers

| htmx | ahx |
| ---- | --- |
|      |     |

## Other Features

### Unsupported

- data-ahx-* attributes (N)
- Trigger filters (N) - no scripting permitted
- Request indicators (?) - maybe should be responsibility of host app?
- Morph swaps (?) - inner/outer swap may use idiomorph by default in future
- View transitions (?)
- Synchronization (?)
- CSS transitions (and settling) (?)
- Out of Band Swaps (with arbitrary selectors) - use named slots instead
- Attribute inheritance (N) - makes auditing difficult
- Boosting (N)
- Web Sockets & SSE (?) - maybe desirable
- History (N) - hard to see how this would fit with augmentation
- Extensions (N) - ahx needs to be consistent
- Scripting (N) - can't allow augmentations to execute arbitrary script in the
  main window (potential for sandboxed ServiceWorker based optimizations in
  future though)

### Unique to ahx

- Specify attributes as CSS properties to apply controls dynamically
- Import new stylesheets on demand
- React to changes outside of ahx via a MutationObserver, automatically wiring
  up controls
- Harvest values from element attributes or properties (or just a static value),
  as an action similar to a request
- Swap into attributes or input element values, or into an internal `FormData`
  on an element
- Ownership model - all elements have an associated owner, which the host app
  can use to aid allow/deny of operations
