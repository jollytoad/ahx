import { objectsWithInternal } from "./internal.ts";

export function findSlots(
  name: string,
  selector: string | undefined,
  root: ParentNode,
): Element[] {
  let slots: Element[] = [];

  for (const [thing, slotNames] of objectsWithInternal("slotName")) {
    if (slotNames.has(name)) {
      if (thing instanceof Element) {
        slots.push(thing);
      } else if (thing instanceof CSSStyleRule) {
        slots.push(...root.querySelectorAll(thing.selectorText));
      }
    }
  }

  if (selector) {
    slots = slots.filter((slot) => slot.matches(selector));
  }

  return slots;
}
