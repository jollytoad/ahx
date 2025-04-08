import type { AttrFeature, Context } from "@ahx/types";
import { isElement } from "@ahx/common/guards.ts";

export function* onReadyAttrDetector(
  node: unknown,
  context?: Context,
): Iterable<AttrFeature> {
  if (isElement(node)) {
    const value = node.getAttribute("on-ready");
    if (value) {
      yield {
        kind: "attr",
        context,
        element: node,
        name: "on-ready",
        value,
        bindings: [["on", "ready"], ["on"]],
      };
    }
  }
}

export default onReadyAttrDetector;
