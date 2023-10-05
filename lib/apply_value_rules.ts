import { applyValueRule } from "./apply_value_rule.ts";
import { getValueRules } from "./get_value_rules.ts";

export function applyValueRules(root: ParentNode) {
  for (const rule of getValueRules()) {
    for (const elt of root.querySelectorAll(rule.selectorText)) {
      applyValueRule(elt, rule);
    }
  }
}
