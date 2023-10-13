import { isDenied } from "../handle_trigger.ts";
import { internalEntries } from "../util/internal.ts";
import type { ControlDecl, ControlSpec, EventType } from "../types.ts";
import { comparePosition } from "./compare_position.ts";

export function controls(verbose = false) {
  console.group("ahx controls...");

  const elements = new Map<Element, Map<ControlSpec, ControlDecl>>();

  function addControl(
    elt: Element,
    ctlDecl: ControlDecl,
    ctlSpec: ControlSpec,
  ) {
    if (!elements.has(elt)) {
      elements.set(elt, new Map());
    }
    elements.get(elt)!.set(ctlSpec, ctlDecl);
  }

  for (const [ctlDecl, key, ctlSpec] of internalEntries()) {
    if (key.startsWith("control:")) {
      if (ctlDecl instanceof Element) {
        addControl(ctlDecl, ctlDecl, ctlSpec as ControlSpec);
      } else if (ctlDecl instanceof CSSStyleRule) {
        for (const node of document.querySelectorAll(ctlDecl.selectorText)) {
          if (node instanceof Element) {
            addControl(node, ctlDecl, ctlSpec as ControlSpec);
          }
        }
      }
    }
  }

  const orderedElements = [...elements.keys()].sort(comparePosition);

  for (const elt of orderedElements) {
    const controls = elements.get(elt) ?? [];
    const events = new Set<EventType>();
    const denied = isDenied(elt);

    for (const [{ trigger }] of controls) {
      events.add(trigger.eventType);
    }

    console.groupCollapsed(
      "%o : %c%s",
      elt,
      denied ? "text-decoration: line-through; color: grey" : "color: red",
      [...events].join(", "),
    );

    for (const [{ trigger, action, swap }, control] of controls) {
      if (verbose) {
        console.log(
          "trigger:",
          trigger,
          "action:",
          action,
          "swap:",
          swap,
          "control:",
          control,
        );
      } else {
        const ctlRep = control instanceof Element ? "element" : control.cssText;

        const actionRep = "method" in action
          ? `${action.method.toUpperCase()} ${action.url}`
          : action.type;

        const swapRep = (swap.swapStyle ?? "default") +
          (swap.itemName ? ` ${swap.itemName}` : "");

        console.log(
          "%c%s%c -> %c%s%c -> %c%s%c from: %c%s%c",
          "color: red; font-weight: bold",
          trigger.eventType,
          "color: inherit; font-weight: normal",
          "color: green",
          actionRep,
          "color: inherit",
          "color: darkorange",
          swapRep,
          "color: inherit",
          "color: hotpink",
          ctlRep,
          "color: inherit",
        );
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
}
