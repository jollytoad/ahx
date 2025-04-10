import type { Context, ObserveFeature } from "@ahx/types";
import { isElement, isShadowRoot } from "@ahx/common/guards.ts";

export function* observeShadowRoot(
  node: unknown,
  _context?: Context,
): Iterable<ObserveFeature> {
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
