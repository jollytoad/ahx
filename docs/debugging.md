# Debugging and inspection

**ahx** exposes a number of function from the global `ahx` variable to aid
debugging and inspection of the _ahx_ internals.

## `ahx.eventsAll()`

Logs all _ahx_ events to the console.

## `ahx.eventsNone()`

Stop logging events.

## `ahx.internals()`

_ahx_ uses a `WeakMap` to hold additional information against DOM objects, so as
not to pollute the objects or conflict with other libraries.

This function log all of these objects that have internal _ahx_ properties,
along with the set of properties.

## `ahx.elements()`

Logs all elements targetted by _ahx_ either directly via attributes, or matching
a CSS rule that has _ahx_ properties.

## `ahx.triggers()`

Logs all elements that have an _ahx_ trigger, along with details of the event
type of the trigger, the action, and the origin of the trigger (ie. from element
attributes or CSS rule).

## `ahx.owners()`

Logs all elements and their 'owner', which is the URL of the stylesheet that was
ultimately responsible for the element being added to the page.
