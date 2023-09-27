import { config } from "./config.ts";
import { parseCssValue } from "./parse_css_value.ts";
import { addTriggerRules } from "./rules.ts";
import { getStyleProps } from "./style_props.ts";
import { parseTriggers } from "./parse_triggers.ts";
import type { ActionSpec, AhxTriggerRule, CSSPropertyName } from "./types.ts";
import { getAhxValue } from "./get_ahx_value.ts";

export function processTriggerRule(
  rule: CSSStyleRule,
  props: Set<CSSPropertyName> = getStyleProps(rule),
): AhxTriggerRule[] {
  const value = getAhxValue(rule, "trigger");
  const triggers = parseTriggers(rule, value, "default");

  const actions = getActionSpecs(rule, props);

  return addTriggerRules(rule, triggers, actions);
}

function getActionSpecs(
  rule: CSSStyleRule,
  props: Set<CSSPropertyName>,
): ActionSpec[] {
  const actionSpecs: ActionSpec[] = [];

  for (const method of config.httpMethods) {
    const prop = `--${config.prefix}-${method}`;
    if (props.has(prop)) {
      const url = parseCssValue({ rule, prop }).value;
      if (url) {
        actionSpecs.push({
          type: "request",
          method,
          url,
        });
      }
    }
  }

  return actionSpecs;
}
