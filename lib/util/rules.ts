import type { RuleId } from "../types.ts";
import { getInternal, objectsWithInternal } from "./internal.ts";
import { asAhxCSSPropertyName } from "./names.ts";

export function isRuleEnabled(rule: CSSStyleRule): boolean {
  return !!rule.parentStyleSheet && !rule.parentStyleSheet.disabled;
}

// The following are experimental...

export function isRuleApplied(rule: CSSStyleRule, elt: Element): boolean {
  const ruleId = getInternal(rule, "ruleId");
  if (ruleId) {
    const ruleIdProp = asAhxCSSPropertyName(`rule-${ruleId}`);
    const style = getComputedStyle(elt);
    if (style.getPropertyValue(ruleIdProp)) {
      return true;
    }
  }
  return false;
}

let ruleCount = 0;

export function getRuleId(rule: CSSStyleRule): RuleId {
  return getInternal(rule, "ruleId", () => `${++ruleCount}`);
}

export function getRuleById(ruleId: RuleId): CSSStyleRule | undefined {
  // TODO: index rules by id
  for (const [rule, id] of objectsWithInternal("ruleId")) {
    if (ruleId === id && rule instanceof CSSStyleRule) {
      return rule;
    }
  }
}

export function* getAppliedRules(elt: Element): Iterable<CSSStyleRule> {
  const ruleProp = asAhxCSSPropertyName("rule");

  const style = getComputedStyle(elt);

  const primaryId = style.getPropertyValue(ruleProp);

  if (primaryId) {
    const primaryRule = getRuleById(primaryId);
    if (primaryRule) {
      yield primaryRule;
    }

    const ruleIdPrefix = asAhxCSSPropertyName("rule-");

    for (const propName of style) {
      if (propName.startsWith(ruleIdPrefix)) {
        const secondaryId = style.getPropertyValue(propName);
        if (secondaryId !== primaryId) {
          const secondaryRule = getRuleById(secondaryId);
          if (secondaryRule) {
            yield secondaryRule;
          }
        }
      }
    }
  }
}
