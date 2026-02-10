
import { potentialBindings } from "@ahx/common/potential-bindings.js";
import { isElement } from "@ahx/common/guards.js";

export function* customElementDetector(
  node,
  context,
) {
  if (isElement(node) && node.localName.includes("-")) {
    yield {
      kind: "element",
      context,
      element: node,
      name: node.localName,
      bindings: potentialBindings(node.localName.split("-")),
    };
  }
}

export default customElementDetector;
