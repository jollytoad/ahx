import { internalEntries, objectsWithInternal } from "../internal.ts";
import type { ActionSpec, EventType, Trigger } from "../types.ts";

export function* getTriggerRulesByEvent(
  type: EventType,
): Iterable<[CSSStyleRule, Trigger]> {
  for (const [rule, trigger] of objectsWithInternal(`trigger:${type}`)) {
    if (trigger && rule instanceof CSSStyleRule && isRuleEnabled(rule)) {
      yield [rule, trigger];
    }
  }
}

export function* getTriggerElementsByEvent(
  type: EventType,
): Iterable<[Element, Trigger]> {
  for (const [elt, trigger] of objectsWithInternal(`trigger:${type}`)) {
    if (elt instanceof Element) {
      yield [elt, trigger];
    }
  }
}

export function* getTriggerRulesByAction(
  type: ActionSpec["type"],
): Iterable<[CSSStyleRule, Trigger]> {
  for (const [rule, key, trigger] of internalEntries()) {
    if (
      key.startsWith("trigger:") && rule instanceof CSSStyleRule &&
      typeof trigger === "object" && "action" in trigger &&
      trigger.action.type === type && isRuleEnabled(rule)
    ) {
      yield [rule, trigger as Trigger];
    }
  }
}

export function isRuleEnabled(rule: CSSStyleRule): boolean {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}
