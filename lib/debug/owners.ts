import { getInternal, internalEntries } from "../util/internal.ts";
import { comparePosition } from "./compare_position.ts";

export function owners() {
  console.group("ahx ownership...");

  const elements = new Set<Element>();

  for (const [thing, key, owner] of internalEntries()) {
    if (thing instanceof Element) {
      elements.add(thing);
    } else if (key === "owner") {
      if (thing instanceof CSSRule) {
        console.log("%o -> %s", thing.cssText, owner);
      } else {
        console.log("%o -> %s", thing, owner);
      }
    }
  }

  for (const elt of [...elements].sort(comparePosition)) {
    const owner = getInternal(elt, "owner");
    console.log("%o -> %s", elt, owner ?? "none");
  }

  console.groupEnd();
}
