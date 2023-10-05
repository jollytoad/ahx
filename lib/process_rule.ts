import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { getAhxCSSPropertyNames } from "./names.ts";
import { processTriggers } from "./process_triggers.ts";
import { processGuards } from "./process_guards.ts";
import { createPseudoElements } from "./create_pseudo_elements.ts";
import { processValueRule } from "./process_value.ts";
import { getOwner, setOwner } from "./owner.ts";
import { resolveElement } from "./resolve_element.ts";
import { processCssImports } from "./process_css_imports.ts";
import { processRules } from "./process_rules.ts";
import { hasInternal } from "./internal.ts";

export function processRule(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName> = getAhxCSSPropertyNames(rule),
) {
  if (rule.parentStyleSheet) {
    processStyleSheet(rule.parentStyleSheet);
  }

  if (props.size) {
    const owner = getOwner(rule);

    const detail = { rule, props, owner };

    // TODO: consider whether we should just NOT process
    // any rule that doesn't have an associated node
    const target = resolveElement(rule) ?? document;

    if (dispatchBefore(target, "processRule", detail)) {
      if (detail.owner) {
        setOwner(rule, detail.owner);
      }

      processCssImports(rule, props, processRules);
      processGuards(rule, props);
      createPseudoElements(rule);
      processValueRule(rule, props);
      processTriggers(rule, "default");

      dispatchAfter(target, "processRule", detail);
    }
  }
}

function processStyleSheet(stylesheet: CSSStyleSheet) {
  if (!hasInternal(stylesheet, "owner")) {
    setOwner(stylesheet, stylesheet.href ?? "unknown");
  }
}
