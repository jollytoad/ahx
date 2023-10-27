import { objectsWithInternal } from "../util/internal.ts";
import { comparePosition } from "./compare_position.ts";

export function slots() {
  console.group("ahx slots...");

  const slots = new Map<Element, Set<string>>();

  function addSlot(elt: Element, names: Set<string>) {
    const nameSet = slots.get(elt) ??
      slots.set(elt, new Set<string>()).get(elt)!;
    names.forEach((name) => nameSet.add(name));
  }

  for (const [thing, slotNames] of objectsWithInternal("slotName")) {
    if (thing instanceof Element) {
      addSlot(thing, slotNames);
    } else if (thing instanceof CSSStyleRule) {
      const slot = document.querySelector(thing.selectorText);
      if (slot) {
        addSlot(slot, slotNames);
      }
    }
  }

  for (const elt of [...slots.keys()].sort(comparePosition)) {
    console.log(elt, ...slots.get(elt)!);
  }

  console.groupEnd();
}
