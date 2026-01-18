
import { isElement } from "@ahx/common/guards.js";

export function* recurseCSSRules(
  node,
  context,
) {
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
                    return [];
        }
      },
    };
  }
}

export default recurseCSSRules;

function hasCssRules(node) {
  return !!node && typeof node === "object" && "cssRules" in node;
}

function hasStyleSheet(node) {
  return !!node && typeof node === "object" && "styleSheet" in node;
}

function isStyleElement(
  node,
) {
  return (isElement(node, "style") || isElement(node, "link")) &&
    "sheet" in node;
}
