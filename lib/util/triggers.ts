import type { EventType, Trigger } from "../types.ts";
import { getInternal, objectsWithInternal } from "./internal.ts";
import { isRuleEnabled } from "./rules.ts";

export function* getTriggersFromElements(
  eventType: EventType,
  root: Element,
  recursive: boolean,
): Iterable<[Element, Trigger]> {
  const trigger = getInternal(root, `trigger:${eventType}`);

  if (trigger) {
    yield [root, trigger];
  }

  if (recursive) {
    for (const [elt, trigger] of objectsWithInternal(`trigger:${eventType}`)) {
      if (
        elt instanceof Element && root.compareDocumentPosition(elt) &
          Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        yield [elt, trigger];
      }
    }
  }
}

export function* getTriggersFromRules(
  eventType: EventType,
  root: Element,
  recursive: boolean,
): Iterable<[Element, CSSStyleRule, Trigger]> {
  for (const [rule, trigger] of objectsWithInternal(`trigger:${eventType}`)) {
    if (trigger && rule instanceof CSSStyleRule && isRuleEnabled(rule)) {
      // ... that match the element
      if (root.matches(rule.selectorText)) {
        yield [root, rule, trigger];
      }

      // ... on all sub-elements that match the selector
      if (recursive) {
        for (const elt of root.querySelectorAll(rule.selectorText)) {
          yield [elt, rule, trigger];
        }
      }
    }
  }
}
