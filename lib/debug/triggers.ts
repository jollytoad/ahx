import { isDenied } from "../handle_trigger.ts";
import { internalEntries } from "../internal.ts";
import type {
  ActionRequestSpec,
  EventType,
  Trigger,
  TriggerOrigin,
} from "../types.ts";
import { comparePosition } from "./compare_position.ts";

export function triggers(verbose = false) {
  console.group("AHX Triggers");

  const elements = new Map<Element, Map<Trigger, TriggerOrigin>>();

  function addOrigin(elt: Element, origin: TriggerOrigin, trigger: Trigger) {
    if (!elements.has(elt)) {
      elements.set(elt, new Map());
    }
    elements.get(elt)!.set(trigger, origin);
  }

  for (const [origin, key, trigger] of internalEntries()) {
    if (key.startsWith("trigger:")) {
      if (origin instanceof Element) {
        addOrigin(origin, origin, trigger as Trigger);
      } else if (origin instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(origin.selectorText)) {
          if (node instanceof Element) {
            addOrigin(node, origin, trigger as Trigger);
          }
        }
      }
    }
  }

  const orderedElements = [...elements.keys()].sort(comparePosition);

  for (const elt of orderedElements) {
    const triggers = elements.get(elt) ?? [];
    const events = new Set<EventType>();
    const denied = isDenied(elt);

    for (const [{ trigger }] of triggers) {
      events.add(trigger.eventType);
    }

    console.groupCollapsed(
      "%o : %c%s",
      elt,
      denied ? "text-decoration: line-through; color: grey" : "color: red",
      [...events].join(", "),
    );

    for (const [{ trigger, action }, origin] of triggers) {
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
        // TODO: Adapt output for different action types
        const originRep = origin instanceof Element
          ? "element"
          : origin.cssText;
        console.log(
          "%c%s%c -> %c%s %s%c from: %c%s%c",
          "color: red; font-weight: bold",
          trigger.eventType,
          "color: inherit; font-weight: normal",
          "color: green",
          (action as ActionRequestSpec).method?.toUpperCase(),
          (action as ActionRequestSpec).url,
          "color: inherit",
          "color: lightblue",
          originRep,
          "color: inherit",
        );
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}
