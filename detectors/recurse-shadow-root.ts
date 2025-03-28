import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseShadowRoot(
  node: unknown,
  _context?: Context,
): Iterable<RecurseFeature> {
  const shadow = node instanceof ShadowRoot
    ? node
    : node instanceof Element && node.shadowRoot
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
