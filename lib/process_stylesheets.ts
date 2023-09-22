import { config } from "./config.ts";
import { processStyleRule } from "./process_style_rule.ts";
import { findStyleRules } from "./find_style_rules.ts";
import { processCssImports } from "./process_css_imports.ts";
import { createPseudoElements } from "./create_pseudo_elements.ts";
import { triggerAfterEvent, triggerBeforeEvent } from "./trigger_event.ts";
import type { ProcessStyleSheetsDetail } from "./types.ts";

export function processStyleSheets(root: DocumentOrShadowRoot & EventTarget) {
  let hasToggledImports = false;
  let loop = 0;

  const detail: ProcessStyleSheetsDetail = {
    cssRules: findStyleRules(root),
  };

  const addedRules = [];

  if (!triggerBeforeEvent(root, "processStyleSheets", detail)) {
    return;
  }

  do {
    const cssRules = detail.cssRules;

    if (!cssRules) {
      return;
    }

    console.debug("processStyleSheets loop:", loop);

    let hasNewImports = false;

    for (const [rule, props] of cssRules) {
      switch (processCssImports(rule, props)) {
        case "created":
          hasNewImports = true;
          break;
        case "enabled":
        case "disabled":
          hasToggledImports = true;
          break;
      }
    }

    if (hasNewImports) {
      // Abort further processing, allowing new stylesheets to be loaded
      // Css rules will be re-applied once new stylesheets have loaded
      return;
    }

    for (const [rule] of cssRules) {
      createPseudoElements(rule);
    }

    for (const [rule, props] of cssRules) {
      addedRules.push(...processStyleRule(rule, props));
    }

    loop++;
  } while (loop < config.maxLoopCount && hasToggledImports);

  triggerAfterEvent(document, "processStyleSheets", {
    ...detail,
    addedRules,
    removedRules: [],
  });

  if (loop === config.maxLoopCount) {
    console.error("ahx css rules: exceeded maximum loop count", loop);
  }
}
