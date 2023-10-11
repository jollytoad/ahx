import { setInternal } from "./util/internal.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { dispatchError } from "./util/dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { asAhxCSSPropertyName } from "./util/names.ts";

export function processGuards(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName>,
) {
  const prop = asAhxCSSPropertyName("deny-trigger");

  if (props.has(prop)) {
    const { value } = parseCssValue({ rule, prop });
    if (value === "true") {
      setInternal(rule, "denyTrigger", true);
    } else {
      rule.style.removeProperty(prop);
      dispatchError(
        rule.parentStyleSheet?.ownerNode ?? document,
        "invalidCssValue",
        {
          prop,
          value,
          rule,
        },
      );
    }
  }

  return [];
}
