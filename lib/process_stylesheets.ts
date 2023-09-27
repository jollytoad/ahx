import { processTriggerRule } from "./process_trigger_rule.ts";
import { findStyleRules } from "./find_style_rules.ts";
import { processCssImports } from "./process_css_imports.ts";
import { createPseudoElements } from "./create_pseudo_elements.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { ProcessStyleSheetsDetail } from "./types.ts";
import { processGuardRule } from "./process_guard_rule.ts";

export function processStyleSheets(root: DocumentOrShadowRoot & EventTarget) {
  const detail: ProcessStyleSheetsDetail = {
    cssRules: findStyleRules(root),
  };

  const addedRules = [];

  if (triggerBeforeEvent(root, "processStyleSheets", detail)) {
    const cssRules = detail.cssRules;

    if (!cssRules) {
      return;
    }

    for (const [rule, props] of cssRules) {
      processCssImports(rule, props, () => {
        processStyleSheets(root);
      });
    }

    for (const [rule, props] of cssRules) {
      addedRules.push(...processGuardRule(rule, props));
    }

    for (const [rule] of cssRules) {
      createPseudoElements(rule);
    }

    for (const [rule, props] of cssRules) {
      addedRules.push(...processTriggerRule(rule, props));
    }

    triggerAfterEvent(document, "processStyleSheets", {
      ...detail,
      addedRules,
      removedRules: [],
    });
  }
}
