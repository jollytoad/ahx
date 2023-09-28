import { getInternal, objectsWithInternal } from "../internal.ts";
import type { EventType, TriggerOrigin } from "../types.ts";
import { comparePosition } from "./compare_position.ts";

export function triggers(verbose = false) {
  console.group("AHX Triggers");

  const elements = new Map<Element, Set<TriggerOrigin>>();

  function addOrigin(elt: Element, origin: TriggerOrigin) {
    if (!elements.has(elt)) {
      elements.set(elt, new Set());
    }
    elements.get(elt)!.add(origin);
  }

  for (const [origin] of objectsWithInternal("triggers")) {
    if (origin instanceof Element) {
      addOrigin(origin, origin);
    } else if (origin instanceof CSSStyleRule) {
      for (const node of document.querySelectorAll(origin.selectorText)) {
        if (node instanceof Element) {
          addOrigin(node, origin);
        }
      }
    }
  }

  const orderedElements = [...elements.keys()].sort(comparePosition);

  for (const elt of orderedElements) {
    const origins = elements.get(elt) ?? [];
    const events = new Set<EventType>();

    for (const origin of origins) {
      const triggers = getInternal(origin, "triggers")!;
      for (const eventType of triggers.keys()) {
        events.add(eventType);
      }
    }
    console.groupCollapsed(elt, ...events);

    for (const origin of origins) {
      const triggers = getInternal(origin, "triggers")!;
      for (const { trigger, action } of triggers.values()) {
        if (verbose) {
          console.log(
            "trigger:",
            trigger,
            "action:",
            action,
            "origin:",
            origin,
          );
        } else {
          const originRep = origin instanceof Element
            ? "element"
            : origin.cssText;
          console.log(
            "%c%s%c -> %c%s %s%c from: %c%s%c",
            "color: red; font-weight: bold",
            trigger.eventType,
            "color: inherit; font-weight: normal",
            "color: green",
            action.method.toUpperCase(),
            action.url,
            "color: inherit",
            "color: blue",
            originRep,
            "color: inherit",
          );
        }
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}
