import type { Context, RecurseFeature } from "@ahx/types";

export function* recurseShadowRoot(
  node: unknown,
  _context?: Context,
): Iterable<RecurseFeature> {
  if (node instanceof Element && node.shadowRoot) {
    yield {
      kind: "recurse",
      context: node.shadowRoot,
      children: node.shadowRoot.childNodes,
    };
  }
}

export default recurseShadowRoot;
