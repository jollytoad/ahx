import { isRuleEnabled } from "../util/rules.ts";
import {
  getInternal,
  internalEntries,
  objectsWithInternal,
} from "../util/internal.ts";
import { parseCssValue } from "../parse_css_value.ts";
import { querySelectorExt } from "../util/query_selector.ts";
import { comparePosition } from "./compare_position.ts";
import type { ActionType, Trigger } from "../types.ts";

export function forms() {
  console.group("AHX Forms");

  const elements = new Set<Element>();

  for (const [elt] of objectsWithInternal("formData")) {
    if (elt instanceof Element) {
      elements.add(elt);
    }
  }

  for (const [rule] of getTriggerRulesByAction("harvest")) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const targetQuery = parseCssValue("target", rule, elt).join(" ") ||
        "this";
      const target = querySelectorExt(elt, targetQuery);
      if (target) {
        elements.add(target);
      }
    }
  }

  for (const elt of [...elements].sort(comparePosition)) {
    const formData = elt instanceof HTMLFormElement
      ? new FormData(elt)
      : getInternal(elt, "formData");

    if (formData) {
      console.group(elt);

      for (const [name, value] of formData ?? []) {
        console.log("%s: %c%s", name, "font-weight: bold", value);
      }

      console.groupEnd();
    }
  }

  console.groupEnd();
}

function* getTriggerRulesByAction(
  type: ActionType,
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
