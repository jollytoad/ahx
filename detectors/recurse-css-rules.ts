import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseCSSRules(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature> {
  const ruleGroup =
    node instanceof CSSStyleSheet || node instanceof CSSGroupingRule
      ? node
      : (node instanceof HTMLStyleElement || node instanceof HTMLLinkElement)
      ? node.sheet
      : node instanceof CSSImportRule
      ? node.styleSheet
      : undefined;

  if (ruleGroup) {
    const groupRef = new WeakRef(ruleGroup);
    yield {
      kind: "recurse",
      context,
      get children() {
        try {
          const group = groupRef.deref();
          return group && group.cssRules ? group.cssRules : [];
        } catch {
          // ignore security error
          return [];
        }
      },
    };
  }
}

export default recurseCSSRules;
