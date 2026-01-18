
import { isElement } from "@ahx/common/guards.js";

export function* observeHtml(
  node,
  context,
) {
  if (isElement(node) && node.localName === "html") {
    yield {
      kind: "observe",
      context,
      node,
      bindings: [["html"]],
    };
  }
}

export default observeHtml;
