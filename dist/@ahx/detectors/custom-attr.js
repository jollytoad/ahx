
import { potentialBindings } from "@ahx/common/potential-bindings.js";
import { isElement } from "@ahx/common/guards.js";

export function* customAttrDetector(
  node,
  context,
) {
  if (isElement(node)) {
    for (const attr of node.attributes) {
      if (attr.name.includes("-")) {
        yield {
          kind: "attr",
          context,
          attr,
          element: node,
          name: attr.name,
          value: attr.value,
          bindings: potentialBindings(attr.name.split("-")),
        };
      }
    }
  }
}

export default customAttrDetector;
