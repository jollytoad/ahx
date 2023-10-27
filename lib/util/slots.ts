import { objectsWithInternal } from "./internal.ts";

export function findSlot(name: string, root: ParentNode) {
  for (const [thing, slotNames] of objectsWithInternal("slotName")) {
    if (slotNames.has(name)) {
      if (thing instanceof Element) {
        return thing;
      } else if (thing instanceof CSSStyleRule) {
        const slot = root.querySelector(thing.selectorText);
        if (slot) {
          return slot;
        }
      }
    }
  }
}
