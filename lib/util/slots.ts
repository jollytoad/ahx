import { objectsWithInternal } from "./internal.ts";

export function findSlots(query: string, root: ParentNode): Element[] {
  const [name, selector] = splitQuery(query);
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

function splitQuery(query: string) {
  const spaceIndex = query.indexOf(" ");
  if (spaceIndex === -1) {
    return [query, ""];
  } else {
    return [query.substring(0, spaceIndex), query.substring(spaceIndex + 1)];
  }
}
