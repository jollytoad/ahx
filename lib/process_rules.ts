import { findRules } from "./find_rules.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { processRule } from "./process_rule.ts";

export function processRules(
  root: (DocumentOrShadowRoot | LinkStyle) & EventTarget,
  rules = findRules(root),
) {
  const detail = { rules };

  if (dispatchBefore(root, "processRules", detail)) {
    for (const [rule, props] of detail.rules) {
      processRule(rule, props);
    }

    dispatchAfter(root, "processRules", detail);
  }
}
