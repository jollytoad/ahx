import { objectsWithInternal } from "./internal.ts";

export function findSlot(name: string, root: ParentNode) {
  for (const [rule, slotNames] of objectsWithInternal("slotName")) {
    if (rule instanceof CSSStyleRule) {
      if (slotNames.has(name)) {
        const slot = root.querySelector(rule.selectorText);
        if (slot) {
          return slot;
        }
      }
    }
  }

  for (const slot of root.querySelectorAll(`slot[name]`)) {
    if (name === slot.getAttribute("name")) {
      return slot;
    }
  }
}
