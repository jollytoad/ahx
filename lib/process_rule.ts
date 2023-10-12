import { dispatchAfter, dispatchBefore } from "./util/dispatch.ts";
import type { AhxCSSPropertyName } from "./types.ts";
import { processTriggers } from "./process_triggers.ts";
import { processGuards } from "./process_guards.ts";
import { processPseudoElements } from "./process_pseudo_elements.ts";
import { getOwner, setOwner } from "./util/owner.ts";
import { resolveElement } from "./util/resolve_element.ts";
import { processCssImports } from "./process_css_imports.ts";
import { processRules } from "./process_rules.ts";
import { hasInternal } from "./util/internal.ts";
import { getAhxCSSPropertyNames } from "./util/names.ts";
import { triggerLoad } from "./trigger_load.ts";

export function processRule(
  rule: CSSStyleRule,
  props: Set<AhxCSSPropertyName>,
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

      processCssImports(rule, props, processImportedRules);
      processGuards(rule, props);

      const pseudoRule = processPseudoElements(rule);
      if (pseudoRule) {
        processRule(pseudoRule, getAhxCSSPropertyNames(pseudoRule));
      }

      processTriggers(rule);

      dispatchAfter(target, "processRule", detail);
    }
  }
}

function processStyleSheet(stylesheet: CSSStyleSheet) {
  if (!hasInternal(stylesheet, "owner")) {
    setOwner(stylesheet, stylesheet.href ?? "unknown");
  }
}

function processImportedRules(link: HTMLLinkElement) {
  processRules(link);
  triggerLoad(link.ownerDocument.documentElement);
}
