
import { isElement, isShadowRoot } from "@ahx/common/guards.js";

export function* observeShadowRoot(
  node,
  _context,
) {
  const shadow = isShadowRoot(node)
    ? node
    : isElement(node) && node.shadowRoot
    ? node.shadowRoot
    : null;

  if (shadow) {
    yield {
      kind: "observe",
      context: shadow,
      node: shadow,
      bindings: [["shadow"]],
    };
  }
}

export default observeShadowRoot;
