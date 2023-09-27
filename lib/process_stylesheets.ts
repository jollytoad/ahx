import { findStyleRules } from "./find_style_rules.ts";
import { processCssImports } from "./process_css_imports.ts";
import { dispatchAfter, dispatchBefore } from "./dispatch.ts";
import type { ProcessStyleSheetsDetail } from "./types.ts";
import { processRule } from "./process_rule.ts";

export function processStyleSheets(root: DocumentOrShadowRoot & EventTarget) {
  const detail: ProcessStyleSheetsDetail = {
    cssRules: findStyleRules(root),
  };

  if (dispatchBefore(root, "processStyleSheets", detail)) {
    const cssRules = detail.cssRules;

    if (!cssRules) {
      return;
    }

    // TODO: Perform this in processRule
    for (const [rule, props] of cssRules) {
      processCssImports(rule, props, () => {
        processStyleSheets(root);
      });
    }

    for (const [rule, props] of cssRules) {
      processRule(rule, props);
    }

    dispatchAfter(document, "processStyleSheets", detail);
  }
}
