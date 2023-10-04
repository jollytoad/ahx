import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { hasAhxAttributes } from "./names.ts";
import { getOwner, setOwner } from "./owner.ts";
import { processTriggers } from "./process_triggers.ts";
import { applyValueRule, getValueRules } from "./process_value.ts";

export function processElement(elt: Element) {
  const valueRules: CSSStyleRule[] = [];

  for (const rule of getValueRules()) {
    if (elt.matches(rule.selectorText)) {
      valueRules.push(rule);
    }
  }

  if (valueRules.length || hasAhxAttributes(elt)) {
    const detail = {
      owner: getOwner(elt),
    };

    if (dispatchBefore(elt, "processElement", detail)) {
      if (detail.owner) {
        setOwner(elt, detail.owner);
      }

      for (const rule of valueRules) {
        applyValueRule(elt, rule);
      }

      processTriggers(elt, "click");

      dispatchAfter(elt, "processElement", detail);
    }
  }
}
