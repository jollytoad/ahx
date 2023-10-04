import { parseAttrValue } from "../parse_attr_value.ts";
import { internalEntries } from "../internal.ts";
import type { AhxName } from "../types.ts";
import { comparePosition } from "./compare_position.ts";

export function elements(ahxProp?: AhxName) {
  console.group("AHX Elements");

  const elements = new Set<Element>();
  const rules = new Set<CSSStyleRule>();

  for (const [object] of internalEntries()) {
    if (object instanceof Element) {
      elements.add(object);
    } else if (object instanceof CSSStyleRule) {
      rules.add(object);
    }
  }

  for (const rule of rules) {
    for (const node of document.querySelectorAll(rule.selectorText)) {
      if (node instanceof Element) {
        elements.add(node);
      }
    }
  }

  for (const elt of [...elements].sort(comparePosition)) {
    if (ahxProp) {
      const { value } = parseAttrValue(elt, ahxProp);
      if (value) {
        console.log(elt, value);
      }
    } else {
      console.log(elt);
    }
  }

  console.groupEnd();
}
