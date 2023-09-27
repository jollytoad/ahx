type CSSRulesParent = CSSGroupingRule | CSSStyleSheet;

type OnRule = (parent: CSSRulesParent, rule: CSSRule) => void;

interface PatchOptions {
  onInsertRule?: OnRule;
  onDeleteRule?: OnRule;
}

/**
 * Patch CSS object module to allow monitoring of inserted/deleted rules.
 */
export function patchCSSOM({ onInsertRule, onDeleteRule }: PatchOptions) {
  if (onInsertRule) {
    patchInsertRule(CSSStyleSheet.prototype, onInsertRule);
    patchInsertRule(CSSGroupingRule.prototype, onInsertRule);
  }
  if (onDeleteRule) {
    patchDeleteRule(CSSStyleSheet.prototype, onDeleteRule);
    patchDeleteRule(CSSGroupingRule.prototype, onDeleteRule);
  }
}

/**
 * Patch insertRule method to callback the given onInsertRule function with
 * the newly added rule.
 */
export function patchInsertRule(proto: CSSRulesParent, onInsertRule: OnRule) {
  const originalInsertRule = proto.insertRule;

  proto.insertRule = function insertRule(
    this: CSSRulesParent,
    rule: string,
    index?: number,
  ) {
    const newIndex = originalInsertRule.call(this, rule, index);
    const newRule = this.cssRules[newIndex];
    onInsertRule(this, newRule);
    return newIndex;
  };
}

/**
 * Patch deleteRule method to callback the given onDeleteRule function with
 * the deleted rule.
 */
export function patchDeleteRule(proto: CSSRulesParent, onDeleteRule: OnRule) {
  const originalDeleteRule = proto.deleteRule;

  proto.deleteRule = function deleteRule(this: CSSRulesParent, index: number) {
    const oldRule = this.cssRules[index];
    originalDeleteRule.call(this, index);
    onDeleteRule(this, oldRule);
  };
}
