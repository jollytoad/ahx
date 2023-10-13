import { parseAttrValue } from "../parse_attr_value.ts";
import { internalEntries } from "../util/internal.ts";
import type { ControlPropName } from "../types.ts";
import { comparePosition } from "./compare_position.ts";

export function elements(ahxProp?: ControlPropName) {
  console.group("ahx elements...");

  const elements = new Set<Element>();
  const rules = new Set<CSSStyleRule>();

  for (const [thing] of internalEntries()) {
    if (thing instanceof Element) {
      elements.add(thing);
    } else if (thing instanceof CSSStyleRule) {
      rules.add(thing);
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
      const tokens = parseAttrValue(ahxProp, elt);
      if (tokens.length) {
        console.log(elt, ...tokens);
      }
    } else {
      console.log(elt);
    }
  }

  console.groupEnd();
}
