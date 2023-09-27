import { setInternal } from "./internal.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { dispatchError } from "./dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { asAhxCSSPropertyName } from "./names.ts";

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
