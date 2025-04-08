import type { Context, RecurseFeature } from "@ahx/types";
import { isElement, isShadowRoot } from "@ahx/common/guards.ts";

export function* recurseShadowRoot(
  node: unknown,
  _context?: Context,
): Iterable<RecurseFeature> {
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
