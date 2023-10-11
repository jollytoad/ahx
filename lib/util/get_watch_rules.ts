import { objectsWithInternal } from "./internal.ts";
import type { EventType } from "../types.ts";

export function* getTriggerRules(type: EventType): Iterable<CSSStyleRule> {
  for (const [rule, trigger] of objectsWithInternal(`trigger:${type}`)) {
    if (rule instanceof CSSStyleRule && trigger && isEnabled(rule)) {
      yield rule;
    }
  }
}

function isEnabled(rule: CSSStyleRule): boolean {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}
