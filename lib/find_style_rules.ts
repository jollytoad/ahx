import { getAhxCSSPropertyNames } from "./names.ts";
import type { AhxCSSPropertyName } from "./types.ts";

export function findStyleRules(
  root: DocumentOrShadowRoot | LinkStyle,
): Map<CSSStyleRule, Set<AhxCSSPropertyName>> {
  const cssRules = new Map<CSSStyleRule, Set<AhxCSSPropertyName>>();

  function fromStylesheet(stylesheet: CSSStyleSheet) {
    if (!stylesheet.disabled) {
      try {
        fromRules(stylesheet.cssRules);
      } catch {
        // Skip SecurityError
      }
    }
  }

  function fromRules(rules: CSSRuleList) {
    for (const rule of rules) {
      if (rule instanceof CSSImportRule && rule.styleSheet) {
        fromStylesheet(rule.styleSheet);
      } else if (rule instanceof CSSGroupingRule) {
        fromRules(rule.cssRules);
      } else if (rule instanceof CSSStyleRule) {
        fromStyleRule(rule);
      }
    }
  }

  function fromStyleRule(rule: CSSStyleRule) {
    const props = getAhxCSSPropertyNames(rule);
    if (props.size > 0) {
      cssRules.set(rule, props);
    }
  }

  if ("sheet" in root && root.sheet) {
    fromStylesheet(root.sheet);
  } else if ("styleSheets" in root) {
    for (const stylesheet of root.styleSheets) {
      fromStylesheet(stylesheet);
    }
  }

  return cssRules;
}
