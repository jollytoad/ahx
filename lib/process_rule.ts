import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { getAhxCSSPropertyNames } from "./names.ts";
import { processTriggers } from "./process_triggers.ts";
import { processGuards } from "./process_guards.ts";
import { createPseudoElements } from "./create_pseudo_elements.ts";
import { setInternal } from "./internal.ts";

export function processRule(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName> = getAhxCSSPropertyNames(rule),
) {
  if (props.size) {
    const owner = rule.parentStyleSheet?.href;
    const detail = { rule, props };
    const target = rule.parentStyleSheet?.ownerNode ?? document;

    if (dispatchBefore(target, "processRule", detail)) {
      if (owner) {
        setInternal(rule, "owner", owner);
      }

      processGuards(rule, props);
      createPseudoElements(rule);
      processTriggers(rule, "default");

      dispatchAfter(target, "processRule", detail);
    }
  }
}
