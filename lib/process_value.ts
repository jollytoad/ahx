import type { AhxCSSPropertyName } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";
import { setInternal } from "./internal.ts";
import { resolveElement } from "./resolve_element.ts";
import { applyValueRules } from "./apply_value_rules.ts";

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
