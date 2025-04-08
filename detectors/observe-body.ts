import type { Context, ObserveFeature } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export function* observeBody(
  node: unknown,
  _context?: Context,
): Iterable<ObserveFeature> {
  if (isElement(node) && node.localName === "body") {
    yield {
      kind: "observe",
      context: node,
      bindings: [[node.localName]],
    };
  }
}

export default observeBody;
