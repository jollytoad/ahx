import type { ApplyValueDetail, ValueRuleDetail } from "./types.ts";
import { getInternal } from "./internal.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import { querySelectorExt } from "./query_selector.ts";
import { getOwner } from "./owner.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { parseTarget } from "./parse_target.ts";
import { applyValue } from "./apply_value.ts";

export function applyValueRule(elt: Element, rule: CSSStyleRule) {
  const newValue = parseCssValue({ elt, rule, prop: "value" }).value;
  if (newValue) {
    const oldValue = getInternal(elt, "values", () => new WeakMap()).get(rule);

    if (newValue !== oldValue) {
      const targetSpec = parseTarget(elt, rule);
      const target = querySelectorExt(elt, targetSpec?.query);

      const detail: ValueRuleDetail = {
        ...targetSpec,
        target,
        oldValue,
        newValue,
        sourceOwner: getOwner(elt),
        targetOwner: target ? getOwner(target) : undefined,
        ruleOwner: getOwner(rule),
      };

      if (dispatchBefore(elt, "applyValueRule", detail)) {
        getInternal(elt, "values", () => new WeakMap()).set(
          rule,
          detail.newValue,
        );

        if (hasTarget(detail)) {
          applyValue({ ...detail });
        }

        dispatchAfter(elt, "applyValueRule", detail);
      }
    }
  }
}

function hasTarget(detail: ValueRuleDetail): detail is ApplyValueDetail {
  return !!detail.query && !!detail.target && !!detail.type && !!detail.name;
}
