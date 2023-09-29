import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { getAhxCSSPropertyNames } from "./names.ts";
import { processTriggers } from "./process_triggers.ts";
import { processGuards } from "./process_guards.ts";
import { createPseudoElements } from "./create_pseudo_elements.ts";
import { getInternal, setInternal } from "./internal.ts";

export function processRule(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName> = getAhxCSSPropertyNames(rule),
) {
  if (props.size) {
    const owner = getInternal(rule, "owner") ?? (
      rule.parentStyleSheet
        ? getInternal(rule.parentStyleSheet, "owner") ??
          rule.parentStyleSheet.href ?? undefined
        : undefined
    );

    const detail = { rule, props, owner };

    // TODO: consider whether we should just NOT process
    // any rule that doesn't have an associated node
    const target = rule.parentStyleSheet?.ownerNode ?? document;

    if (dispatchBefore(target, "processRule", detail)) {
      if (detail.owner) {
        setInternal(rule, "owner", detail.owner);
      }

      processGuards(rule, props);
      createPseudoElements(rule);
      processTriggers(rule, "default");

      dispatchAfter(target, "processRule", detail);
    }
  }
}
