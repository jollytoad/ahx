
import { isElement, isShadowRoot } from "@ahx/common/guards.js";

export function* recurseShadowRoot(
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
      kind: "recurse",
      context: shadow,
      children: shadow.childNodes,
    };
  }
}

export default recurseShadowRoot;
