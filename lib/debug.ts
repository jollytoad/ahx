import { config } from "./config.ts";
import { isInLayer } from "./find_style_rules.ts";
import { getRules } from "./rules.ts";
import type { AhxRule, AhxTriggerRule } from "./types.ts";

export function logRules() {
  console.group("AHX Rules");
  for (const rule of getRules()) {
    const origin = rule.origin.deref();
    const layer = origin instanceof CSSRule && isInLayer(origin, config.prefix)
      ? "ahx"
      : "";

    if (isTriggerRule(rule)) {
      const { eventType, ...trigger } = rule.trigger;
      console.log("trigger", eventType, layer, origin, trigger, rule.action);
    } else {
      const { origin: _, ...props } = rule;
      console.log("guard", props, layer, origin);
    }
  }
  console.groupEnd();
}

function isTriggerRule(rule: AhxRule): rule is AhxTriggerRule {
  return "trigger" in rule;
}
