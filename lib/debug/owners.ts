import { getInternal, internalEntries } from "../util/internal.ts";
import { comparePosition } from "./compare_position.ts";

export function owners() {
  console.group("AHX Ownership");

  const elements = new Set<Element>();

  for (const [object, key, owner] of internalEntries()) {
    if (object instanceof Element) {
      elements.add(object);
    } else if (key === "owner") {
      if (object instanceof CSSRule) {
        console.log("%o -> %s", object.cssText, owner);
      } else {
        console.log("%o -> %s", object, owner);
      }
    }
  }

  for (const elt of [...elements].sort(comparePosition)) {
    const owner = getInternal(elt, "owner");
    console.log("%o -> %s", elt, owner ?? "none");
  }

  console.groupEnd();
}
