import type { AhxCSSPropertyName, ValueRuleDetail } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";
import { getInternal, objectsWithInternal, setInternal } from "./internal.ts";
import { resolveElement } from "./resolve_element.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { querySelectorExt } from "./query_selector.ts";
import { parseInput } from "./parse_input.ts";
import { updateForm } from "./update_form.ts";
import { getOwner } from "./owner.ts";
import { parseCssValue } from "./parse_css_value.ts";

export function processValueRule(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName>,
) {
  if (props.has(asAhxCSSPropertyName("value"))) {
    setInternal(rule, "isValueRule", true);

    const document = resolveElement(rule)?.ownerDocument;
    if (document) {
      applyValueRules(document);
    }
  }
}

export function* getValueRules(): Iterable<CSSStyleRule> {
  for (const [rule, isValueRule] of objectsWithInternal("isValueRule")) {
    if (rule instanceof CSSStyleRule && isValueRule) {
      yield rule;
    }
  }
}

export function applyValueRules(root: ParentNode) {
  for (const rule of getValueRules()) {
    for (const elt of root.querySelectorAll(rule.selectorText)) {
      applyValueRule(elt, rule);
    }
  }
}

export function applyValueRule(elt: Element, rule: CSSStyleRule) {
  const newValue = parseCssValue({ elt, rule, prop: "value" }).value;
  if (newValue) {
    const oldValue = getInternal(elt, "value");
    const query = parseCssValue({ elt, rule, prop: "form" }).value;
    const target = querySelectorExt(elt, query);

    if (newValue !== oldValue) {
      const detail: ValueRuleDetail = {
        target,
        ...parseInput(elt),
        oldValue,
        newValue,
        sourceOwner: getOwner(elt),
        targetOwner: target ? getOwner(target) : undefined,
        ruleOwner: getOwner(rule),
      };

      if (dispatchBefore(elt, "applyValueRule", detail)) {
        const { target, inputName, inputModifier, inputSeparator, newValue } =
          detail;

        setInternal(elt, "value", newValue);

        if (target && inputName) {
          updateForm({
            target,
            inputName,
            inputModifier: inputModifier ?? "replace",
            inputSeparator,
            ...detail,
          });
        }

        dispatchAfter(elt, "applyValueRule", detail);
      }
    }
  }
}
