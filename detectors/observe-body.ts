import type { Context, ObserveFeature } from "@ahx/types";

export function* observeBody(
  node: unknown,
  _context?: Context,
): Iterable<ObserveFeature> {
  if (node instanceof Element && node.localName === "body") {
    yield {
      kind: "observe",
      context: node,
      bindings: [[node.localName]],
    };
  }
}

export default observeBody;
