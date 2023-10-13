import { internalEntries } from "../util/internal.ts";

export function internals() {
  console.group("ahx internal properties...");

  let groupObject: unknown;
  for (const [thing, key, value] of internalEntries()) {
    if (thing !== groupObject) {
      if (groupObject) {
        console.groupEnd();
      }

      const representation = thing instanceof CSSRule ? thing.cssText : thing;

      console.groupCollapsed(representation);
      console.dir(thing);

      if (thing instanceof CSSStyleRule) {
        // console.groupCollapsed('matched nodes...');
        for (const node of document.querySelectorAll(thing.selectorText)) {
          console.log(node);
        }
        // console.groupEnd();
      }

      groupObject = thing;
    }

    if (value instanceof Map) {
      console.group("%s:", key);
      for (const entry of value) {
        console.log("%c%s:", "font-weight: bold", ...entry);
      }
      console.groupEnd();
    } else {
      console.log("%c%s:", "font-weight: bold", key, value);
    }
  }

  console.groupEnd();
}
