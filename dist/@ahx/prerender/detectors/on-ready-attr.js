
import { isElement } from "@ahx/common/guards.js";

export function* onReadyAttrDetector(
  node,
  context,
) {
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
