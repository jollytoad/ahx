# Comparison to htmx features

Shows which features from htmx are included or not in ahx,
along with differences.

This is a work in progress and may not currently reflect reality.

## Core Attributes

| Attribute     | Ahx? |
| ------------- | ---- |
| hx-boost      | N    |
| hx-get        | Y    |
| hx-post       | Y    |
| hx-on         | N    |
| hx-push-url   | N    |
| hx-select     | ?    |
| hx-select-oob | ?    |
| hx-swap       | Y    |
| hx-swap-oob   | ?    |
| hx-target     | Y    |
| hx-trigger    | Y    |
| hx-vals       | Y    |

## Additional Attributes

| Attribute      | Ahx? |
| -------------- | ---- |
| hx-confirm     | ?    |
| hx-delete      | Y    |
| hx-disable     | ?    |
| hx-disinherit  | N    |
| hx-encoding    | ?    |
| hx-ext         | N    |
| hx-headers     | ?    |
| hx-history     | N    |
| hx-history-elt | ?    |
| hx-include     | ?    |
| hx-params      | ?    |
| hx-preserve    | ?    |
| hx-prompt      | ?    |
| hx-put         | Y    |
| hx-replace-url | ?    |
| hx-request     | ?    |
| hx-sse         | N    |
| hx-sync        | ?    |
| hx-validate    | ?    |
| hx-vars        | ?    |
| hx-ws          | N    |

## Trigger Modifiers

| Modifier    | Ahx? |
| ----------- | ---- |
| once        | Y    |
| changed     | ?    |
| delay       | Y    |
| throttle    | Y    |
| from        | ?    |
| target      | ?    |
| consume     | N    |
| queue       | ?    |
| every       | ?    |
| [condition] | N    |

## Special Events

| Event     | Ahx? |
| --------- | ---- |
| load      | Y    |
| revealed  | N    |
| intersect | N    |

## Headers

| Header |
| ------ |
|        |

## Other Features

### Unsupported

- data-ahx-* attributes
- Trigger filters
- Special events: `revealed`, `intersect` (`load` is supported)
- Polling using `every`, although `load delay:1s` style polling is supported
- Request indicators
- Extended CSS selectors
- Morph swaps (maybe Idiomorph will become the default swap)
- View transitions
- Synchronization
- CSS transitions (and settling)
- Out of Band Swaps (???)
- Attribute inheritance
- Boosting
- Web Sockets & SSE
- History
- Extensions
- Scripting
