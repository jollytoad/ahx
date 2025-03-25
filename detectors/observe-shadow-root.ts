import type { Context, ObserveFeature } from "@ahx/types";

export function* observeShadowRoot(
  node: unknown,
  _context?: Context,
): Iterable<ObserveFeature> {
  const shadow = node instanceof ShadowRoot
    ? node
    : node instanceof Element && node.shadowRoot
    ? node.shadowRoot
    : null;

  if (shadow) {
    yield {
      kind: "observe",
      context: shadow,
      bindings: [["shadow"]],
    };
  }
}

export default observeShadowRoot;
