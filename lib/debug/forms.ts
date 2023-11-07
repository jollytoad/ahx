import { isRuleEnabled } from "../util/rules.ts";
import {
  getInternal,
  internalEntries,
  objectsWithInternal,
} from "../util/internal.ts";
import { comparePosition } from "./compare_position.ts";
import type { ActionType, ControlSpec } from "../types.ts";
import { parseTarget } from "../parse_target.ts";

export function forms() {
  console.group("ahx form...");

  const elements = new Set<Element>();

  for (const [elt] of objectsWithInternal("formData")) {
    if (elt instanceof Element) {
      elements.add(elt);
    }
  }

  for (const [rule] of getControlRulesByAction("harvest")) {
    for (const elt of document.querySelectorAll(rule.selectorText)) {
      const target = parseTarget(elt, rule);
      if (target instanceof Element) {
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

function* getControlRulesByAction(
  type: ActionType,
): Iterable<[CSSStyleRule, ControlSpec]> {
  for (const [rule, key, control] of internalEntries()) {
    if (
      key.startsWith("control:") && rule instanceof CSSStyleRule &&
      typeof control === "object" && "action" in control &&
      control.action.type === type && isRuleEnabled(rule)
    ) {
      yield [rule, control as ControlSpec];
    }
  }
}
