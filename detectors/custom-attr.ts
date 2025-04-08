import type { AttrFeature, Context } from "@ahx/types";
import { potentialBindings } from "@ahx/common/potential-bindings.ts";
import { isElement } from "@ahx/common/guards.ts";

export function* customAttrDetector(
  node: unknown,
  context?: Context,
): Iterable<AttrFeature> {
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
