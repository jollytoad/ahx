import type { Context, RecurseFeature } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export function* recurseCSSRules(
  node: unknown,
  context?: Context,
): Iterable<RecurseFeature> {
  const ruleGroup = hasCssRules(node)
    ? node
    : isStyleElement(node)
    ? node.sheet
    : hasStyleSheet(node)
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

function hasCssRules(node: unknown): node is { cssRules: CSSRuleList } {
  return !!node && typeof node === "object" && "cssRules" in node;
}

function hasStyleSheet(node: unknown): node is { styleSheet: CSSStyleSheet } {
  return !!node && typeof node === "object" && "styleSheet" in node;
}

function isStyleElement(
  node: unknown,
): node is Element & { sheet: CSSStyleSheet } {
  return (isElement(node, "style") || isElement(node, "link")) &&
    "sheet" in node;
}
