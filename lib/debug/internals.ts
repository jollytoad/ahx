import { internalEntries } from "../internal.ts";

export function internals() {
  console.group("AHX Internal Properties");

  let groupObject: unknown;
  for (const [object, key, value] of internalEntries()) {
    if (object !== groupObject) {
      if (groupObject) {
        console.groupEnd();
      }

      const representation = object instanceof CSSRule
        ? object.cssText
        : object;

      console.groupCollapsed(representation);
      console.dir(object);

      if (object instanceof CSSStyleRule) {
        // console.groupCollapsed('matched nodes...');
        for (const node of document.querySelectorAll(object.selectorText)) {
          console.log(node);
        }
        // console.groupEnd();
      }

      groupObject = object;
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
