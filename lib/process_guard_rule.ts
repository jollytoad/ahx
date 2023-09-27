import { config } from "./config.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { addGuardRule } from "./rules.ts";
import { triggerErrorEvent } from "./trigger_event.ts";
import type { AhxGuardRule, CSSPropertyName } from "./types.ts";

export function processGuardRule(
  rule: CSSStyleRule,
  props: Set<CSSPropertyName>,
): AhxGuardRule[] {
  const prop = `--${config.prefix}-deny-trigger`;

  if (props.has(prop)) {
    const { value } = parseCssValue({ rule, prop });
    if (value === "true") {
      return [addGuardRule(rule, { denyTrigger: true })];
    } else {
      rule.style.removeProperty(prop);
      triggerErrorEvent(
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

export function parseAhxDenyValue(style: CSSStyleDeclaration): string[] {
  return style.getPropertyValue(`--${config.prefix}-deny`).split(/\s+/);
}
