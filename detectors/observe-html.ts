import type { Context, ObserveFeature } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export function* observeHtml(
  node: unknown,
  context?: Context,
): Iterable<ObserveFeature> {
  if (isElement(node, "html")) {
    yield {
      kind: "observe",
      context,
      node,
      bindings: [["html"]],
    };
  }
}

export default observeHtml;
