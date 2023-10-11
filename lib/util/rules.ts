export function isRuleEnabled(rule: CSSStyleRule): boolean {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}
